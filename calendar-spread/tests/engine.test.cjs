// 執行：node --test tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const { thirdWednesday, evaluateEntry, iso } = require("../engine.js");

test("每月第三個週三", () => {
  assert.equal(iso(thirdWednesday(2026, 11)), "2026-11-18");
  assert.equal(iso(thirdWednesday(2026, 7)), "2026-07-15");
  assert.equal(iso(thirdWednesday(2027, 1)), "2027-01-20");
});

test("7月除息低估：依35天結算間隔理論 -209.73、報價 -240、結算前 4 天 → 綠燈", () => {
  const r = evaluateEntry({
    indexLevel: 23000,
    annualRatePct: 1.826,
    expectedExDivPoints: 250,
    marketSpread: -240,
    foreignNetShort: 22000,
    bidAskGap: 2,
    evalDatetime: "2026-07-09T10:00",
    contractType: "TX",
    targetExitSpread: -170,
  });
  assert.equal(r.signal, "GREEN");
  assert.equal(r.calendar.settlementGapDays, 35);
  assert.equal(r.valuation.fundingCost, 40.27);
  assert.equal(r.valuation.theoreticalSpread, -209.73);
  assert.ok(r.valuation.discountPoints > 30);
  assert.equal(r.calendar.tradingDaysLeft, 4);
  assert.equal(r.sizing.expectedGainPoints, 70);
  assert.equal(r.sizing.expectedProfitTwd, 14000);
});

test("報價 -170 高估 45 點 → 紅燈", () => {
  const r = evaluateEntry({
    indexLevel: 23000,
    annualRatePct: 1.826,
    expectedExDivPoints: 250,
    marketSpread: -170,
    foreignNetShort: 22000,
    evalDatetime: "2026-07-14T10:00",
  });
  assert.equal(r.signal, "RED");
  assert.ok(r.riskFactors.blockers.some((b) => b.includes("高於理論價差")));
});

test("結算日 13:18 流動性黑洞 → 紅燈且至少兩條紅線", () => {
  const r = evaluateEntry({
    marketSpread: 200,
    foreignNetShort: 25000,
    bidAskGap: 42,
    evalDatetime: "2026-11-18T13:18",
  });
  assert.equal(r.signal, "RED");
  assert.ok(r.calendar.isSettlementDay);
  assert.ok(r.riskFactors.blockers.length >= 2);
});

test("外資淨空單 46,000 口且折價不足 → 紅燈", () => {
  const r = evaluateEntry({
    marketSpread: 35,
    foreignNetShort: 46000,
    evalDatetime: "2026-11-12T10:00",
  });
  assert.equal(r.signal, "RED");
  assert.ok(r.riskFactors.blockers.some((b) => b.includes("外資未平倉淨空單")));
});

test("結算日過後自動換到下個月", () => {
  const r = evaluateEntry({ evalDatetime: "2026-11-21T09:00" });
  assert.equal(r.calendar.nearSettlement, "2026-12-16");
  assert.equal(r.calendar.farSettlement, "2027-01-20");
});

test("結構化體檢輸出：綠燈情境回傳 6 項全通過與黃金卡位期", () => {
  const r = evaluateEntry({
    indexLevel: 23000,
    annualRatePct: 1.826,
    expectedExDivPoints: 250,
    marketSpread: -240,
    foreignNetShort: 22000,
    bidAskGap: 2,
    evalDatetime: "2026-07-09T10:00",
  });
  assert.equal(r.signalShort, "可以分批進場");
  assert.equal(r.calendar.phaseLabel, "黃金卡位期");
  assert.equal(r.checks.length, 6);
  assert.ok(r.checks.every((c) => c.status === "pass"));
  assert.ok(r.valuation.plainSummary.includes("便宜"));
});

test("結構化體檢輸出：高估與高空單紅燈情境精確標記 block", () => {
  const r = evaluateEntry({
    indexLevel: 35800,
    annualRatePct: 1.75,
    expectedExDivPoints: 0,
    marketSpread: 133,
    foreignNetShort: 97863,
    bidAskGap: 2,
    evalDatetime: "2026-11-21T10:00",
  });
  assert.equal(r.signalShort, "先別進場");
  const byId = Object.fromEntries(r.checks.map((c) => [c.id, c]));
  assert.equal(byId.valuation.status, "block");
  assert.equal(byId.chips.status, "block");
  assert.equal(byId.exdiv.status, "pass");
});

