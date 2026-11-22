/*
 * 台指期跨月價差（吃正二轉倉豆腐）進場決策引擎 — 純前端版
 * 瀏覽器：window.SpreadEngine；Node：require('./engine.js')
 */
(function (root) {
  "use strict";

  const CONTRACT_SPECS = {
    TX: { name: "大台指 (TX)", pointValue: 200 },
    MTX: { name: "小台指 (MTX)", pointValue: 50 },
    TMF: { name: "微台指 (TMF)", pointValue: 10 },
  };

  // ---- 日期工具（一律以 UTC 計算純日期，避免時區誤差）----
  function ymd(y, m, d) {
    return new Date(Date.UTC(y, m - 1, d));
  }
  function iso(dt) {
    return dt.toISOString().slice(0, 10);
  }
  function parseIsoDate(s) {
    const [y, m, d] = s.split("-").map(Number);
    return ymd(y, m, d);
  }
  function addDays(dt, n) {
    return new Date(dt.getTime() + n * 86400000);
  }

  function thirdWednesday(year, month) {
    const first = ymd(year, month, 1);
    const daysUntilWed = (3 - first.getUTCDay() + 7) % 7; // getUTCDay: Sun=0, Wed=3
    return addDays(first, daysUntilWed + 14);
  }

  function nextMonth(year, month) {
    return month === 12 ? [year + 1, 1] : [year, month + 1];
  }

  /** start（不含）到 end（含）之間的週一～週五天數 */
  function countWeekdays(start, end) {
    let days = 0;
    for (let cur = addDays(start, 1); cur <= end; cur = addDays(cur, 1)) {
      const wd = cur.getUTCDay();
      if (wd !== 0 && wd !== 6) days++;
    }
    return days;
  }

  /** 取得台北時間的 { date: Date(UTC 純日期), hh, mm } */
  function taipeiNow(now) {
    const t = new Date((now || new Date()).getTime() + 8 * 3600000);
    return {
      date: ymd(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()),
      hh: t.getUTCHours(),
      mm: t.getUTCMinutes(),
    };
  }

  /** 解析 "YYYY-MM-DDTHH:MM"（視為台北時間），空字串則用目前台北時間 */
  function parseEvalTime(s) {
    if (!s) return taipeiNow();
    const [dPart, tPart = "00:00"] = s.split("T");
    const [hh, mm] = tPart.split(":").map(Number);
    return { date: parseIsoDate(dPart), hh: hh || 0, mm: mm || 0 };
  }

  const r2 = (x) => Math.round(x * 100) / 100;
  const fmt = (x) => String(r2(x));
  const fmtInt = (x) => Math.round(x).toLocaleString("en-US");

  const DEFAULTS = {
    indexLevel: 23000,
    annualRatePct: 1.75,
    expectedExDivPoints: 0,
    marketSpread: 0,
    ma10Spread: null,
    foreignNetShort: 30000,
    trustNetLong: null,
    trustChange20dPct: null,
    taiex5dChangePct: null,
    crashWeekLocked: false,
    bidAskGap: 2,
    exDivDatesConfirmed: true,
    evalDatetime: "",
    nearSettlementOverride: "",
    tradingDaysOverride: null,
    contractType: "MTX",
    contracts: 1,
    targetExitSpread: null,
  };

  function optNum(val) {
    if (val === null || val === "" || val === undefined) return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  }

  function evaluateEntry(input) {
    const inp = Object.assign({}, DEFAULTS, input || {});
    const now = parseEvalTime(inp.evalDatetime);
    const today = now.date;
    const minutes = now.hh * 60 + now.mm;

    // 1. 近月 / 遠月結算日
    let nearSettlement;
    if (inp.nearSettlementOverride) {
      nearSettlement = parseIsoDate(inp.nearSettlementOverride);
    } else {
      const y = today.getUTCFullYear();
      const m = today.getUTCMonth() + 1;
      nearSettlement = thirdWednesday(y, m);
      if (today > nearSettlement) {
        const [ny, nm] = nextMonth(y, m);
        nearSettlement = thirdWednesday(ny, nm);
      }
    }
    const [fy, fm] = nextMonth(nearSettlement.getUTCFullYear(), nearSettlement.getUTCMonth() + 1);
    const farSettlement = thirdWednesday(fy, fm);

    const tradingDaysLeft =
      inp.tradingDaysOverride !== null && inp.tradingDaysOverride !== "" && inp.tradingDaysOverride !== undefined
        ? Math.max(0, Number(inp.tradingDaysOverride))
        : countWeekdays(today, nearSettlement);
    const isSettlementDay = iso(today) === iso(nearSettlement);

    // 2. 理論價差 ＋ 近 10 日均價差 (MA10) 雙軌評估
    const settlementGapDays = Math.max(1, Math.round((farSettlement.getTime() - nearSettlement.getTime()) / 86400000));
    const fundingCost = r2(inp.indexLevel * (inp.annualRatePct / 100) * (settlementGapDays / 365));
    const theoreticalSpread = r2(fundingCost - inp.expectedExDivPoints);
    const mispricing = r2(inp.marketSpread - theoreticalSpread);
    const discountPoints = r2(-mispricing);

    const rawMa10 = optNum(inp.ma10Spread);
    const hasMa10 = rawMa10 !== null;
    const ma10Spread = hasMa10 ? r2(rawMa10) : null;
    const diffFromMa10 = hasMa10 ? r2(inp.marketSpread - ma10Spread) : null;
    const overheatCap = Math.max(15, Math.round(inp.indexLevel * 0.0004));

    const nearMonth = nearSettlement.getUTCMonth() + 1;
    const isExDivSeason = [6, 7, 8, 9].includes(nearMonth) || inp.expectedExDivPoints >= 5;
    const isExDivPeak = [6, 7].includes(nearMonth) || inp.expectedExDivPoints >= 150;

    const blockers = [];
    const warnings = [];
    const positives = [];
    const checks = [];

    function pushFactor(status, msg) {
      if (status === "block") blockers.push(msg);
      else if (status === "warn") warnings.push(msg);
      else positives.push(msg);
    }

    // --- 結算時機與尾盤 ---
    let phaseLabel, timingStatus, timingMsg;
    if (isSettlementDay && minutes >= 13 * 60 + 15) {
      phaseLabel = "尾盤黑洞";
      timingStatus = "block";
      timingMsg =
        "已進入結算日 13:15 後流動性黑洞，五檔掛單稀疏且 13:30 未平倉將強制結算近月、留下純遠月多單裸露風險，嚴禁新進場！";
    } else if (isSettlementDay) {
      phaseLabel = "結算日當天";
      timingStatus = "warn";
      timingMsg = "今日為結算日，正二轉倉已近尾聲，新進場空間有限，且務必於 13:00～13:15 前平倉完畢。";
    } else if (tradingDaysLeft === 1) {
      phaseLabel = "結算前夕";
      timingStatus = "warn";
      timingMsg = "距離結算僅剩 1 個交易日，正二轉倉買盤可能已大量進場，需確認目前價差尚未溢價。";
    } else if (tradingDaysLeft >= 2 && tradingDaysLeft <= 5) {
      phaseLabel = "黃金卡位期";
      timingStatus = "pass";
      timingMsg = `距離結算尚餘 ${tradingDaysLeft} 個交易日，正處於「結算前 2～5 天」黃金卡位佈局期。`;
    } else {
      phaseLabel = "過早觀察期";
      timingStatus = "warn";
      timingMsg = `距離結算還有 ${tradingDaysLeft} 個交易日，過早進場資金效率較低，且除權息或籌碼變數較大。`;
    }
    pushFactor(timingStatus, timingMsg);

    // --- 五檔流動性 ---
    let liqStatus, liqBadge, liqMsg;
    if (inp.bidAskGap >= 15) {
      liqStatus = "block";
      liqBadge = "滑價過大";
      liqMsg = `委賣與委買價差達 ${fmt(inp.bidAskGap)} 點，流動性極差、滑價風險過高，不建議此時掛單進場。`;
    } else if (inp.bidAskGap > 5) {
      liqStatus = "warn";
      liqBadge = "價差偏寬";
      liqMsg = `委賣與委買價差偏寬（${fmt(inp.bidAskGap)} 點），切勿追價，務必使用 ROD 限價複式單耐心掛單。`;
    } else {
      liqStatus = "pass";
      liqBadge = "流動性佳";
      liqMsg = `五檔買賣價差緊密（${fmt(inp.bidAskGap)} 點），流動性良好。`;
    }
    pushFactor(liqStatus, liqMsg);

    // --- 大盤近 5 日急殺風控 ---
    const rawRet5 = optNum(inp.taiex5dChangePct);
    const hasRet5 = rawRet5 !== null;
    const taiex5dChangePct = hasRet5 ? r2(rawRet5) : null;

    let crashStatus, crashBadge, crashMetric, crashMsg;
    if (hasRet5 && taiex5dChangePct <= -5) {
      crashStatus = "block";
      crashBadge = "崩盤急殺";
      crashMetric = `${fmt(taiex5dChangePct)}%`;
      crashMsg = `加權指數近 5 個交易日暴跌 ${fmt(Math.abs(taiex5dChangePct))}%（已達 5% 崩盤急殺紅線），正二 ETF 恐因淨值重挫被迫減碼多單且遠月賣壓失控，就算價差折價也不宜接刀，建議直接跳過本月。`;
      pushFactor("block", crashMsg);
    } else if (inp.crashWeekLocked) {
      crashStatus = "block";
      crashBadge = "崩盤月鎖定";
      crashMetric = hasRet5
        ? `${taiex5dChangePct >= 0 ? "+" : ""}${fmt(taiex5dChangePct)}%（週內≤-5%）`
        : "週內曾≤-5%";
      crashMsg =
        "本結算週（T-5 起）曾觸發大盤 5 日暴跌 5% 以上紅線，為避免股災短暫反彈後回頭接刀重傷（如 2025/04），已自動鎖定本月停手，切勿進場或加碼。";
      pushFactor("block", crashMsg);
    } else if (hasRet5 && taiex5dChangePct <= -3) {
      crashStatus = "warn";
      crashBadge = "急殺警戒";
      crashMetric = `${fmt(taiex5dChangePct)}%`;
      crashMsg = `加權指數近 5 個交易日急跌 ${fmt(Math.abs(taiex5dChangePct))}%（超過 3% 急殺警戒線），恐壓抑正二轉倉買盤並放大遠月賣壓，已自動降燈警戒，建議觀望或等大盤止穩再進場。`;
      pushFactor("warn", crashMsg);
    } else if (!hasRet5) {
      crashStatus = "pass";
      crashBadge = "未提供";
      crashMetric = "未填寫";
      crashMsg = "未填入大盤近 5 日漲跌幅，預設無系統性急殺異常（建議由盤後資料自動帶入）。";
    } else {
      crashStatus = "pass";
      crashBadge = "波動正常";
      crashMetric = `${taiex5dChangePct >= 0 ? "+" : ""}${fmt(taiex5dChangePct)}%`;
      crashMsg = `加權指數近 5 個交易日漲跌幅為 ${taiex5dChangePct >= 0 ? "+" : ""}${fmt(taiex5dChangePct)}%，未出現 3% 以上系統性急殺。`;
      pushFactor("pass", crashMsg);
    }

    // --- 價位安全邊際（雙軌 / 單軌） ---
    let valStatus, valBadge, valMsg, entryType, valuationLabel, plainSummary;
    if (!hasMa10) {
      if (mispricing <= -15) {
        valStatus = "pass";
        valBadge = "明顯折價";
        entryType = "value";
        valuationLabel = "深度折價（便宜，具安全邊際）";
        plainSummary = `比合理價便宜 ${fmt(discountPoints)} 點，具安全邊際`;
        valMsg = `市場報價低於理論值 ${fmt(discountPoints)} 點，具備充足安全邊際，適合分批買進價差單。`;
      } else if (mispricing <= 0) {
        valStatus = "pass";
        valBadge = "合理區間";
        entryType = "value";
        valuationLabel = mispricing < -3 ? "微幅折價（偏便宜）" : "合理價附近";
        plainSummary = mispricing < -3 ? `比合理價略便宜 ${fmt(discountPoints)} 點` : `貼近合理價（便宜 ${fmt(discountPoints)} 點）`;
        valMsg = `市場報價貼近或微幅折價於理論值（折價 ${fmt(discountPoints)} 點），價位尚屬合理。`;
      } else if (mispricing <= 15) {
        valStatus = "warn";
        valBadge = "微幅溢價";
        entryType = "wait";
        valuationLabel = mispricing <= 10 ? "合理價附近" : "溢價（昂貴，買盤已反映）";
        plainSummary = mispricing <= 10 ? `比合理價略貴 ${fmt(mispricing)} 點，安全邊際偏低` : `比合理價貴了 ${fmt(mispricing)} 點，須提防追高`;
        valMsg = `市場報價微幅溢價 ${fmt(mispricing)} 點，目前進場屬於純賭「正二轉倉力道大於外資空單轉倉」，缺乏價值回歸保護。`;
      } else {
        valStatus = "block";
        valBadge = "大幅溢價";
        entryType = "overheated";
        valuationLabel = "溢價（昂貴，買盤已反映）";
        plainSummary = `比合理價貴了 ${fmt(mispricing)} 點，買盤已反映，追高風險大`;
        valMsg = `市場報價（${fmt(inp.marketSpread)}）已高於理論價差（${fmt(theoreticalSpread)}）達 ${fmt(mispricing)} 點，轉倉買盤已充分反映，此時追多安全邊際不足。`;
      }
    } else {
      if (mispricing <= -15) {
        valStatus = "pass";
        valBadge = "價值折價";
        entryType = "value";
        valuationLabel = "深度折價（便宜，具安全邊際）";
        plainSummary = `比合理價便宜 ${fmt(discountPoints)} 點，具安全邊際`;
        valMsg = `市場報價低於理論值 ${fmt(discountPoints)} 點，具備充足絕對安全邊際，適合分批買進價差單。`;
      } else if (mispricing <= 0) {
        valStatus = "pass";
        valBadge = "貼近理論價";
        entryType = "value";
        valuationLabel = mispricing < -3 ? "微幅折價（偏便宜）" : "合理價附近";
        plainSummary = mispricing < -3 ? `比合理價略便宜 ${fmt(discountPoints)} 點` : `貼近合理價（便宜 ${fmt(discountPoints)} 點）`;
        valMsg = `市場報價貼近或微幅折價於理論值（折價 ${fmt(discountPoints)} 點），價位尚屬合理。`;
      } else if (diffFromMa10 <= 0) {
        valStatus = "pass";
        valBadge = "回檔買點";
        entryType = "pullback";
        valuationLabel = "溢價回檔至均線下（短線買點）";
        plainSummary = `雖高於理論 ${fmt(mispricing)} 點，但低於10日均 ${fmt(-diffFromMa10)} 點（回檔買點）`;
        valMsg = `市場報價（${fmt(inp.marketSpread)}）雖高於理論價 ${fmt(mispricing)} 點，但已回檔至近 10 日均價差（${fmt(ma10Spread)}）以下（低於均價 ${fmt(-diffFromMa10)} 點），短線未偷跑過熱。`;
      } else if (diffFromMa10 <= overheatCap) {
        valStatus = "warn";
        valBadge = "偏高待回檔";
        entryType = "wait";
        valuationLabel = "高於均價差（偏貴待回檔）";
        plainSummary = `高於10日均 ${fmt(diffFromMa10)} 點，建議等壓回 ${fmt(ma10Spread)} 以下`;
        valMsg = `市場報價高於近 10 日均價差（${fmt(ma10Spread)}）達 ${fmt(diffFromMa10)} 點，尚未超過過熱上限（${overheatCap} 點），建議等壓回 ${fmt(ma10Spread)} 以下再卡位。`;
      } else {
        valStatus = "block";
        valBadge = "過熱追高";
        entryType = "overheated";
        valuationLabel = "短線過熱溢價（追高風險大）";
        plainSummary = `高於10日均 ${fmt(diffFromMa10)} 點（超標 ${overheatCap}），追高風險大`;
        valMsg = `市場報價高於理論價 ${fmt(mispricing)} 點，且高於近 10 日均價差（${fmt(ma10Spread)}）達 ${fmt(diffFromMa10)} 點（超過上限 ${overheatCap} 點），短線偷跑過熱、易遭擁擠反殺。`;
      }
    }
    pushFactor(valStatus, valMsg);

    // --- 籌碼力量（投信淨多單 vs 外資淨空單，無投信資料時沿用單邊門檻）---
    const fns = inp.foreignNetShort;
    const rawTrust = optNum(inp.trustNetLong);
    const hasTrust = rawTrust !== null;
    const trustNetLong = hasTrust ? Math.max(0, Math.round(rawTrust)) : null;
    const chipNetDiff = hasTrust ? trustNetLong - fns : null;
    const chipRatio = hasTrust ? (fns > 0 ? r2(trustNetLong / fns) : 9.99) : null;

    const rawTrustChg = optNum(inp.trustChange20dPct);
    const hasTrustTrend = rawTrustChg !== null;
    const trustChange20dPct = hasTrustTrend ? r2(rawTrustChg) : null;
    const trustTrend = hasTrustTrend ? (trustChange20dPct > 0 ? "expanding" : "shrinking") : null;
    const trustTrendLabel =
      trustTrend === "expanding" ? "豆腐變肥" : trustTrend === "shrinking" ? "豆腐縮水" : null;

    let chipStatus, chipBadge, chipMsg;
    if (hasTrust) {
      if (fns === 0 || chipRatio >= 0.85 || chipNetDiff >= 0) {
        chipStatus = "pass";
        chipBadge = chipNetDiff >= 0 ? "多方占優" : "力道抗衡";
        chipMsg = `投信淨多單 ${fmtInt(trustNetLong)} 口 vs 外資淨空單 ${fmtInt(fns)} 口（比值 ${chipRatio}），正二轉倉買盤足以抗衡外資賣壓。`;
      } else if (chipRatio < 0.7 && -chipNetDiff >= 15000 && mispricing >= -10) {
        chipStatus = "block";
        chipBadge = "外資壓制";
        chipMsg = `投信淨多單（${fmtInt(trustNetLong)} 口）明顯不敵外資淨空單（${fmtInt(fns)} 口，比值僅 ${chipRatio}、淨差 ${fmtInt(chipNetDiff)} 口），且無明顯折價保護，外資反向轉倉恐壓垮價差。`;
      } else {
        chipStatus = "warn";
        chipBadge = "外資略占優";
        chipMsg = `投信淨多單 ${fmtInt(trustNetLong)} 口 vs 外資淨空單 ${fmtInt(fns)} 口（比值 ${chipRatio}、淨差 ${fmtInt(chipNetDiff)} 口），外資空單略占上風，建議縮小部位。`;
      }
    } else if (fns >= 45000 && mispricing >= -10) {
      chipStatus = "block";
      chipBadge = "空單極高";
      chipMsg = `外資未平倉淨空單高達 ${fmtInt(fns)} 口（遠超 4 萬口警戒線），且價差折價不足（僅 ${fmt(discountPoints)} 點），外資反向轉倉（買近賣遠）可能壓垮價差。`;
    } else if (fns >= 40000) {
      chipStatus = "warn";
      chipBadge = "警戒水位";
      chipMsg = `外資未平倉淨空單達 ${fmtInt(fns)} 口（已達 4 萬口警戒線），結算前外資反向轉倉賣壓可能壓抑價差漲幅，建議縮小部位或嚴設目標。`;
    } else if (fns >= 25000) {
      chipStatus = "warn";
      chipBadge = "中等水位";
      chipMsg = `外資淨空單為 ${fmtInt(fns)} 口，屬於中等水位，須持續追蹤結算前外資轉倉動向。`;
    } else {
      chipStatus = "pass";
      chipBadge = "賣壓可控";
      chipMsg = `外資淨空單水位偏低（${fmtInt(fns)} 口），反向轉倉賣壓相對可控。`;
    }
    if (trustTrend === "expanding") {
      chipMsg += ` 投信淨多單較 20 日前增加 +${fmt(trustChange20dPct)}%（豆腐變肥，轉倉買盤推力偏強）。`;
    } else if (trustTrend === "shrinking") {
      chipMsg += ` ⚠️ 投信淨多單較 20 日前縮水 ${fmt(trustChange20dPct)}%（豆腐縮水，轉倉力道偏弱，建議維持基本口數不放大 2 倍加碼）。`;
    }
    pushFactor(chipStatus, chipMsg);

    // --- 除權降口建議 & 除權息變數 ---
    const exDivSizeCut = isExDivPeak;
    const sizeMultiplier = isExDivPeak ? 0.5 : 1;
    const recommendedContracts = isExDivPeak ? Math.max(1, Math.floor(inp.contracts / 2)) : inp.contracts;
    const suggestSmallerContract = isExDivPeak && inp.contracts === 1 && inp.contractType !== "TMF";
    let sizeCutHint = null;
    if (isExDivPeak) {
      if (inp.contracts >= 2) {
        sizeCutHint = `6～7月／大除息高峰建議減半口數：${inp.contracts} 口 → ${recommendedContracts} 口`;
      } else if (inp.contractType === "TX") {
        sizeCutHint = "6～7月／大除息高峰僅 1 口大台無法減半，建議降規格改做 1～2 口小台（MTX）";
      } else if (inp.contractType === "MTX") {
        sizeCutHint = "6～7月／大除息高峰僅 1 口小台無法減半，建議降規格改做 2 口微台（TMF）";
      } else {
        sizeCutHint = "6～7月／大除息高峰維持 1 口微台（已為最小規格）輕倉操作";
      }
    }

    let exStatus, exBadge, exMsg;
    if (isExDivSeason && !inp.exDivDatesConfirmed) {
      exStatus = "warn";
      exBadge = isExDivPeak ? "高峰未全定" : "日期未全定";
      exMsg =
        "目前處於除權息影響區間，但主要權值股除息日尚未完全公告，存在「除息日跨月跳動」或「股利不如預期」的劇烈跳空風險，建議等主要權值股除息日確定後再進場" +
        (isExDivPeak ? `；且屬除息高峰，進場務必降口（${sizeCutHint}）。` : "。");
      pushFactor("warn", exMsg);
    } else if (isExDivPeak) {
      exStatus = "pass";
      exBadge = "高峰降口";
      exMsg = `區間主要大型權值股除息日已正式公告，但屬 6～7 月／大除息高峰（預計除息 ${fmt(inp.expectedExDivPoints)} 點），除息估算誤差與波動較大，${sizeCutHint}。`;
      pushFactor("pass", exMsg);
    } else if (isExDivSeason) {
      exStatus = "pass";
      exBadge = "日期已確認";
      exMsg = "區間主要大型權值股除息日已正式公告，理論價差估算準確度較高。";
      pushFactor("pass", exMsg);
    } else if (inp.expectedExDivPoints > 0) {
      exStatus = "pass";
      exBadge = "非除息旺季";
      exMsg = `非 6～9 月除權息旺季，區間已公告零星除息合計自動扣除 ${fmt(inp.expectedExDivPoints)} 點。`;
    } else {
      exStatus = "pass";
      exBadge = "非除息旺季";
      exMsg = "非 6～9 月除權息旺季且無預估除息點數，遠月合約不受除息蒸發干擾。";
    }

    checks.push(
      {
        id: "valuation",
        title: "價位安全邊際",
        status: valStatus,
        badge: valBadge,
        metric: mispricing > 0 ? `貴 ${fmt(mispricing)} 點` : `便宜 ${fmt(discountPoints)} 點`,
        summary: valMsg,
      },
      {
        id: "timing",
        title: "結算時機",
        status: timingStatus,
        badge: phaseLabel,
        metric: isSettlementDay ? "今日結算" : `剩 ${tradingDaysLeft} 交易日`,
        summary: timingMsg,
      },
      {
        id: "marketCrash",
        title: "大盤急殺風控",
        status: crashStatus,
        badge: crashBadge,
        metric: crashMetric,
        summary: crashMsg,
      },
      {
        id: "chips",
        title: hasTrust ? "多空籌碼力道" : "外資籌碼壓力",
        status: chipStatus,
        badge: chipBadge,
        metric:
          (hasTrust
            ? `投/外 ${chipRatio}（${chipNetDiff >= 0 ? "+" : ""}${fmtInt(chipNetDiff)}）`
            : `${fmtInt(fns)} 口`) +
          (hasTrustTrend ? `｜20日 ${trustChange20dPct > 0 ? "+" : ""}${fmt(trustChange20dPct)}%` : ""),
        summary: chipMsg,
      },
      {
        id: "liquidity",
        title: "五檔流動性",
        status: liqStatus,
        badge: liqBadge,
        metric: `價差 ${fmt(inp.bidAskGap)} 點`,
        summary: liqMsg,
      },
      {
        id: "exdiv",
        title: "除權息變數",
        status: exStatus,
        badge: exBadge,
        metric: inp.expectedExDivPoints > 0
          ? `自動試算 -${fmt(inp.expectedExDivPoints)} 點`
          : (isExDivSeason ? "自動試算 0 點" : "非旺季"),
        summary: exMsg,
      }
    );

    // 5. 燈號
    let signal, signalShort, signalLabel, actionSummary;
    if (blockers.length) {
      signal = "RED";
      signalShort = "先別進場";
      signalLabel = "🔴 不建議進場（觸發風控紅線）";
      actionSummary = "目前存在明確紅線風險，建議觀望或等待條件改善後再評估。";
    } else if (warnings.length >= 2 || (mispricing > 0 && warnings.length >= 1) || crashStatus === "warn") {
      signal = "YELLOW";
      signalShort = "謹慎評估／小額試單";
      signalLabel = "🟡 謹慎評估／小額試單";
      actionSummary =
        (crashStatus === "warn" ? "大盤近 5 日急跌逾 3%，已自動降燈警戒；" : "") +
        "部分條件未達理想或存在潛在變數，若欲參與建議以小台（MTX）或微台（TMF）輕倉分批試單，並嚴控出場時機。" +
        (isExDivPeak ? `（⚠️ 除權降口：${sizeCutHint}。）` : "") +
        (trustTrend === "shrinking" ? `（⚠️ 投信 20 日縮水 ${fmt(trustChange20dPct)}%，維持輕倉不加碼。）` : "");
    } else {
      signal = "GREEN";
      signalShort = "可以分批進場";
      signalLabel = "🟢 建議分批進場（具策略優勢）";
      actionSummary =
        "時間點、折溢價安全邊際與籌碼條件皆符合策略要求，可分批掛 ROD 限價「買進」跨月價差複式單。" +
        (isExDivPeak ? `（⚠️ 除權降口：${sizeCutHint}。）` : "") +
        (trustTrend === "shrinking"
          ? `（⚠️ 投信 20 日縮水 ${fmt(trustChange20dPct)}%，建議維持基本口數、暫停 2 倍加碼。）`
          : trustTrend === "expanding"
            ? `（🔥 投信 20 日增胖 +${fmt(trustChange20dPct)}%，轉倉買盤動能強。）`
            : "");
    }

    // 6. 損益與虛擬第六檔階梯停利
    const spec = CONTRACT_SPECS[inp.contractType] || CONTRACT_SPECS.MTX;
    const pv = spec.pointValue;
    const hasTarget = inp.targetExitSpread !== null && inp.targetExitSpread !== "" && inp.targetExitSpread !== undefined;
    const baseTarget = r2(hasMa10 ? Math.max(theoreticalSpread, ma10Spread) : theoreticalSpread);
    const tier1ExitSpread = Math.round((baseTarget + 40) * 10) / 10;
    const tier2ExitSpread = Math.round((baseTarget + 65) * 10) / 10;
    const suggestedExit = hasTarget ? Number(inp.targetExitSpread) : tier1ExitSpread;
    const expectedGainPoints = r2(suggestedExit - inp.marketSpread);
    const expectedProfitTwd = Math.round(expectedGainPoints * pv * inp.contracts);
    const stress30 = Math.round(30 * pv * inp.contracts);
    const stress50 = Math.round(50 * pv * inp.contracts);
    const recommendedProfitTwd = Math.round(expectedGainPoints * pv * recommendedContracts);
    const recommendedStress30 = Math.round(30 * pv * recommendedContracts);
    const recommendedStress50 = Math.round(50 * pv * recommendedContracts);

    const scaleUpFloor = hasMa10 ? r2(Math.min(theoreticalSpread, ma10Spread)) : theoreticalSpread;
    const scaleUpFloorLabel = hasMa10 ? "min(理論價, MA10)" : "理論價";
    const scaleUpMaxContracts = isExDivPeak ? Math.max(1, inp.contracts) : inp.contracts * 2;
    const canScaleUp = scaleUpMaxContracts > recommendedContracts;
    const scaleUpBlockedByTrustShrink = trustTrend === "shrinking";
    const scaleUpTriggered =
      signal === "GREEN" && canScaleUp && !scaleUpBlockedByTrustShrink && inp.marketSpread <= scaleUpFloor;
    const scaleUpProfitTwd = Math.round(expectedGainPoints * pv * scaleUpMaxContracts);
    const scaleUpStress30Twd = Math.round(30 * pv * scaleUpMaxContracts);
    const scaleUpStress50Twd = Math.round(50 * pv * scaleUpMaxContracts);
    let scaleUpHint = null;
    if (scaleUpTriggered) {
      const expandSuffix =
        trustTrend === "expanding" ? `｜投信20日 +${fmt(trustChange20dPct)}% 動能助推` : "";
      scaleUpHint = `🔥 觸發超值加碼：目前報價（${fmt(inp.marketSpread)}）≤ ${scaleUpFloorLabel}（${fmt(scaleUpFloor)}），可由 ${recommendedContracts} 口放大至 ${scaleUpMaxContracts} 口（預估損益 ${scaleUpProfitTwd >= 0 ? "+" : "-"}NT$ ${fmtInt(Math.abs(scaleUpProfitTwd))}，50 點洗盤緩衝約 NT$ ${fmtInt(scaleUpStress50Twd)}${expandSuffix}）`;
    } else if (signal === "GREEN" && canScaleUp && scaleUpBlockedByTrustShrink) {
      scaleUpHint =
        inp.marketSpread <= scaleUpFloor
          ? `⚠️ 投信淨多單較上月縮水（${fmt(trustChange20dPct)}%），雖報價 ≤ ${fmt(scaleUpFloor)}，本月暫停 2 倍加碼、建議維持 ${recommendedContracts} 口操作`
          : `⚠️ 投信淨多單較上月縮水（${fmt(trustChange20dPct)}%），本月暫停超值加碼、建議維持 ${recommendedContracts} 口穩健操作`;
    } else if (signal === "GREEN" && canScaleUp) {
      scaleUpHint = `📌 預掛加碼線：先買 ${recommendedContracts} 口；盤中若壓回 ≤ ${fmt(scaleUpFloor)}（${scaleUpFloorLabel}）可加碼放大至 ${scaleUpMaxContracts} 口（可用 ROD 限價單享虛擬第六檔優先撮合）`;
    }

    const effectiveContracts = scaleUpTriggered ? scaleUpMaxContracts : recommendedContracts;
    const tier1Contracts = effectiveContracts >= 2 ? Math.ceil(effectiveContracts / 2) : effectiveContracts;
    const tier2Contracts = effectiveContracts - tier1Contracts;
    const tier1GainPoints = r2(tier1ExitSpread - inp.marketSpread);
    const tier2GainPoints = r2(tier2ExitSpread - inp.marketSpread);
    const tier1ProfitTwd = Math.round(tier1GainPoints * pv * tier1Contracts);
    const tier2ProfitTwd = Math.round(tier2GainPoints * pv * tier2Contracts);
    const ladderTotalProfitTwd = tier1ProfitTwd + tier2ProfitTwd;
    const exitLadder = {
      isCustom: hasTarget,
      baseTarget,
      effectiveContracts,
      tier1: {
        offset: 40,
        spread: tier1ExitSpread,
        gainPoints: tier1GainPoints,
        contracts: tier1Contracts,
        profitTwd: tier1ProfitTwd,
      },
      tier2: {
        offset: 65,
        spread: tier2ExitSpread,
        gainPoints: tier2GainPoints,
        contracts: tier2Contracts,
        profitTwd: tier2ProfitTwd,
      },
      totalProfitTwd: ladderTotalProfitTwd,
    };

    const takeProfitChecklist = hasTarget
      ? `建倉後直接預掛 ROD「賣出」價差限價單於自訂目標價 ${suggestedExit}（享虛擬第六檔優先撮合），或於結算前一天至早盤分批停利。`
      : effectiveContracts >= 2
        ? `建倉後善用期交所「虛擬第六檔」優先撮合，直接預掛階梯 ROD 賣出價差單等投信來撞：第 1 批 ${tier1Contracts} 口掛 ${tier1ExitSpread}（基準 +40）先鎖利，第 2 批 ${tier2Contracts} 口掛 ${tier2ExitSpread}（基準 +65）或留至結算早盤平倉。`
        : `建倉後善用期交所「虛擬第六檔」優先撮合，直接預掛 ROD 賣出價差單等投信來撞：第 1 批掛 ${tier1ExitSpread}（基準 +40）先鎖利，或視轉倉動能拚 ${tier2ExitSpread}（基準 +65）。`;

    const checklist = [
      `使用券商軟體「台指期價差（複式單）」介面，選擇 ${inp.contractType} 近月／遠月組合，切勿分開單邊下單。`,
      "建倉方向選擇「買進」價差單（系統同步成交：賣出近月 ＋ 買進遠月），委託條件限用「ROD 限價單」（期交所衍生委託視為虛擬第六檔，撮合優先權高於單式限價單）。",
      ...(isExDivPeak
        ? [`⚠️ 除權息高峰降口確認：${sizeCutHint}，避免單月除息估算誤差放大波動。`]
        : []),
      ...(scaleUpBlockedByTrustShrink
        ? [`⚠️ 投信淨多單較 20 日前縮水（${fmt(trustChange20dPct)}%），本月轉倉力道偏弱，維持 ${recommendedContracts} 口不放大加碼，停利偏重第 1 批價位落袋為安。`]
        : []),
      ...(scaleUpTriggered
        ? [`🔥 超值加碼確認：報價已 ≤ ${fmt(scaleUpFloor)}，若放大至 ${scaleUpMaxContracts} 口，請確認帳上預留 50 點洗盤緩衝約 NT$ ${fmtInt(scaleUpStress50Twd)}${isExDivPeak ? "（已套用除權高峰減半上限）" : ""}。`]
        : []),
      `帳上除價差減收保證金外，至少多預留 1～2 倍緩衝資金（預估盤中 30～50 點反向洗盤波動約 NT$ ${fmtInt(stress30)} ～ NT$ ${fmtInt(stress50)}）。`,
      takeProfitChecklist,
      `務必於結算日（${iso(nearSettlement)}）13:00～13:15 前全數平倉，避開 13:15 後流動性黑洞與 13:30 強制現金結算風險。`,
    ];

    return {
      signal,
      signalShort,
      signalLabel,
      actionSummary,
      calendar: {
        evalDate: iso(today),
        nearSettlement: iso(nearSettlement),
        farSettlement: iso(farSettlement),
        settlementGapDays,
        tradingDaysLeft,
        isSettlementDay,
        isExDivSeason,
        isExDivPeak,
        phaseLabel,
      },
      marketRisk: {
        taiex5dChangePct,
        crashWeekLocked: Boolean(inp.crashWeekLocked),
        status: crashStatus,
        badge: crashBadge,
      },
      valuation: {
        fundingCost,
        expectedExDivPoints: inp.expectedExDivPoints,
        theoreticalSpread,
        marketSpread: inp.marketSpread,
        mispricing,
        discountPoints,
        ma10Spread,
        diffFromMa10,
        overheatCap,
        entryType,
        valuationLabel,
        plainSummary,
      },
      chips: {
        foreignNetShort: fns,
        trustNetLong,
        trustChange20dPct,
        trustTrend,
        trustTrendLabel,
        chipNetDiff,
        chipRatio,
      },
      riskFactors: { blockers, warnings, positives },
      checks,
      sizing: {
        contractName: spec.name,
        pointValue: pv,
        contracts: inp.contracts,
        exDivSizeCut,
        sizeMultiplier,
        recommendedContracts,
        suggestSmallerContract,
        sizeCutHint,
        scaleUpFloor,
        scaleUpMaxContracts,
        scaleUpBlockedByTrustShrink,
        scaleUpTriggered,
        scaleUpProfitTwd,
        scaleUpStress30Twd,
        scaleUpStress50Twd,
        scaleUpHint,
        exitLadder,
        suggestedExitSpread: suggestedExit,
        expectedGainPoints,
        expectedProfitTwd,
        recommendedProfitTwd,
        stressLoss30Twd: stress30,
        stressLoss50Twd: stress50,
        recommendedStress30Twd: recommendedStress30,
        recommendedStress50Twd: recommendedStress50,
      },
      checklist,
    };
  }

  const api = { CONTRACT_SPECS, thirdWednesday, countWeekdays, taipeiNow, evaluateEntry, iso, parseIsoDate };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SpreadEngine = api;
})(typeof self !== "undefined" ? self : this);
