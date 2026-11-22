// 執行：node --test tests/worker.test.mjs
import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { clearCache, detectTaipeiSession, handleRequest } from "../worker/taifex-proxy.js";

beforeEach(() => clearCache());

function makeMockFetch({ fail = false, marketTypesSeen = [], detailIdsSeen = [] } = {}) {
  return async (url, opts) => {
    if (fail) {
      throw new Error("network down");
    }
    const body = JSON.parse(opts.body);
    if (url.endsWith("/getQuoteList")) {
      marketTypesSeen.push(body.MarketType);
      const suffix = body.MarketType === "1" ? "M" : "F";
      return new Response(
        JSON.stringify({
          RtCode: "0",
          RtData: {
            QuoteList: [
              { SymbolID: "TXF-S", CLastPrice: "36033.29" },
              { SymbolID: `TXFL6-${suffix}`, DispCName: "臺指期126" },
              { SymbolID: `TXFA7-${suffix}`, DispCName: "臺指期017" },
            ],
          },
        }),
        { status: 200 }
      );
    }
    if (url.endsWith("/getQuoteDetail")) {
      detailIdsSeen.push(body.SymbolID);
      const isNight = body.SymbolID[0].endsWith("-M");
      if (isNight) {
        return new Response(
          JSON.stringify({
            RtCode: "0",
            RtData: {
              QuoteList: [
                {
                  SymbolID: "TXFL6/A7-M",
                  DispCName: "臺指期126/017",
                  CLastPrice: "79.00",
                  CBidPrice1: "76.00",
                  CAskPrice1: "84.00",
                  CBidSize1: "1",
                  CAskSize1: "2",
                  CTotalVolume: "8",
                  CDate: "20261120",
                  CTime: "041144",
                },
                { SymbolID: "TXFL6-M", CLastPrice: "33919.00", CDate: "20261120", CTime: "045959" },
                { SymbolID: "TXFA7-M", CLastPrice: "34036.00", CDate: "20261120", CTime: "045949" },
              ],
            },
          }),
          { status: 200 }
        );
      }
      return new Response(
        JSON.stringify({
          RtCode: "0",
          RtData: {
            QuoteList: [
              {
                SymbolID: "MXFL6/A7-F",
                DispCName: "小臺指期126/017",
                CLastPrice: "119.00",
                CBidPrice1: "113.00",
                CAskPrice1: "117.00",
                CBidSize1: "7",
                CAskSize1: "1",
                CTotalVolume: "14",
                CDate: "20261120",
                CTime: "122607",
              },
              { SymbolID: "MXFL6-F", CLastPrice: "35875.00", CDate: "20261120", CTime: "134459" },
              { SymbolID: "MXFA7-F", CLastPrice: "35997.00", CDate: "20261120", CTime: "134456" },
            ],
          },
        }),
        { status: 200 }
      );
    }
    throw new Error(`unexpected url ${url}`);
  };
}

test("OPTIONS 預檢請求回傳 204 與完整 CORS 標頭", async () => {
  const res = await handleRequest(new Request("https://example.com/?contract=MTX", { method: "OPTIONS" }));
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), "*");
  assert.match(res.headers.get("Access-Control-Allow-Methods"), /GET/);
});

test("正常日盤 MTX 查詢：辨識代碼、算五檔價差，且 last 偏離盤口時改取中價", async () => {
  const marketTypesSeen = [];
  const detailIdsSeen = [];
  const res = await handleRequest(
    new Request("https://example.com/?contract=MTX&session=day"),
    makeMockFetch({ marketTypesSeen, detailIdsSeen })
  );
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), "*");
  const json = await res.json();
  assert.equal(json.ok, true);
  assert.equal(json.session, "day");
  assert.deepEqual(marketTypesSeen, ["0"]);
  assert.deepEqual(detailIdsSeen[0], ["MXFL6/A7-F", "MXFL6-F", "MXFA7-F"]);
  assert.equal(json.spread.bidAskGap, 4);
  assert.equal(json.spread.mid, 115);
  assert.equal(json.spread.effectiveSpread, 115);
  assert.equal(json.near.last, 35875);
});

test("正常夜盤 TX 查詢：使用 MarketType=1 與 -M 後綴", async () => {
  const marketTypesSeen = [];
  const detailIdsSeen = [];
  const res = await handleRequest(
    new Request("https://example.com/?contract=TX&session=night"),
    makeMockFetch({ marketTypesSeen, detailIdsSeen })
  );
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.session, "night");
  assert.equal(json.sessionLabel, "夜盤");
  assert.deepEqual(marketTypesSeen, ["1"]);
  assert.deepEqual(detailIdsSeen[0], ["TXFL6/A7-M", "TXFL6-M", "TXFA7-M"]);
  assert.equal(json.spread.effectiveSpread, 79);
  assert.equal(json.spread.bidAskGap, 8);
});

test("detectTaipeiSession 正確分辨台北日盤、夜盤與週末", () => {
  // 週三 10:00 TPE = 02:00 UTC
  assert.equal(detectTaipeiSession(new Date("2026-11-18T02:00:00Z")), "day");
  // 週三 21:00 TPE = 13:00 UTC
  assert.equal(detectTaipeiSession(new Date("2026-11-18T13:00:00Z")), "night");
  // 週四 02:30 TPE = 週三 18:30 UTC
  assert.equal(detectTaipeiSession(new Date("2026-11-18T18:30:00Z")), "night");
  // 週六 12:00 TPE = 04:00 UTC
  assert.equal(detectTaipeiSession(new Date("2026-11-21T04:00:00Z")), "day");
});

test("期交所連線失敗時回傳 502 與 CORS 標頭", async () => {
  const res = await handleRequest(
    new Request("https://example.com/?contract=MTX&session=day"),
    makeMockFetch({ fail: true })
  );
  assert.equal(res.status, 502);
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), "*");
  const json = await res.json();
  assert.equal(json.ok, false);
  assert.match(json.error, /network down/);
});

test("上游回傳非 JSON 維護頁時回傳友善中文錯誤訊息", async () => {
  const htmlFetch = async () =>
    new Response("<!DOCTYPE html><html><body>系統維護中</body></html>", {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  const res = await handleRequest(
    new Request("https://example.com/?contract=MTX&session=day"),
    htmlFetch
  );
  assert.equal(res.status, 502);
  const json = await res.json();
  assert.equal(json.ok, false);
  assert.match(json.error, /非 JSON 頁面/);
  assert.ok(!json.error.includes("Unexpected token"));
});

test("短時間內連續查詢同一合約與盤別命中快取", async () => {
  let fetchCalls = 0;
  const mock = makeMockFetch();
  const countedFetch = async (url, opts) => {
    fetchCalls++;
    return mock(url, opts);
  };

  const r1 = await handleRequest(
    new Request("https://example.com/?contract=MTX&session=day"),
    countedFetch
  );
  assert.equal(r1.status, 200);
  assert.equal(fetchCalls, 2);

  const r2 = await handleRequest(
    new Request("https://example.com/?contract=MTX&session=day"),
    countedFetch
  );
  assert.equal(r2.status, 200);
  assert.equal(fetchCalls, 2);
});
