/**
 * Cloudflare Worker：期交所即時報價轉發層（含 CORS 標頭）
 * 支援查詢台指期（TX / MTX / TMF）跨月價差複式單、近月、遠月與五檔委買委賣
 */

const TAIFEX_API = "https://mis.taifex.com.tw/futures/api";

export const CONTRACT_CID = {
  TX: "TXF",
  MTX: "MXF",
  TMF: "TMF",
};

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

const round1 = (n) => Math.round(n * 10) / 10;
const round2 = (n) => Math.round(n * 100) / 100;

function parseNum(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function formatDate(raw) {
  if (!raw || raw.length !== 8) return raw || "";
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

function formatTime(raw) {
  if (!raw || raw.length !== 6) return raw || "";
  return `${raw.slice(0, 2)}:${raw.slice(2, 4)}:${raw.slice(4, 6)}`;
}

/** 依台北時間判斷目前盤別（日盤 day / 夜盤 night） */
export function detectTaipeiSession(now = new Date()) {
  const tpe = new Date(now.getTime() + 8 * 3600000);
  const wd = tpe.getUTCDay(); // 0=日 .. 6=六
  const mins = tpe.getUTCHours() * 60 + tpe.getUTCMinutes();

  if (wd >= 1 && wd <= 5 && mins >= 14 * 60 + 55) return "night";
  if (wd >= 2 && wd <= 6 && mins <= 5 * 60 + 5) return "night";
  return "day";
}

/** 從 TXF QuoteList 抽出近月／遠月合約代碼與現貨指數 */
export function extractNearFarCodes(quoteList) {
  const codes = [];
  let spot = null;

  for (const q of quoteList || []) {
    const id = String(q?.SymbolID || "");
    if (id === "TXF-S") {
      spot = parseNum(q.CLastPrice);
      continue;
    }
    const m = id.match(/^TXF([A-L]\d)-(F|M)$/);
    if (m && !codes.includes(m[1])) {
      codes.push(m[1]);
    }
  }

  return {
    nearCode: codes[0] || null,
    farCode: codes[1] || null,
    spot,
  };
}

function parseLeg(q) {
  if (!q) return null;
  return {
    symbol: q.SymbolID || "",
    name: q.DispCName || "",
    last: parseNum(q.CLastPrice),
    bid: parseNum(q.CBidPrice1),
    ask: parseNum(q.CAskPrice1),
    bidSize: parseNum(q.CBidSize1),
    askSize: parseNum(q.CAskSize1),
    volume: parseNum(q.CTotalVolume),
    openInterest: parseNum(q.OpenInterest),
    date: formatDate(q.CDate),
    time: formatTime(q.CTime),
  };
}

/** 整理前端使用的標準化即時報價 */
export function buildLivePayload({ contract, session, spot, nearCode, farCode, detailList, fetchedAt }) {
  const cid = CONTRACT_CID[contract] || "MXF";
  const suffix = session === "night" ? "M" : "F";
  const spreadSymbol = `${cid}${nearCode}/${farCode}-${suffix}`;
  const nearSymbol = `${cid}${nearCode}-${suffix}`;
  const farSymbol = `${cid}${farCode}-${suffix}`;

  const byId = new Map((detailList || []).map((q) => [q.SymbolID, q]));
  const sq = byId.get(spreadSymbol);
  const nq = byId.get(nearSymbol);
  const fq = byId.get(farSymbol);

  const near = parseLeg(nq);
  const far = parseLeg(fq);

  const last = parseNum(sq?.CLastPrice);
  const bid = parseNum(sq?.CBidPrice1);
  const ask = parseNum(sq?.CAskPrice1);
  const bidSize = parseNum(sq?.CBidSize1);
  const askSize = parseNum(sq?.CAskSize1);
  const volume = parseNum(sq?.CTotalVolume);

  const bidAskGap = bid != null && ask != null ? Math.max(0, round2(ask - bid)) : null;
  const mid = bid != null && ask != null ? round1((bid + ask) / 2) : null;
  const impliedSpread = near?.last != null && far?.last != null ? round2(far.last - near.last) : null;

  let effectiveSpread = null;
  if (bid != null && ask != null) {
    effectiveSpread = last != null && last >= bid && last <= ask ? last : mid;
  } else if (last != null) {
    effectiveSpread = last;
  } else {
    effectiveSpread = impliedSpread;
  }

  return {
    ok: true,
    session,
    sessionLabel: session === "night" ? "夜盤" : "日盤",
    contract,
    spreadSymbol,
    spreadName: sq?.DispCName || `${contract} ${nearCode}/${farCode}`,
    date: formatDate(sq?.CDate) || near?.date || "",
    time: formatTime(sq?.CTime) || near?.time || "",
    spot,
    near,
    far,
    spread: {
      last,
      bid,
      ask,
      bidSize,
      askSize,
      bidAskGap,
      mid,
      impliedSpread,
      effectiveSpread,
      volume,
    },
    fetchedAt: fetchedAt || new Date().toISOString(),
  };
}

const CODE_TTL_MS = 10 * 60 * 1000;
const QUOTE_TTL_MS = 10 * 1000;
const codeCache = new Map();
const quoteCache = new Map();

export function clearCache() {
  codeCache.clear();
  quoteCache.clear();
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
    },
  });
}