test("依兩次結算日實際間隔天數計算資金成本（28天 vs 35天）", () => {
  const r28 = evaluateEntry({
    indexLevel: 35886,
    annualRatePct: 1.75,
    expectedExDivPoints: 0,
    evalDatetime: "2026-11-12T10:00",
  });
  assert.equal(r28.calendar.nearSettlement, "2026-11-18");
  assert.equal(r28.calendar.farSettlement, "2026-12-16");
  assert.equal(r28.calendar.settlementGapDays, 28);
  assert.equal(r28.valuation.fundingCost, 48.18);

  const r35 = evaluateEntry({
    indexLevel: 35886,
    annualRatePct: 1.75,
    expectedExDivPoints: 0,
    evalDatetime: "2026-11-21T10:00",
  });
  assert.equal(r35.calendar.nearSettlement, "2026-12-16");
  assert.equal(r35.calendar.farSettlement, "2027-01-20");
  assert.equal(r35.calendar.settlementGapDays, 35);
  assert.equal(r35.valuation.fundingCost, 60.22);
});

test("雙軌價位：2026 回檔卡位（高於理論但低於 MA10 且籌碼比達標）→ 綠燈", () => {
  const r = evaluateEntry({
    indexLevel: 34000,
    annualRatePct: 1.75,
    expectedExDivPoints: 18,
    marketSpread: 97,
    ma10Spread: 100.1,
    trustNetLong: 36571,
    foreignNetShort: 40958,
    bidAskGap: 2,
    evalDatetime: "2026-03-11T10:00",
  });
  const byId = Object.fromEntries(r.checks.map((c) => [c.id, c]));
  assert.equal(r.signal, "GREEN");
  assert.equal(byId.valuation.badge, "回檔買點");
  assert.equal(byId.chips.status, "pass");
  assert.equal(r.valuation.entryType, "pullback");
});

test("雙軌價位：2026 過熱追高（超漲 MA10 超過過熱上限）→ 紅燈", () => {
  const r = evaluateEntry({
    indexLevel: 44600,
    annualRatePct: 1.75,
    expectedExDivPoints: 85,
    marketSpread: 157,
    ma10Spread: 130.6,
    trustNetLong: 82383,
    foreignNetShort: 86633,
    bidAskGap: 2,
    evalDatetime: "2026-08-12T10:00",
  });
  const byId = Object.fromEntries(r.checks.map((c) => [c.id, c]));
  assert.equal(r.signal, "RED");
  assert.equal(byId.valuation.status, "block");
  assert.equal(byId.valuation.badge, "過熱追高");
  assert.equal(r.valuation.overheatCap, 18);
});

test("籌碼拔河：2026/11 雙十萬口對決（投信 10.19萬 vs 外資 10.43萬，比值 0.98）→ 綠燈", () => {
  const r = evaluateEntry({
    indexLevel: 44136,
    annualRatePct: 1.75,
    expectedExDivPoints: 0,
    marketSpread: 14,
    ma10Spread: 90.1,
    trustNetLong: 101870,
    foreignNetShort: 104271,
    bidAskGap: 2,
    evalDatetime: "2026-11-11T10:00",
  });
  const byId = Object.fromEntries(r.checks.map((c) => [c.id, c]));
  assert.equal(r.signal, "GREEN");
  assert.equal(byId.chips.status, "pass");
  assert.equal(r.chips.chipRatio, 0.98);
});

test("籌碼拔河：外資大幅壓制（投信 2萬 vs 外資 5萬，無折價保護）→ 紅燈", () => {
  const r = evaluateEntry({
    indexLevel: 35000,
    annualRatePct: 1.75,
    expectedExDivPoints: 0,
    marketSpread: 55,
    ma10Spread: 60,
    trustNetLong: 20000,
    foreignNetShort: 50000,
    bidAskGap: 2,
    evalDatetime: "2026-11-12T10:00",
  });
  const byId = Object.fromEntries(r.checks.map((c) => [c.id, c]));
  assert.equal(r.signal, "RED");
  assert.equal(byId.chips.status, "block");
  assert.equal(byId.chips.badge, "外資壓制");
});

