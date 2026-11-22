/* 介面邏輯：讀取盤後／盤中即時資料、收集參數、呼叫 SpreadEngine、渲染視覺化儀表板 */
(function () {
  "use strict";

  const { evaluateEntry, parseIsoDate, iso } = window.SpreadEngine;
  const STORAGE_KEY = "tx-spread-inputs-v3";
  const DEFAULT_LIVE_API_URL = "https://tx-spread-live-proxy.pilimesai.workers.dev";
  const API_STORAGE_KEY = "tx-spread-live-api-v1";
  const MARKET_STAMP_KEY = "tx-spread-market-stamp-v1";
  const POLL_STORAGE_KEY = "tx-spread-live-poll-v1";
  const POLL_INTERVAL_MS = 15000;

  const BASE = {
    indexLevel: 23000,
    annualRatePct: 1.75,
    marketSpread: 25,
    ma10Spread: "",
    foreignNetShort: 30000,
    trustNetLong: "",
    trustChange20dPct: "",
    taiex5dChangePct: "",
    crashWeekLocked: false,
    bidAskGap: 2,
    exDivDatesConfirmed: true,
    evalDatetime: "",
    nearSettlementOverride: "",
    contractType: "MTX",
    contracts: 1,
    targetExitSpread: "",
  };

  const FIELDS = Object.keys(BASE);
  const NUMERIC = new Set([
    "indexLevel", "annualRatePct", "marketSpread",
    "foreignNetShort", "bidAskGap", "contracts",
  ]);
  const OPTIONAL_NUMERIC = new Set(["ma10Spread", "trustNetLong", "trustChange20dPct", "taiex5dChangePct"]);
  const STATUS_TEXT = { block: "紅線", warn: "注意", pass: "通過" };
  const STATUS_RANK = { block: 0, warn: 1, pass: 2 };
  const SIGNAL_ICON = { GREEN: "🟢", YELLOW: "🟡", RED: "🔴" };

  let market = null;
  let liveApiUrl = "";
  let pollTimer = null;
  let isFetchingLive = false;
  let hasLiveQuote = false;
  const checkedSteps = new Set();
  const $ = (id) => document.getElementById(id);

  function normalizeApiUrl(raw) {
    const s = String(raw || "").trim().replace(/\/+$/, "");
    if (!s) return "";
    return /^https?:\/\//i.test(s) ? s : `https://${s}`;
  }

  function isSelfOrInvalidApiUrl(url) {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      if (parsed.hostname.endsWith(".github.io")) return true;
      if (parsed.origin === window.location.origin && !parsed.pathname.includes("worker")) {
        return true;
      }
      return false;
    } catch (_) {
      return true;
    }
  }

  function syncContractButtons(value) {
    $("contractType").value = value;
    document.querySelectorAll(".seg-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.contract === value);
    });
  }

  function setForm(values) {
    for (const k of FIELDS) {
      const el = $(k);
      const v = values[k] ?? BASE[k];
      if (el.type === "checkbox") el.checked = Boolean(v);
      else el.value = v;
    }
    syncContractButtons(values.contractType || BASE.contractType);
  }

  function readForm() {
    const out = {};
    for (const k of FIELDS) {
      const el = $(k);
      if (el.type === "checkbox") out[k] = el.checked;
      else if (OPTIONAL_NUMERIC.has(k)) out[k] = el.value === "" ? null : Number(el.value);
      else if (NUMERIC.has(k)) out[k] = el.value === "" ? BASE[k] : Number(el.value);
      else out[k] = el.value;
    }
    out.contracts = Math.max(1, Math.round(out.contracts || 1));
    out.targetExitSpread = out.targetExitSpread === "" ? null : Number(out.targetExitSpread);
    return out;
  }

  function save() {
    try {
      const v = {};
      for (const k of FIELDS) {
        const el = $(k);
        v[k] = el.type === "checkbox" ? el.checked : el.value;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    } catch (_) { /* 無痕模式忽略 */ }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function money(n) {
    return `${n >= 0 ? "+" : "-"}NT$ ${Math.abs(n).toLocaleString("en-US")}`;
  }

  function renderGauge(v, c) {
    $("gauge-plain").textContent = v.plainSummary;
    $("gauge-mid-label").textContent = `理論合理價 ${v.theoreticalSpread}`;
    $("gauge-formula").textContent =
      v.ma10Spread != null
        ? `理論價 ${v.theoreticalSpread}（${c.settlementGapDays}天/365）− 除息 ${v.expectedExDivPoints} ｜ 近10日均價差 ${v.ma10Spread}`
        : `理論價 ${v.theoreticalSpread} = 資金利息 +${v.fundingCost}（${c.settlementGapDays}天/365）− 預計除息 ${v.expectedExDivPoints}`;

    const clamped = Math.max(-60, Math.min(60, v.mispricing));
    const pct = 50 + (clamped / 60) * 46;
    const pin = $("gauge-pin");
    pin.style.left = `${pct}%`;

    const lbl = $("gauge-pin-label");
    lbl.textContent = `市場 ${v.marketSpread}`;
    if (pct < 18) pin.style.transform = "translateX(-15%)";
    else if (pct > 82) pin.style.transform = "translateX(-85%)";
    else pin.style.transform = "translateX(-50%)";

    const maTick = $("gauge-ma10-tick");
    const maRow = $("gauge-ma10-row");
    const maTag = $("gauge-ma10-tag");
    if (v.ma10Spread != null) {
      const maDiff = Math.max(-60, Math.min(60, v.ma10Spread - v.theoreticalSpread));
      const maPct = 50 + (maDiff / 60) * 42;
      maTick.style.left = `${maPct}%`;
      maTick.classList.remove("hidden");
      maRow.classList.remove("hidden");
      maTag.textContent = `10日均 ${v.ma10Spread}`;
      maTag.style.left = `${maPct}%`;
      if (maPct < 18) maTag.style.transform = "translateX(-15%)";
      else if (maPct > 82) maTag.style.transform = "translateX(-85%)";
      else maTag.style.transform = "translateX(-50%)";
    } else {
      maTick.classList.add("hidden");
      maRow.classList.add("hidden");
    }
  }

  function renderChecks(checks) {
    const box = $("checks-list");
    box.innerHTML = "";
    const sorted = checks.slice().sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);

    for (const item of sorted) {
      const row = document.createElement("div");
      row.className = `check-row ${item.status}`;

      const head = document.createElement("div");
      head.className = "check-head";

      const left = document.createElement("div");
      left.className = "check-left";
      const title = document.createElement("span");
      title.className = "check-title";
      title.textContent = item.title;
      const metric = document.createElement("span");
      metric.className = "check-metric";
      metric.textContent = item.metric;
      left.append(title, metric);

      const badges = document.createElement("div");
      badges.className = "check-badges";
      const sub = document.createElement("span");
      sub.className = "sub-badge";
      sub.textContent = item.badge;
      const tag = document.createElement("span");
      tag.className = `status-tag ${item.status}`;
      tag.textContent = STATUS_TEXT[item.status];
      badges.append(sub, tag);

      head.append(left, badges);

      const summary = document.createElement("div");
      summary.className = "check-summary";
      summary.textContent = item.summary;

      row.append(head, summary);
      box.appendChild(row);
    }
  }

  function renderChecklist(items) {
    const ul = $("checklist");
    ul.innerHTML = "";
    items.forEach((text, idx) => {
      const li = document.createElement("li");
      const label = document.createElement("label");
      label.className = "checklist-row";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = checkedSteps.has(idx);
      if (cb.checked) label.classList.add("done");

      cb.addEventListener("change", () => {
        if (cb.checked) checkedSteps.add(idx);
        else checkedSteps.delete(idx);
        label.classList.toggle("done", cb.checked);
        updateChecklistProgress(items.length);
      });

      const sp = document.createElement("span");
      sp.textContent = text;
      label.append(cb, sp);
      li.appendChild(label);
      ul.appendChild(li);
    });
    updateChecklistProgress(items.length);
  }

  function updateChecklistProgress(total) {
    const pill = $("checklist-progress");
    pill.textContent = `已完成 ${checkedSteps.size} / ${total}`;
    pill.classList.toggle("done", checkedSteps.size === total && total > 0);
  }

  function getDefaultAnnualRate() {
    return market?.rate?.annual_rate_pct ?? BASE.annualRatePct;
  }

  function renderSimAndAdvanced(inp) {
    const simBanner = $("sim-banner");
    if (inp.evalDatetime) {
      $("sim-banner-text").textContent = `🧪 目前為模擬情境（${inp.evalDatetime.replace("T", " ")}）`;
      simBanner.classList.remove("hidden");
    } else {
      simBanner.classList.add("hidden");
    }

    const hasCustomAdv =
      Math.abs(Number($("annualRatePct").value) - getDefaultAnnualRate()) > 1e-6 ||
      $("evalDatetime").value !== "" ||
      $("nearSettlementOverride").value !== "" ||
      $("targetExitSpread").value !== "" ||
      !$("exDivDatesConfirmed").checked;
    $("adv-badge").classList.toggle("hidden", !hasCustomAdv);
  }

  function computeAutoExDiv(nearIso, farIso) {
    if (!market || !Array.isArray(market.exdiv)) {
      return { totalPoints: 0, rows: [], constituentCount: 0, pendingConstituents: 0, start: null };
    }
    const start = iso(new Date(parseIsoDate(nearIso).getTime() + 86400000));
    const rows = market.exdiv.filter((x) => x.date >= start && x.date <= farIso);
    let total = 0;
    let constituentCount = 0;
    let pendingConstituents = 0;
    for (const x of rows) {
      if (x.is_constituent) {
        constituentCount++;
        if (x.impact_points != null) total += x.impact_points;
        else pendingConstituents++;
      }
    }
    return {
      totalPoints: Math.round(total * 100) / 100,
      rows,
      constituentCount,
      pendingConstituents,
      start,
    };
  }

  function render() {
    const inp = readForm();
    const cal = evaluateEntry({
      evalDatetime: inp.evalDatetime,
      nearSettlementOverride: inp.nearSettlementOverride,
    }).calendar;
    const autoEx = computeAutoExDiv(cal.nearSettlement, cal.farSettlement);
    inp.expectedExDivPoints = autoEx.totalPoints;
    const r = evaluateEntry(inp);
    save();
    renderSimAndAdvanced(inp);

    const sigCls = `sig-${r.signal.toLowerCase()}`;
    $("signal-banner").className = `signal-banner ${sigCls}`;
    $("signal-dot").textContent = SIGNAL_ICON[r.signal];
    $("signal-short").textContent = r.signalShort;
    $("signal-label").textContent = r.signalLabel.replace(/^[🟢🟡🔴]\s*/, "");
    $("action-summary").textContent = r.actionSummary;

    const counts = { block: 0, warn: 0, pass: 0 };
    r.checks.forEach((c) => counts[c.status]++);
    const heroCounts = $("hero-counts");
    heroCounts.innerHTML = "";
    for (const [cls, text] of [
      ["block", `⛔ ${counts.block} 紅線`],
      ["warn", `⚠️ ${counts.warn} 注意`],
      ["pass", `✅ ${counts.pass} 通過`],
    ]) {
      if (cls === "block" && counts.block === 0) continue;
      const sp = document.createElement("span");
      sp.className = `h-pill ${cls}`;
      sp.textContent = text;
      heroCounts.appendChild(sp);
    }

    const v = r.valuation;
    const c = r.calendar;
    const s = r.sizing;

    const mini = $("live-mini-bar");
    mini.className = `live-mini-bar ${sigCls}`;
    const diffWord =
      v.entryType === "pullback" && v.diffFromMa10 != null
        ? `低於10日均 ${Math.round((-v.diffFromMa10) * 100) / 100} 點`
        : v.mispricing > 0
          ? `貴了 ${v.mispricing} 點`
          : `便宜 ${v.discountPoints} 點`;
    const dayWord = c.isSettlementDay ? "今日結算" : `剩 ${c.tradingDaysLeft} 交易日`;
    const scaleSuffix = s.scaleUpTriggered
      ? ` ・ 🔥可放大${s.scaleUpMaxContracts}口`
      : r.chips.trustTrend === "shrinking" && r.signal === "GREEN"
        ? " ・ ⚠️投信縮水"
        : "";
    $("mini-signal-text").textContent = `${SIGNAL_ICON[r.signal]} ${r.signalShort} ・ ${diffWord} ・ ${dayWord}${scaleSuffix}`;

    const scaleBanner = $("scale-up-banner");
    if (s.scaleUpHint) {
      scaleBanner.textContent = s.scaleUpHint;
      const bannerTone = s.scaleUpTriggered ? "active" : (s.scaleUpBlockedByTrustShrink ? "warn-pause" : "standby");
      scaleBanner.className = `scale-up-banner ${bannerTone}`;
    } else {
      scaleBanner.textContent = "";
      scaleBanner.className = "scale-up-banner hidden";
    }

    renderGauge(v, c);

    $("m-theory").textContent = `${v.theoreticalSpread} 點`;
    $("m-theory-sub").textContent = `利息 +${v.fundingCost}（${c.settlementGapDays}天）− 除息 ${v.expectedExDivPoints}`;

    const disc = $("m-disc");
    disc.textContent = v.mispricing > 0 ? `貴了 ${v.mispricing} 點` : `便宜 ${v.discountPoints} 點`;
    disc.className = `m-value ${v.entryType === "value" || v.entryType === "pullback" ? "pos" : "neg"}`;
    if (v.ma10Spread != null && v.diffFromMa10 != null) {
      const maSign = v.diffFromMa10 >= 0 ? "+" : "";
      $("m-disc-sub").textContent = `市場 ${v.marketSpread}｜vs 10日均 ${maSign}${v.diffFromMa10} 點`;
    } else {
      $("m-disc-sub").textContent = `市場報價 ${v.marketSpread}｜${v.valuationLabel}`;
    }

    $("m-days").textContent = c.isSettlementDay ? "今日結算！" : `剩 ${c.tradingDaysLeft} 交易日`;
    $("m-phase").textContent = c.phaseLabel;
    $("m-days-sub").textContent = `近 ${c.nearSettlement}｜遠 ${c.farSettlement}`;

    const sizeNote = $("size-cut-note");
    if (s.exDivSizeCut && s.sizeCutHint) {
      sizeNote.textContent = `⚠️ 除權降口建議：${s.sizeCutHint}`;
      sizeNote.classList.remove("hidden");
    } else {
      sizeNote.textContent = "";
      sizeNote.classList.add("hidden");
    }

    const p = $("m-profit");
    const pLadder = $("m-profit-ladder");
    const el = s.exitLadder;
    const scalePrefix = s.scaleUpTriggered
      ? `🔥 加碼 ${s.scaleUpMaxContracts} 口｜`
      : "";
    const profitPrefix = s.exDivSizeCut
      ? (s.contracts >= 2
        ? `⚠️ 除權降口 ${s.recommendedContracts} 口｜`
        : `⚠️ ${s.sizeCutHint}｜`)
      : "";
    const activeStress30 = s.scaleUpTriggered ? s.scaleUpStress30Twd : s.recommendedStress30Twd;

    if (el && !el.isCustom && el.tier2.contracts > 0) {
      p.textContent = el.totalProfitTwd >= 0 ? `階梯預估 ${money(el.totalProfitTwd)}` : `預估虧 ${money(el.totalProfitTwd)}`;
      p.className = `m-value ${el.totalProfitTwd >= 0 ? "pos" : "neg"}`;
      $("m-profit-sub").textContent =
        `${scalePrefix || profitPrefix}按 ${el.effectiveContracts} 口分批停利｜30點洗盤波動 ±NT$ ${activeStress30.toLocaleString("en-US")}`;
      pLadder.textContent =
        `📌 虛擬第六檔預掛：第1批 ${el.tier1.contracts}口 @ ${el.tier1.spread} (+40)｜第2批 ${el.tier2.contracts}口 @ ${el.tier2.spread} (+65)`;
      pLadder.classList.remove("hidden");
    } else if (el && !el.isCustom) {
      const displayProfit = s.exDivSizeCut ? s.recommendedProfitTwd : s.expectedProfitTwd;
      p.textContent = displayProfit >= 0 ? `預計賺 ${money(displayProfit)}` : `預估虧 ${money(displayProfit)}`;
      p.className = `m-value ${displayProfit >= 0 ? "pos" : "neg"}`;
      $("m-profit-sub").textContent =
        `${profitPrefix}第1批目標 ${el.tier1.spread}（${el.tier1.gainPoints} 點）｜30點洗盤波動 ±NT$ ${activeStress30.toLocaleString("en-US")}`;
      pLadder.textContent =
        `📌 虛擬第六檔預掛：保守 1口 @ ${el.tier1.spread} (+40)｜衝刺參考 ${el.tier2.spread} (+65)`;
      pLadder.classList.remove("hidden");
    } else {
      const activeProfit = s.scaleUpTriggered
        ? s.scaleUpProfitTwd
        : (s.exDivSizeCut ? s.recommendedProfitTwd : s.expectedProfitTwd);
      p.textContent = activeProfit >= 0 ? `預計賺 ${money(activeProfit)}` : `預估虧 ${money(activeProfit)}`;
      p.className = `m-value ${activeProfit >= 0 ? "pos" : "neg"}`;
      $("m-profit-sub").textContent =
        `${scalePrefix || profitPrefix}自訂目標 ${s.suggestedExitSpread}（${s.expectedGainPoints} 點）｜30點洗盤波動 ±NT$ ${activeStress30.toLocaleString("en-US")}`;
      pLadder.textContent = "";
      pLadder.classList.add("hidden");
    }

    renderChecks(r.checks);
    renderChecklist(r.checklist);
    renderExDiv(c.nearSettlement, c.farSettlement, autoEx);
  }

  function renderExDiv(nearIso, farIso, autoEx) {
    const box = $("exdiv-list");
    const win = $("exdiv-window");
    const pill = $("exdiv-count");
    box.innerHTML = "";
    if (!market || !Array.isArray(market.exdiv)) {
      pill.textContent = "-- 檔";
      win.textContent = "尚無除權息預告資料。";
      return;
    }
    const info = autoEx || computeAutoExDiv(nearIso, farIso);
    const { start, rows, totalPoints, constituentCount, pendingConstituents } = info;
    pill.textContent = `${rows.length} 檔｜自動 -${totalPoints} 點`;
    win.textContent =
      `區間：${start} ～ ${farIso}（證交所目前已公告者；大盤成份股 ${constituentCount} 檔` +
      (pendingConstituents > 0 ? `，另有 ${pendingConstituents} 檔金額待公告` : "") +
      "）";

    if (rows.length === 0) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.style.padding = "8px 0";
      empty.textContent = "此區間目前沒有已公告除權息的股票。";
      box.appendChild(empty);
      return;
    }

    for (const x of rows) {
      const d = document.createElement("div");
      d.className = "exdiv-item";
      let rightText;
      if (x.is_constituent === false) {
        rightText = `${x.cash_dividend == null ? "待公告" : `現金 ${x.cash_dividend}`}（不計入）`;
      } else if (x.type === "權" && (!x.cash_dividend || x.cash_dividend === 0)) {
        rightText = "除權（0點）";
      } else if (x.cash_dividend == null || x.impact_points == null) {
        rightText = "待公告";
      } else if (x.impact_points > 0) {
        rightText = `現金 ${x.cash_dividend}（-${x.impact_points}點）`;
      } else {
        rightText = `現金 ${x.cash_dividend}（0點）`;
      }
      for (const [cls, txt] of [["d", x.date.slice(5)], ["n", `${x.code} ${x.name}（${x.type}）`], ["c", rightText]]) {
        const s = document.createElement("span");
        s.className = cls;
        s.textContent = txt;
        d.appendChild(s);
      }
      box.appendChild(d);
    }
  }

  function renderMarket() {
    const box = $("market-summary");
    const rateEl = $("market-rate-line");
    const status = $("data-status");
    if (!market) {
      box.textContent = "無法載入盤後資料，請手動輸入參數。";
      rateEl.textContent = "";
      if (!hasLiveQuote) {
        status.textContent = "⚠️ 盤後資料載入失敗";
        status.className = "data-status err";
      }
      return;
    }
    const tx = market.tx || {};
    const fo = market.foreign || {};
    const tr = market.trust || {};
    const fmtD = (d) => (d && d.length === 8 ? `${d.slice(0, 4)}/${d.slice(4, 6)}/${d.slice(6)}` : d || "--");
    const items = [
      ["資料日期", fmtD(tx.date)],
      [`近遠月價差 ${tx.near_month?.slice(4) || ""}/${tx.far_month?.slice(4) || ""}`, tx.spread ?? "--"],
      [`近 ${tx.ma10_days || 10} 日均價差`, tx.ma10_spread ?? "--"],
      ["近月結算價", tx.near_price != null ? tx.near_price.toLocaleString("en-US") : "--"],
      ["投信淨多單（正二）", tr.net_long != null ? tr.net_long.toLocaleString("en-US") + " 口" : "--"],
      ["外資淨空單", fo.net_short != null ? fo.net_short.toLocaleString("en-US") + " 口" : "--"],
    ];
    box.className = "market-summary";
    box.innerHTML = "";
    for (const [k, v] of items) {
      const d = document.createElement("div");
      d.className = "kv";
      const kk = document.createElement("div");
      kk.className = "k";
      kk.textContent = k;
      const vv = document.createElement("div");
      vv.className = "v";
      vv.textContent = v;
      d.append(kk, vv);
      box.appendChild(d);
    }
    const infoParts = [];
    if (market.rate?.annual_rate_pct != null) {
      infoParts.push(`📌 公開短期利率：${market.rate.annual_rate_pct}%（${market.rate.source}・${market.rate.date}）`);
    }
    if (market.taiex?.change_5d_pct != null) {
      const chg = market.taiex.change_5d_pct;
      infoParts.push(`📉 加權近 5 日：${chg >= 0 ? "+" : ""}${chg}%（${market.taiex.date}）`);
    }
    if (tr.change_20d_pct != null) {
      const arrow = tr.change_20d_pct > 0 ? "📈" : "📉";
      const tag = tr.change_20d_pct > 0 ? "豆腐變肥" : "豆腐縮水";
      const signChg = tr.change_20d >= 0 ? "+" : "";
      const signPct = tr.change_20d_pct > 0 ? "+" : "";
      infoParts.push(
        `${arrow} 投信 ${tr.trend_days || 20} 日趨勢：${signChg}${tr.change_20d.toLocaleString("en-US")} 口（${signPct}${tr.change_20d_pct}%・${tag}）`
      );
    }
    rateEl.textContent = infoParts.join("｜");
    if (!hasLiveQuote) {
      status.textContent = `✅ 盤後資料 ${fmtD(tx.date)}`;
      status.className = "data-status ok";
    }
  }

  function detectCrashWeekLocked(marketObj) {
    const seq = marketObj?.taiex?.recent_5d_changes;
    if (!Array.isArray(seq) || !seq.length) return false;
    const evalCal = evaluateEntry({ evalDatetime: "" }).calendar;
    if (evalCal.tradingDaysLeft < 2 || evalCal.tradingDaysLeft > 5) return false;
    const windowLen = 6 - evalCal.tradingDaysLeft;
    return seq.slice(-windowLen).some((x) => x && typeof x.change_5d_pct === "number" && x.change_5d_pct <= -5);
  }

  function applyMarket() {
    if (!market) return;
    const tx = market.tx || {};
    const fo = market.foreign || {};
    const tr = market.trust || {};
    if (tx.near_price) $("indexLevel").value = Math.round(tx.near_price);
    if (tx.spread != null) $("marketSpread").value = tx.spread;
    if (tx.ma10_spread != null) $("ma10Spread").value = tx.ma10_spread;
    if (fo.net_short != null) $("foreignNetShort").value = fo.net_short;
    if (tr.net_long != null) $("trustNetLong").value = tr.net_long;
    if (tr.change_20d_pct != null) $("trustChange20dPct").value = tr.change_20d_pct;
    if (market.taiex?.change_5d_pct != null) $("taiex5dChangePct").value = market.taiex.change_5d_pct;
    $("crashWeekLocked").checked = detectCrashWeekLocked(market);
    if (market.rate?.annual_rate_pct != null) $("annualRatePct").value = market.rate.annual_rate_pct;
    $("evalDatetime").value = "";
    $("nearSettlementOverride").value = "";
    markMarketStamp();
    render();
  }

  function marketStamp() {
    return market ? String(market.tx?.date || market.generated_at || "") : "";
  }

  function markMarketStamp() {
    const stamp = marketStamp();
    if (!stamp) return;
    try { localStorage.setItem(MARKET_STAMP_KEY, stamp); } catch (_) { }
  }

  /**
   * 開啟頁面時同步「盤後自動欄位」：
   * - 盤後資料換日（新交易日）→ 全部以最新盤後數字覆蓋，避免沿用舊日數字
   * - 同一交易日 → 只補空白欄位（保留使用者當天手動修改）
   */
  function syncMarketDerived() {
    if (!market) return;
    const tx = market.tx || {};
    const fo = market.foreign || {};
    const tr = market.trust || {};
    let lastStamp = "";
    try { lastStamp = localStorage.getItem(MARKET_STAMP_KEY) || ""; } catch (_) { }
    const stamp = marketStamp();
    const isNewDay = Boolean(stamp) && stamp !== lastStamp;

    const fill = (id, val, onlyNewDay = false) => {
      if (val == null) return;
      const el = $(id);
      if (isNewDay || (!onlyNewDay && el.value === "")) el.value = val;
    };
    fill("indexLevel", tx.near_price ? Math.round(tx.near_price) : null, true);
    fill("marketSpread", tx.spread, true);
    fill("ma10Spread", tx.ma10_spread);
    fill("foreignNetShort", fo.net_short, true);
    fill("trustNetLong", tr.net_long);
    fill("trustChange20dPct", tr.change_20d_pct);
    fill("taiex5dChangePct", market.taiex?.change_5d_pct);
    if (
      market.rate?.annual_rate_pct != null &&
      (isNewDay || Number($("annualRatePct").value) === BASE.annualRatePct)
    ) {
      $("annualRatePct").value = market.rate.annual_rate_pct;
    }
    $("crashWeekLocked").checked = detectCrashWeekLocked(market);
    markMarketStamp();
  }

  async function fetchMarket() {
    try {
      const res = await fetch(`data/market.json?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(res.status);
      market = await res.json();
    } catch (_) {
      market = null;
    }
    renderMarket();
  }

  // ---- 盤中即時報價（Cloudflare Worker -> 期交所 MIS）----
  function setLiveStatus(msg, tone = "muted") {
    const el = $("live-status-msg");
    el.textContent = msg;
    el.className = `live-status-msg ${tone}`;
  }

  function renderLiveBox(data) {
    $("live-quote-box").classList.remove("hidden");
    $("live-quote-name").textContent = `${data.spreadName || data.spreadSymbol}・${data.sessionLabel}`;
    $("live-quote-time").textContent = `${data.date || ""} ${data.time || ""}`.trim();

    const sp = data.spread || {};
    $("lq-spread").textContent = sp.effectiveSpread != null ? `${sp.effectiveSpread} 點` : "--";
    $("lq-spread-sub").textContent = `最新成交 ${sp.last ?? "--"}｜量 ${sp.volume ?? "--"}`;
    $("lq-ba").textContent = `${sp.bid ?? "--"} / ${sp.ask ?? "--"}`;
    $("lq-ba-sub").textContent = `口數 ${sp.bidSize ?? "-"} / ${sp.askSize ?? "-"}`;
    $("lq-gap").textContent = sp.bidAskGap != null ? `${sp.bidAskGap} 點` : "--";
    $("lq-legs").textContent = `${data.near?.last ?? "--"} / ${data.far?.last ?? "--"}`;
  }

  async function fetchLiveQuote({ silent = false } = {}) {
    if (!liveApiUrl) {
      if (!silent) {
        $("live-api-panel").classList.remove("hidden");
        setLiveStatus("請先填入 Cloudflare Worker 網址再抓取盤中報價。", "err");
      }
      return false;
    }
    if (isFetchingLive) return false;

    isFetchingLive = true;
    const btn = $("btn-fetch-live");
    const prevText = btn.textContent;
    if (!silent) btn.textContent = "抓取中...";

    try {
      const contract = $("contractType").value || "MTX";
      const session = $("live-session").value || "auto";
      const url = `${liveApiUrl}?contract=${encodeURIComponent(contract)}&session=${encodeURIComponent(session)}&_=${Date.now()}`;
      const res = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (_) {
        throw new Error(
          `API 回傳網頁而非 JSON（HTTP ${res.status}），請點「⚙️ 設定 API」確認網址為 *.workers.dev 或按「重設預設網址」`
        );
      }
      if (!res.ok || !data.ok) {
        const rawErr = data?.error || `HTTP ${res.status}`;
        if (/HTTP\s*520/i.test(rawErr)) {
          throw new Error(
            "期交所即時系統暫時無回應（HTTP 520，可能逢非交易時段維護或暫時限制雲端主機連線），原輸入已保留，盤中可改手動填券商即時價差"
          );
        }
        throw new Error(rawErr);
      }

      if (data.near?.last != null) {
        $("indexLevel").value = Math.round(data.near.last);
      } else if (data.spot != null) {
        $("indexLevel").value = Math.round(data.spot);
      }
      if (data.spread?.effectiveSpread != null) {
        $("marketSpread").value = data.spread.effectiveSpread;
      }
      if (data.spread?.bidAskGap != null) {
        $("bidAskGap").value = data.spread.bidAskGap;
      }
      $("evalDatetime").value = "";

      hasLiveQuote = true;
      renderLiveBox(data);
      const t = data.time || "--:--";
      $("data-status").textContent = `⚡ 即時 ${t}（${data.sessionLabel}）`;
      $("data-status").className = "data-status ok";
      setLiveStatus(`已同步期交所 ${data.spreadSymbol} 即時報價（外資淨空單沿用盤後數字）`, "ok");
      render();
      return true;
    } catch (err) {
      setLiveStatus(`即時抓取失敗（原輸入保留不動）：${err.message || err}`, "err");
      return false;
    } finally {
      isFetchingLive = false;
      btn.textContent = prevText;
    }
  }

  function stopLivePolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function startLivePolling() {
    stopLivePolling();
    pollTimer = setInterval(() => {
      if (!$("chk-live-poll").checked || !liveApiUrl || document.hidden || $("evalDatetime").value) return;
      fetchLiveQuote({ silent: true });
    }, POLL_INTERVAL_MS);
  }

  function initLiveConfig() {
    const params = new URLSearchParams(window.location.search);
    let paramApi = normalizeApiUrl(params.get("api"));
    if (isSelfOrInvalidApiUrl(paramApi)) paramApi = "";
    if (paramApi) {
      try { localStorage.setItem(API_STORAGE_KEY, paramApi); } catch (_) { }
    }
    let storedApi = "";
    let storedPoll = false;
    try {
      storedApi = normalizeApiUrl(localStorage.getItem(API_STORAGE_KEY));
      if (isSelfOrInvalidApiUrl(storedApi)) {
        localStorage.removeItem(API_STORAGE_KEY);
        storedApi = "";
      }
      const rawPoll = localStorage.getItem(POLL_STORAGE_KEY);
      liveApiUrl = paramApi || storedApi || DEFAULT_LIVE_API_URL;
      storedPoll = rawPoll === null ? Boolean(liveApiUrl) : rawPoll === "1";
    } catch (_) {
      liveApiUrl = paramApi || DEFAULT_LIVE_API_URL;
      storedPoll = Boolean(liveApiUrl);
    }

    $("live-api-url").value = liveApiUrl;
    $("chk-live-poll").checked = storedPoll;

    if (liveApiUrl) {
      setLiveStatus("盤中即時報價連線中...", "muted");
    }

    return {
      shouldAutoFetch: Boolean(liveApiUrl),
    };
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const saved = load();
    setForm(saved || BASE);

    for (const k of FIELDS) {
      $(k).addEventListener("input", render);
      $(k).addEventListener("change", render);
    }

    document.querySelectorAll(".seg-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        syncContractButtons(btn.dataset.contract);
        render();
        if (liveApiUrl && ($("chk-live-poll").checked || hasLiveQuote)) {
          fetchLiveQuote({ silent: true });
        }
      });
    });

    $("live-session").addEventListener("change", () => {
      if (liveApiUrl && ($("chk-live-poll").checked || hasLiveQuote)) {
        fetchLiveQuote({ silent: true });
      }
    });

    $("btn-fetch-live").addEventListener("click", () => fetchLiveQuote({ silent: false }));
    $("btn-toggle-api").addEventListener("click", () => {
      $("live-api-panel").classList.toggle("hidden");
    });
    $("btn-save-api").addEventListener("click", async () => {
      const nextUrl = normalizeApiUrl($("live-api-url").value);
      if (nextUrl && isSelfOrInvalidApiUrl(nextUrl)) {
        setLiveStatus("請輸入有效的 Cloudflare Worker 網址（*.workers.dev），不可填入 github.io 靜態頁網址。", "err");
        return;
      }
      liveApiUrl = nextUrl;
      $("live-api-url").value = liveApiUrl;
      try {
        if (liveApiUrl) localStorage.setItem(API_STORAGE_KEY, liveApiUrl);
        else localStorage.removeItem(API_STORAGE_KEY);
      } catch (_) { }
      if (!liveApiUrl) {
        setLiveStatus("已清除 API 網址。", "muted");
        return;
      }
      $("live-api-panel").classList.add("hidden");
      await fetchLiveQuote({ silent: false });
    });
    $("btn-reset-api").addEventListener("click", async () => {
      try { localStorage.removeItem(API_STORAGE_KEY); } catch (_) {}
      liveApiUrl = DEFAULT_LIVE_API_URL;
      $("live-api-url").value = liveApiUrl;
      $("live-api-panel").classList.add("hidden");
      await fetchLiveQuote({ silent: false });
    });

    $("chk-live-poll").addEventListener("change", () => {
      const on = $("chk-live-poll").checked;
      try { localStorage.setItem(POLL_STORAGE_KEY, on ? "1" : "0"); } catch (_) { }
      if (on) {
        if (!liveApiUrl) {
          $("chk-live-poll").checked = false;
          try { localStorage.setItem(POLL_STORAGE_KEY, "0"); } catch (_) { }
          $("live-api-panel").classList.remove("hidden");
          setLiveStatus("請先設定 Cloudflare Worker 網址，才能開啟 15 秒自動更新。", "err");
          return;
        }
        fetchLiveQuote({ silent: false });
        startLivePolling();
      } else {
        stopLivePolling();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && $("chk-live-poll").checked && liveApiUrl && !$("evalDatetime").value) {
        fetchLiveQuote({ silent: true });
      }
    });

    $("btn-apply-market").addEventListener("click", applyMarket);
    $("btn-refresh-market").addEventListener("click", async () => {
      await fetchMarket();
      render();
    });
    $("btn-exit-sim").addEventListener("click", async () => {
      $("evalDatetime").value = "";
      $("nearSettlementOverride").value = "";
      if (market) applyMarket();
      else render();
      if (liveApiUrl) await fetchLiveQuote({ silent: true });
    });

    const { shouldAutoFetch } = initLiveConfig();
    render();
    await fetchMarket();
    if (!saved && market) {
      applyMarket();
    } else {
      if (market) syncMarketDerived();
      render();
    }

    if (shouldAutoFetch) {
      await fetchLiveQuote({ silent: false });
    }
    if ($("chk-live-poll").checked && liveApiUrl) {
      startLivePolling();
    }
  });
})();