async function postTaifex(endpoint, payload, fetchImpl) {
  const res = await fetchImpl(`${TAIFEX_API}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
      "User-Agent": "Mozilla/5.0 (tx-spread-live-proxy)",
      Origin: "https://mis.taifex.com.tw",
      Referer: "https://mis.taifex.com.tw/futures/",
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (_) {
    throw new Error(`期交所回傳非 JSON 頁面（HTTP ${res.status}），可能正在系統維護中`);
  }
  if (!res.ok) {
    throw new Error(`期交所回應 HTTP ${res.status}`);
  }
  if (data?.RtCode !== "0") {
    throw new Error(data?.RtMsg || `期交所錯誤碼 ${data?.RtCode ?? "unknown"}`);
  }
  return data?.RtData?.QuoteList || [];
}

function hasAnyQuote(payload) {
  const s = payload.spread;
  return (
    s.effectiveSpread != null ||
    s.bid != null ||
    s.ask != null ||
    payload.near?.last != null
  );
}

async function getSessionCodes(session, fetchImpl) {
  const now = Date.now();
  const cached = codeCache.get(session);
  if (cached && now - cached.ts < CODE_TTL_MS) {
    return cached.value;
  }

  const marketType = session === "night" ? "1" : "0";
  const quoteList = await postTaifex(
    "getQuoteList",
    {
      MarketType: marketType,
      SymbolType: "F",
      KindID: "1",
      CID: "TXF",
      ExpireMonth: "",
      RowSize: "全部",
      PageNo: "",
      SortColumn: "",
      AscDesc: "A",
    },
    fetchImpl
  );

  const value = extractNearFarCodes(quoteList);
  if (!value.nearCode || !value.farCode) {
    throw new Error("無法識別近月與遠月台指期合約代碼");
  }
  codeCache.set(session, { ts: now, value });
  return value;
}

async function fetchSessionPayload(contract, session, fetchImpl) {
  const cacheKey = `${contract}:${session}`;
  const now = Date.now();
  const cachedQuote = quoteCache.get(cacheKey);
  if (cachedQuote && now - cachedQuote.ts < QUOTE_TTL_MS) {
    return cachedQuote.payload;
  }

  const { nearCode, farCode, spot } = await getSessionCodes(session, fetchImpl);
  const cid = CONTRACT_CID[contract];
  const suffix = session === "night" ? "M" : "F";
  const detailList = await postTaifex(
    "getQuoteDetail",
    {
      SymbolID: [
        `${cid}${nearCode}/${farCode}-${suffix}`,
        `${cid}${nearCode}-${suffix}`,
        `${cid}${farCode}-${suffix}`,
      ],
    },
    fetchImpl
  );

  const payload = buildLivePayload({ contract, session, spot, nearCode, farCode, detailList });
  quoteCache.set(cacheKey, { ts: now, payload });
  return payload;
}

export async function handleRequest(request, fetchImpl = fetch) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const contract = (url.searchParams.get("contract") || "MTX").toUpperCase();
  if (!CONTRACT_CID[contract]) {
    return jsonResponse({ ok: false, error: `不支援的商品規格：${contract}` }, 400);
  }

  const sessionParam = (url.searchParams.get("session") || "auto").toLowerCase();
  if (!["auto", "day", "night"].includes(sessionParam)) {
    return jsonResponse({ ok: false, error: `不支援的盤別參數：${sessionParam}` }, 400);
  }

  try {
    const initialSession = sessionParam === "auto" ? detectTaipeiSession() : sessionParam;
    let payload = await fetchSessionPayload(contract, initialSession, fetchImpl);

    if (sessionParam === "auto" && initialSession === "night" && !hasAnyQuote(payload)) {
      payload = await fetchSessionPayload(contract, "day", fetchImpl);
    }

    return jsonResponse(payload, 200);
  } catch (err) {
    return jsonResponse(
      { ok: false, error: err?.message || "抓取期交所即時報價失敗" },
      502
    );
  }
}

export default {
  fetch(request) {
    return handleRequest(request, fetch);
  },
};