test("大盤近 5 日急跌 -3.5% → 強制降為黃燈警戒", () => {
  const r = evaluateEntry({
    indexLevel: 44136,
    annualRatePct: 1.75,
    expectedExDivPoints: 0,
    marketSpread: 14,
    ma10Spread: 90.1,
    trustNetLong: 101870,
    foreignNetShort: 104271,
    taiex5dChangePct: -3.5,
    bidAskGap: 2,
    evalDatetime: "2026-11-11T10:00",
  });
  const byId = Object.fromEntries(r.checks.map((c) => [c.id, c]));
  assert.equal(r.signal, "YELLOW");
  assert.equal(r.marketRisk.status, "warn");
  assert.equal(byId.marketCrash.status, "warn");
  assert.equal(byId.marketCrash.badge, "急殺警戒");
  assert.ok(r.actionSummary.includes("急跌逾 3%"));
});

test("大盤近 5 日暴跌 -16%（2025/04 關稅股災情境）→ 紅燈禁止接刀", () => {
  const r = evaluateEntry({
    indexLevel: 17392,
    annualRatePct: 1.6,
    expectedExDivPoints: 3,
    marketSpread: -7,
    ma10Spread: 15.8,
    trustNetLong: 27325,
    foreignNetShort: 27871,
    taiex5dChangePct: -16.0,
    bidAskGap: 2,
    evalDatetime: "2025-04-09T10:00",
  });
  const byId = Object.fromEntries(r.checks.map((c) => [c.id, c]));
  assert.equal(r.signal, "RED");
  assert.equal(r.marketRisk.status, "block");
  assert.equal(byId.marketCrash.status, "block");
  assert.equal(byId.marketCrash.badge, "崩盤急殺");
});

test("大盤近 5 日正常波動 -2.0% → 維持綠燈", () => {
  const r = evaluateEntry({
    indexLevel: 44136,
    annualRatePct: 1.75,
    expectedExDivPoints: 0,
    marketSpread: 14,
    ma10Spread: 90.1,
    trustNetLong: 101870,
    foreignNetShort: 104271,
    taiex5dChangePct: -2.0,
    bidAskGap: 2,
    evalDatetime: "2026-11-11T10:00",
  });
  const byId = Object.fromEntries(r.checks.map((c) => [c.id, c]));
  assert.equal(r.signal, "GREEN");
  assert.equal(r.marketRisk.status, "pass");
  assert.equal(byId.marketCrash.badge, "波動正常");
});

test("除權降口：7 月高峰 4 口建議減半為 2 口且維持綠燈", () => {
  const r = evaluateEntry({
    indexLevel: 23000,
    annualRatePct: 1.826,
    expectedExDivPoints: 250,
    marketSpread: -240,
    foreignNetShort: 22000,
    bidAskGap: 2,
    evalDatetime: "2026-07-09T10:00",
    contractType: "MTX",
    contracts: 4,
    targetExitSpread: -170,
  });
  const byId = Object.fromEntries(r.checks.map((c) => [c.id, c]));
  assert.equal(r.signal, "GREEN");
  assert.equal(r.calendar.isExDivPeak, true);
  assert.equal(r.sizing.exDivSizeCut, true);
  assert.equal(r.sizing.recommendedContracts, 2);
  assert.equal(r.sizing.recommendedProfitTwd, r.sizing.expectedProfitTwd / 2);
  assert.equal(byId.exdiv.badge, "高峰降口");
  assert.ok(r.actionSummary.includes("除權降口"));
  assert.ok(r.checklist.some((item) => item.includes("除權息高峰降口確認")));
});

test("除權降口：6 月僅 1 口大台提示降規格改做小台，非高峰月不降口", () => {
  const rJune = evaluateEntry({
    indexLevel: 23000,
    annualRatePct: 1.8,
    expectedExDivPoints: 280,
    marketSpread: -260,
    foreignNetShort: 20000,
    bidAskGap: 2,
    evalDatetime: "2026-06-11T10:00",
    contractType: "TX",
    contracts: 1,
  });
  assert.equal(rJune.sizing.exDivSizeCut, true);
  assert.equal(rJune.sizing.recommendedContracts, 1);
  assert.equal(rJune.sizing.suggestSmallerContract, true);
  assert.ok(rJune.sizing.sizeCutHint.includes("小台（MTX）"));

  const rNov = evaluateEntry({
    indexLevel: 44136,
    annualRatePct: 1.75,
    expectedExDivPoints: 0,
    marketSpread: 14,
    ma10Spread: 90.1,
    trustNetLong: 101870,
    foreignNetShort: 104271,
    bidAskGap: 2,
    evalDatetime: "2026-11-11T10:00",
    contracts: 4,
  });
  assert.equal(rNov.calendar.isExDivPeak, false);
  assert.equal(rNov.sizing.exDivSizeCut, false);
  assert.equal(rNov.sizing.recommendedContracts, 4);
  assert.equal(rNov.sizing.sizeCutHint, null);
});

test("崩盤週整月鎖定：2025/04 結算週內曾跌逾 5%，即使 T-2 轉正仍鎖定紅燈", () => {
  const r = evaluateEntry({
    indexLevel: 19513,
    annualRatePct: 1.6,
    expectedExDivPoints: 3,
    marketSpread: -23,
    ma10Spread: 5.3,
    trustNetLong: 27325,
    foreignNetShort: 27871,
    taiex5dChangePct: 1.5,
    crashWeekLocked: true,
    bidAskGap: 2,
    evalDatetime: "2025-04-14T10:00",
    contracts: 2,
  });
  const byId = Object.fromEntries(r.checks.map((c) => [c.id, c]));
  assert.equal(r.signal, "RED");
  assert.equal(r.marketRisk.status, "block");
  assert.equal(r.marketRisk.crashWeekLocked, true);
  assert.equal(byId.marketCrash.badge, "崩盤月鎖定");
  assert.equal(r.sizing.scaleUpTriggered, false);
});

test("超值加碼：2026/11 報價低於 min(理論價, MA10) → 2 口觸發放大至 4 口", () => {
  const r = evaluateEntry({
    indexLevel: 44136,
    annualRatePct: 1.75,
    expectedExDivPoints: 0,
    marketSpread: 24,
    ma10Spread: 84.8,
    trustNetLong: 101870,
    foreignNetShort: 104271,
    taiex5dChangePct: 3.0,
    bidAskGap: 2,
    evalDatetime: "2026-11-11T10:00",
    contractType: "MTX",
    contracts: 2,
    targetExitSpread: 110,
  });
  assert.equal(r.signal, "GREEN");
  assert.equal(r.sizing.recommendedContracts, 2);
  assert.equal(r.sizing.scaleUpMaxContracts, 4);
  assert.equal(r.sizing.scaleUpTriggered, true);
  assert.equal(r.sizing.scaleUpProfitTwd, r.sizing.expectedProfitTwd * 2);
  assert.ok(r.checklist.some((item) => item.includes("超值加碼確認")));
});

test("超值加碼預掛線：綠燈回檔買點但高於理論價 → 不觸發加碼但顯示預掛線", () => {
  const r = evaluateEntry({
    indexLevel: 34000,
    annualRatePct: 1.75,
    expectedExDivPoints: 18,
    marketSpread: 97,
    ma10Spread: 100.1,
    trustNetLong: 36571,
    foreignNetShort: 40958,
    bidAskGap: 2,
    evalDatetime: "2026-03-11T10:00",
    contractType: "MTX",
    contracts: 2,
  });
  assert.equal(r.signal, "GREEN");
  assert.equal(r.sizing.scaleUpTriggered, false);
  assert.ok(r.sizing.scaleUpHint.includes("預掛加碼線"));
});

test("除權高峰超值加碼維持減半上限：2 口降 1 口可放大至 2 口，1 口不放大", () => {
  const r2 = evaluateEntry({
    indexLevel: 23000,
    annualRatePct: 1.826,
    expectedExDivPoints: 250,
    marketSpread: -240,
    ma10Spread: -210,
    foreignNetShort: 22000,
    bidAskGap: 2,
    evalDatetime: "2026-07-09T10:00",
    contractType: "TX",
    contracts: 2,
  });
  assert.equal(r2.signal, "GREEN");
  assert.equal(r2.sizing.recommendedContracts, 1);
  assert.equal(r2.sizing.scaleUpMaxContracts, 2);
  assert.equal(r2.sizing.scaleUpTriggered, true);

  const r1 = evaluateEntry({
    indexLevel: 23000,
    annualRatePct: 1.826,
    expectedExDivPoints: 250,
    marketSpread: -240,
    ma10Spread: -210,
    foreignNetShort: 22000,
    bidAskGap: 2,
    evalDatetime: "2026-07-09T10:00",
    contractType: "TX",
    contracts: 1,
  });
  assert.equal(r1.sizing.recommendedContracts, 1);
  assert.equal(r1.sizing.scaleUpMaxContracts, 1);
  assert.equal(r1.sizing.scaleUpTriggered, false);
});

test("非旺季零星自動除息（如 11 月 0.36 點）精確扣除理論價且不誤判為除息旺季", () => {
  const r = evaluateEntry({
    indexLevel: 35800,
    annualRatePct: 1.604,
    expectedExDivPoints: 0.36,
    marketSpread: 40,
    ma10Spread: 60,
    trustNetLong: 87599,
    foreignNetShort: 97863,
    bidAskGap: 2,
    evalDatetime: "2026-12-11T10:00",
  });
  const byId = Object.fromEntries(r.checks.map((c) => [c.id, c]));
  assert.equal(r.calendar.isExDivSeason, false);
  assert.equal(r.valuation.theoreticalSpread, Math.round((r.valuation.fundingCost - 0.36) * 100) / 100);
  assert.equal(byId.exdiv.badge, "非除息旺季");
  assert.ok(byId.exdiv.metric.includes("自動試算 -0.36 點"));
});

test("投信 20 日趨勢增胖（+4.56%）：標記豆腐變肥且允許超值 2 倍加碼", () => {
  const r = evaluateEntry({
    indexLevel: 44136,
    annualRatePct: 1.75,
    expectedExDivPoints: 0,
    marketSpread: 24,
    ma10Spread: 84.8,
    trustNetLong: 87599,
    trustChange20dPct: 4.56,
    foreignNetShort: 97863,
    taiex5dChangePct: 1.5,
    bidAskGap: 2,
    evalDatetime: "2026-11-11T10:00",
    contractType: "MTX",
    contracts: 2,
  });
  const byId = Object.fromEntries(r.checks.map((c) => [c.id, c]));
  assert.equal(r.signal, "GREEN");
  assert.equal(r.chips.trustTrend, "expanding");
  assert.equal(r.chips.trustTrendLabel, "豆腐變肥");
  assert.equal(r.sizing.scaleUpBlockedByTrustShrink, false);
  assert.equal(r.sizing.scaleUpTriggered, true);
  assert.equal(r.sizing.scaleUpMaxContracts, 4);
  assert.ok(byId.chips.metric.includes("20日 +4.56%"));
  assert.ok(r.sizing.scaleUpHint.includes("動能助推"));
  assert.ok(r.actionSummary.includes("豆腐變肥") === false && r.actionSummary.includes("投信 20 日增胖"));
});

test("投信 20 日趨勢縮水（-6.5%）：維持綠燈不降級，但暫停超值 2 倍加碼並提示保守停利", () => {
  const r = evaluateEntry({
    indexLevel: 44136,
    annualRatePct: 1.75,
    expectedExDivPoints: 0,
    marketSpread: 24,
    ma10Spread: 84.8,
    trustNetLong: 87599,
    trustChange20dPct: -6.5,
    foreignNetShort: 97863,
    taiex5dChangePct: 1.5,
    bidAskGap: 2,
    evalDatetime: "2026-11-11T10:00",
    contractType: "MTX",
    contracts: 2,
  });
  const byId = Object.fromEntries(r.checks.map((c) => [c.id, c]));
  assert.equal(r.signal, "GREEN");
  assert.equal(byId.chips.status, "pass");
  assert.equal(r.chips.trustTrend, "shrinking");
  assert.equal(r.chips.trustTrendLabel, "豆腐縮水");
  assert.equal(r.sizing.scaleUpBlockedByTrustShrink, true);
  assert.equal(r.sizing.scaleUpTriggered, false);
  assert.equal(r.sizing.recommendedContracts, 2);
  assert.ok(byId.chips.metric.includes("20日 -6.5%"));
  assert.ok(r.sizing.scaleUpHint.includes("暫停 2 倍加碼"));
  assert.ok(r.checklist.some((item) => item.includes("維持 2 口不放大加碼")));
});

test("虛擬第六檔階梯預掛停利（+40 / +65）：驗證 2 口、4 口與 1 口分批口數及金額試算", () => {
  const base = {
    indexLevel: 34000,
    annualRatePct: 1.75,
    expectedExDivPoints: 18,
    marketSpread: 97,
    ma10Spread: 100.1,
    trustNetLong: 36571,
    foreignNetShort: 40958,
    bidAskGap: 2,
    evalDatetime: "2026-03-11T10:00",
    contractType: "MTX",
  };

  const r2 = evaluateEntry({ ...base, contracts: 2 });
  assert.equal(r2.sizing.exitLadder.isCustom, false);
  assert.equal(r2.sizing.exitLadder.tier1.spread, 140.1);
  assert.equal(r2.sizing.exitLadder.tier2.spread, 165.1);
  assert.equal(r2.sizing.suggestedExitSpread, 140.1);
  assert.equal(r2.sizing.exitLadder.effectiveContracts, 2);
  assert.equal(r2.sizing.exitLadder.tier1.contracts, 1);
  assert.equal(r2.sizing.exitLadder.tier2.contracts, 1);
  assert.equal(r2.sizing.exitLadder.tier1.profitTwd, 2155);
  assert.equal(r2.sizing.exitLadder.tier2.profitTwd, 3405);
  assert.equal(r2.sizing.exitLadder.totalProfitTwd, 5560);
  assert.ok(r2.checklist.some((item) => item.includes("虛擬第六檔") && item.includes("140.1") && item.includes("165.1")));

  const r1 = evaluateEntry({ ...base, contracts: 1 });
  assert.equal(r1.sizing.exitLadder.effectiveContracts, 1);
  assert.equal(r1.sizing.exitLadder.tier1.contracts, 1);
  assert.equal(r1.sizing.exitLadder.tier2.contracts, 0);
  assert.equal(r1.sizing.exitLadder.totalProfitTwd, 2155);

  const rScaled = evaluateEntry({
    indexLevel: 44136,
    annualRatePct: 1.75,
    expectedExDivPoints: 0,
    marketSpread: 24,
    ma10Spread: 84.8,
    trustNetLong: 87599,
    trustChange20dPct: 4.56,
    foreignNetShort: 97863,
    taiex5dChangePct: 1.5,
    bidAskGap: 2,
    evalDatetime: "2026-11-11T10:00",
    contractType: "MTX",
    contracts: 2,
  });
  assert.equal(rScaled.sizing.exitLadder.effectiveContracts, 4);
  assert.equal(rScaled.sizing.exitLadder.tier1.contracts, 2);
  assert.equal(rScaled.sizing.exitLadder.tier2.contracts, 2);
  assert.equal(
    rScaled.sizing.exitLadder.totalProfitTwd,
    rScaled.sizing.exitLadder.tier1.profitTwd + rScaled.sizing.exitLadder.tier2.profitTwd
  );
});

test("自訂目標平倉價差覆寫階梯預設：exitLadder.isCustom 為 true 且沿用自訂目標價", () => {
  const r = evaluateEntry({
    indexLevel: 34000,
    annualRatePct: 1.75,
    expectedExDivPoints: 18,
    marketSpread: 97,
    ma10Spread: 100.1,
    trustNetLong: 36571,
    foreignNetShort: 40958,
    bidAskGap: 2,
    evalDatetime: "2026-03-11T10:00",
    contractType: "MTX",
    contracts: 2,
    targetExitSpread: 150,
  });
  assert.equal(r.sizing.exitLadder.isCustom, true);
  assert.equal(r.sizing.suggestedExitSpread, 150);
  assert.equal(r.sizing.expectedGainPoints, 53);
  assert.ok(r.checklist.some((item) => item.includes("自訂目標價 150")));
});
