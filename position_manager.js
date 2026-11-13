// ═════════════════════════════════════════════════════════════════
// 🧭 持倉管理中心 (Position Manager)
//   #2 即時部位監控：停利單價、防穿價觸價點、損益、轉倉建議
//   #3 保證金 / 維持率試算：依期交所公告保證金，算出追繳點與代沖銷點
//   #4 均線訊號燈：MA5/MA21 (B5 Put)、MA60 減半、波動率、跌深反彈、事件週 → 建議 OTM %
// 依賴 app.js 的全域：rawData, getTaiexMA, blackScholesCall, blackScholesPut,
//   roundToTaifexOptionTick, getTaifexContractCodeByExpiry, getNextWeeklyExpiryDate,
//   getNextPeriodExpiryStr, strikeRuleSelect, customOtmValueInput
// ═════════════════════════════════════════════════════════════════
(function () {
    'use strict';

    const LS_POS = 'cc_position_v1';
    const LS_MARGIN = 'cc_margin_override_v1';
    const LS_EVENTS = 'cc_events_v1';
    const OPT_MULT = 50;       // 台指選擇權每點 50 元
    const RISK_FREE = 0.015;

    // 期交所公告值 (2026/08/12) — 僅在 data/margins.json 讀取失敗時使用
    const FALLBACK_MARGINS = {
        taifex_updated: '2026/08/12 (內建備援值)',
        margins: {
            MTX: { maintenance: 134500, initial: 175250 },
            TMF: { maintenance: 26900, initial: 35050 },
            TX: { maintenance: 538000, initial: 701000 },
            TXO_A: { maintenance: 143000, initial: 187000 },
            TXO_B: { maintenance: 72000, initial: 94000 },
        },
    };

    const FUT_SPECS = {
        MTX: { label: '小型臺指 (每點 50 元)', mult: 50 },
        TMF: { label: '微型臺指 (每點 10 元)', mult: 10 },
        TX: { label: '大台指 (每點 200 元)', mult: 200 },
    };

    // 預設事件 (可在畫面上編輯，存在瀏覽器)
    const DEFAULT_EVENTS = [
        '2026-12-09 FOMC 利率決議 (美東時間，台灣隔日早上公布)',
        '2027-01-14 台積電法說會 (預估日期，請核對公告)',
    ].join('\n');

    let marginTable = FALLBACK_MARGINS;
    let initialized = false;

    const $ = (id) => document.getElementById(id);
    const fmt = (n) => (n === null || n === undefined || isNaN(n)) ? '--' : Math.round(n).toLocaleString();
    const fmtSigned = (n) => (n >= 0 ? '+' : '') + fmt(n);
    const pct = (x, d = 1) => (x * 100).toFixed(d) + '%';
    const num = (id) => {
        const el = $(id);
        if (!el || el.value.trim() === '') return null;
        const v = parseFloat(el.value);
        return isNaN(v) ? null : v;
    };

    // ─────────────────────────────────────────
    // 共用計算
    // ─────────────────────────────────────────
    function getData() {
        if (typeof rawData !== 'undefined' && Array.isArray(rawData)) return rawData;
        if (Array.isArray(window.rawData)) return window.rawData;
        return [];
    }

    function latestRow() {
        const d = getData();
        return d.length ? d[d.length - 1] : null;
    }

    function yearsToExpiry(expiryStr, fromDate) {
        // 結算日 13:30 為止；以日曆天估算
        const exp = new Date(expiryStr + 'T13:30:00+08:00');
        const ms = exp - fromDate;
        return Math.max(ms / (365 * 86400000), 0);
    }

    function tradingDaysLeft(expiryStr, fromDate) {
        const d = new Date(fromDate);
        d.setHours(0, 0, 0, 0);
        const exp = new Date(expiryStr + 'T00:00:00');
        let n = 0;
        while (d < exp) {
            d.setDate(d.getDate() + 1);
            const wd = d.getDay();
            if (wd !== 0 && wd !== 6) n++;
        }
        return n; // 不含今天，含結算日 (未扣國定假日)
    }

    function calibratedCallVol(row) {
        // 與 app.js getCalibratedCallPremium 相同的上檔 Call IV 阻尼假設
        const hv = row && row.taiex_vol ? row.taiex_vol : 0.2;
        return hv <= 0.21 ? Math.max(hv, 0.12) : Math.min(0.25, 0.19 + (hv - 0.19) * 0.30);
    }

    function impliedVolCall(price, S, K, T) {
        if (!(price > 0) || T <= 0) return null;
        let lo = 0.01, hi = 2.0;
        if (blackScholesCall(S, K, T, RISK_FREE, hi) < price) return null;
        for (let i = 0; i < 60; i++) {
            const mid = (lo + hi) / 2;
            if (blackScholesCall(S, K, T, RISK_FREE, mid) > price) hi = mid; else lo = mid;
        }
        return (lo + hi) / 2;
    }

    function getMargins() {
        const m = marginTable.margins;
        const ov = JSON.parse(localStorage.getItem(LS_MARGIN) || '{}');
        const pick = (key, field) => (ov[key] && ov[key][field]) ? ov[key][field] : (m[key] ? m[key][field] : 0);
        return {
            fut: (code) => ({ maintenance: pick(code, 'maintenance'), initial: pick(code, 'initial') }),
            A: { maintenance: pick('TXO_A', 'maintenance'), initial: pick('TXO_A', 'initial') },
            B: { maintenance: pick('TXO_B', 'maintenance'), initial: pick('TXO_B', 'initial') },
        };
    }

    // 賣出買權保證金 (每口) = 權利金市值 + MAX(A值 − 價外值, B值)
    function shortCallMargin(callPts, S, K, A, B) {
        const otmValue = Math.max((K - S) * OPT_MULT, 0);
        return callPts * OPT_MULT + Math.max(A - otmValue, B);
    }

    // ─────────────────────────────────────────
    // 讀取持倉表單
    // ─────────────────────────────────────────
    function readPosition() {
        const row = latestRow();
        return {
            futCode: ($('pm-fut-code') || {}).value || 'MTX',
            futQty: num('pm-fut-qty') || 0,
            futEntry: num('pm-fut-entry'),
            callStrike: num('pm-call-strike'),
            callSold: num('pm-call-sold'),
            callQty: num('pm-call-qty') || 0,
            callNow: num('pm-call-now'),
            expiry: ($('pm-expiry') || {}).value || (row ? (row.expiry_date_weekly || getNextWeeklyExpiryDate(row.date)) : ''),
            putStrike: num('pm-put-strike'),
            putPaid: num('pm-put-paid'),
            putQty: num('pm-put-qty') || 0,
            putNow: num('pm-put-now'),
            etfShares: num('pm-etf-shares') || 0,
            etfCost: num('pm-etf-cost'),
            deposit: num('pm-deposit'),
            indexNow: num('pm-index-now') || (row ? Math.round(row.taiex) : null),
        };
    }

    function savePosition() {
        const ids = ['pm-fut-code', 'pm-fut-qty', 'pm-fut-entry', 'pm-call-strike', 'pm-call-sold', 'pm-call-qty',
            'pm-call-now', 'pm-expiry', 'pm-put-strike', 'pm-put-paid', 'pm-put-qty', 'pm-put-now',
            'pm-etf-shares', 'pm-etf-cost', 'pm-deposit'];
        const obj = {};
        ids.forEach((id) => { const el = $(id); if (el) obj[id] = el.value; });
        localStorage.setItem(LS_POS, JSON.stringify(obj));
    }

    function loadPosition() {
        const obj = JSON.parse(localStorage.getItem(LS_POS) || '{}');
        Object.entries(obj).forEach(([id, v]) => { const el = $(id); if (el && v !== undefined) el.value = v; });
    }

    // 估算選擇權價格 (使用者有輸入 APP 現價時優先)
    function pricingContext(pos, row) {
        const now = new Date();
        const T = pos.expiry ? yearsToExpiry(pos.expiry, now) : 0;
        let vol = calibratedCallVol(row);
        let volSource = '校準估計';
        if (pos.callNow && pos.callStrike && pos.indexNow) {
            const iv = impliedVolCall(pos.callNow, pos.indexNow, pos.callStrike, T);
            if (iv) { vol = iv; volSource = '由 APP 現價反推'; }
        }
        const putVol = Math.min(vol * 1.25, 1.2); // Put 偏態較高
        return { T, vol, putVol, volSource };
    }

    function valueAt(pos, S, ctx) {
        const call = pos.callStrike ? blackScholesCall(S, pos.callStrike, ctx.T, RISK_FREE, ctx.vol) : 0;
        const put = pos.putStrike ? blackScholesPut(S, pos.putStrike, ctx.T, RISK_FREE, ctx.putVol) : 0;
        return { call, put };
    }

    // 期貨帳戶狀態 (給定指數 S)
    function accountAt(pos, S, ctx, margins, overridePrices) {
        const spec = FUT_SPECS[pos.futCode] || FUT_SPECS.MTX;
        const v = overridePrices || valueAt(pos, S, ctx);
        const cash = (pos.deposit || 0)
            + (pos.callSold || 0) * OPT_MULT * pos.callQty
            - (pos.putPaid || 0) * OPT_MULT * pos.putQty;
        const futPnl = pos.futEntry ? (S - pos.futEntry) * spec.mult * pos.futQty : 0;
        const equity = cash + futPnl;                                   // 權益數
        const totalValue = equity - v.call * OPT_MULT * pos.callQty     // 權益總值
            + v.put * OPT_MULT * pos.putQty;
        const fm = margins.fut(pos.futCode);
        const callM = pos.callStrike ? shortCallMargin(v.call, S, pos.callStrike, margins.A.maintenance, margins.B.maintenance) : 0;
        const callI = pos.callStrike ? shortCallMargin(v.call, S, pos.callStrike, margins.A.initial, margins.B.initial) : 0;
        // 保證金需求中的「權利金市值」已在權益總值扣除，故比率用 (權益總值 + 賣方市值) / 需求
        const sellMV = v.call * OPT_MULT * pos.callQty;
        const reqMaint = fm.maintenance * pos.futQty + callM * pos.callQty;
        const reqInit = fm.initial * pos.futQty + callI * pos.callQty;
        const maintRatio = reqMaint > 0 ? (totalValue + sellMV) / reqMaint : null;
        const riskIdx = reqInit > 0 ? (totalValue + sellMV) / reqInit : null;
        const eqForRatio = totalValue + sellMV; // = 權益數 + 買方 Put 市值
        return { equity, totalValue, eqForRatio, reqMaint, reqInit, maintRatio, riskIdx, call: v.call, put: v.put, futPnl };
    }

    // ─────────────────────────────────────────
    // #2 即時部位監控
    // ─────────────────────────────────────────
    function renderMonitor(pos, row, ctx) {
        const box = $('pm-monitor-out');
        if (!box) return;
        if (!pos.callStrike || !pos.callSold || !pos.callQty) {
            box.innerHTML = `<div class="pm-empty">請先在上方輸入已賣出 Call 的「履約價、賣出點數、口數」。</div>`;
            return;
        }
        const S = pos.indexNow;
        const now = new Date();
        const est = valueAt(pos, S, ctx);
        const callNow = pos.callNow || roundToTaifexOptionTick(est.call);
        const callIsEst = !pos.callNow;
        const tp = roundToTaifexOptionTick(pos.callSold * 0.15);
        const trigger = Math.round(pos.callStrike * 0.998);
        const distPts = trigger - S;
        const distPct = distPts / S;
        const captured = (pos.callSold - callNow) / pos.callSold;
        const tdLeft = pos.expiry ? tradingDaysLeft(pos.expiry, now) : null;
        const contract = getTaifexContractCodeByExpiry(pos.expiry, 'weekly');
        const nextExpiry = pos.expiry ? getNextPeriodExpiryStr(pos.expiry) : null;
        const nextContract = nextExpiry ? getTaifexContractCodeByExpiry(nextExpiry, 'weekly') : null;
        const todayStr = new Date(now.getTime() + 8 * 3600000).toISOString().slice(0, 10);

        // 損益
        const spec = FUT_SPECS[pos.futCode] || FUT_SPECS.MTX;
        const callPnl = (pos.callSold - callNow) * OPT_MULT * pos.callQty;
        const futPnl = pos.futEntry ? (S - pos.futEntry) * spec.mult * pos.futQty : 0;
        const putNow = pos.putStrike ? (pos.putNow || roundToTaifexOptionTick(est.put)) : 0;
        const putPnl = pos.putStrike && pos.putPaid ? (putNow - pos.putPaid) * OPT_MULT * pos.putQty : 0;
        const etfPrice = row && row.etf_981 ? row.etf_981 : null;
        const etfPnl = (pos.etfShares && pos.etfCost && etfPrice) ? (etfPrice - pos.etfCost) * pos.etfShares : 0;
        const total = callPnl + futPnl + putPnl + etfPnl;

        // 建議動作
        let level, title, detail;
        const rollStrike = pos.callStrike + 300;
        if (pos.expiry && todayStr === pos.expiry) {
            level = 'info';
            title = '📅 今天是結算日';
            detail = `13:30 結算後，依「訊號燈」建議的 OTM % 賣出下一期 <strong>[${nextContract ? nextContract.shortCode : '下週'}]</strong> Call，並重新掛 15% 停利單。`;
        } else if (S >= trigger) {
            const sameWeek = tdLeft !== null && tdLeft >= 3;
            const newExpiry = sameWeek ? pos.expiry : nextExpiry;
            const newT = newExpiry ? yearsToExpiry(newExpiry, now) : ctx.T;
            const k2 = rollStrike;
            const newPrem = roundToTaifexOptionTick(blackScholesCall(S, k2, newT, RISK_FREE, ctx.vol));
            const netPts = newPrem - callNow;
            level = 'danger';
            title = `🔴 已觸及防穿價 ${trigger.toLocaleString()}，建議轉倉`;
            detail = `① 刪除 ${tp} 點停利單 ➔ ② 買進平倉 <strong>[${contract.shortCode}] ${pos.callStrike} Call × ${pos.callQty}</strong> (約 ${callNow} 點) ➔ ③ 賣出 <strong>[${sameWeek ? contract.shortCode : (nextContract ? nextContract.shortCode : '下週')}] ${k2} Call × ${pos.callQty}</strong> (估約 ${newPrem} 點)。<br>
                估計轉倉淨${netPts >= 0 ? '收' : '付'} <strong>${Math.abs(netPts).toFixed(1)} 點</strong> (≈ ${fmt(Math.abs(netPts) * OPT_MULT * pos.callQty)} 元)。${sameWeek ? '' : '距結算 ≤2 個交易日，改賣下週合約。'}`;
        } else if (distPct <= 0.01) {
            level = 'warning';
            title = `🟡 警戒：距觸價點只剩 ${fmt(distPts)} 點 (${pct(distPct, 2)})`;
            detail = `請確認 APP 已設好加權指數 <strong>${trigger.toLocaleString()}</strong> 到價通知，並預先想好轉倉合約 (${rollStrike} Call)。`;
        } else if (callNow <= tp) {
            level = 'success';
            title = `✅ 已達 85% 停利 (現價 ${callNow} ≤ ${tp})`;
            detail = `若停利單已成交：空手到 ${contract.md}(週三) 結算後再賣新倉。若尚未掛單，可直接買進平倉。`;
        } else {
            const capTxt = captured >= 0
                ? `權利金已縮水入袋 <strong>${pct(captured, 0)}</strong>`
                : `Call 點數暫時浮動至 <strong>${callNow} 點</strong>`;
            level = 'success';
            title = '🟢 正常持有';
            detail = `${capTxt}；停利單 <strong>${tp} 點</strong> 繼續掛著，距離防穿價觸價點尚有 <strong>${fmt(distPts)} 點 (${pct(distPct, 2)})</strong>。`;
        }

        box.innerHTML = `
            <div class="pm-alert pm-alert--${level}"><div class="pm-alert-title">${title}</div><div class="pm-alert-body">${detail}</div></div>
            <div class="pm-kpis">
                <div class="pm-kpi"><span>合約</span><strong>${contract.shortCode}</strong><em>${pos.expiry || '--'} 結算${tdLeft !== null ? `｜剩 ${tdLeft} 個交易日` : ''}</em></div>
                <div class="pm-kpi"><span>🎯 停利掛單 (買進平倉)</span><strong class="c-success">${tp} 點</strong><em>賣出 ${pos.callSold} × 15%</em></div>
                <div class="pm-kpi"><span>🛡️ 防穿價觸價點</span><strong class="c-warning">${trigger.toLocaleString()}</strong><em>履約價 × 99.8%｜距離 ${fmt(distPts)} 點</em></div>
                <div class="pm-kpi"><span>Call 現價${callIsEst ? ' (估計)' : ''}</span><strong>${callNow} 點</strong><em>已實現 ${pct(captured, 0)}｜IV ${pct(ctx.vol, 1)} ${ctx.volSource}</em></div>
            </div>
            <table class="pm-table">
                <thead><tr><th>部位</th><th>進場</th><th>現價</th><th>損益 (TWD)</th></tr></thead>
                <tbody>
                    <tr><td>賣 Call ${pos.callStrike} × ${pos.callQty}</td><td>${pos.callSold}</td><td>${callNow}${callIsEst ? '*' : ''}</td><td class="${callPnl >= 0 ? 'c-success' : 'c-danger'}">${fmtSigned(callPnl)}</td></tr>
                    ${pos.futQty ? `<tr><td>${pos.futCode} 多 × ${pos.futQty}</td><td>${pos.futEntry ? fmt(pos.futEntry) : '--'}</td><td>${fmt(S)}</td><td class="${futPnl >= 0 ? 'c-success' : 'c-danger'}">${pos.futEntry ? fmtSigned(futPnl) : '--'}</td></tr>` : ''}
                    ${pos.putStrike && pos.putQty ? `<tr><td>買 Put ${pos.putStrike} × ${pos.putQty}</td><td>${pos.putPaid ?? '--'}</td><td>${putNow}${pos.putNow ? '' : '*'}</td><td class="${putPnl >= 0 ? 'c-success' : 'c-danger'}">${fmtSigned(putPnl)}</td></tr>` : ''}
                    ${pos.etfShares ? `<tr><td>00981A × ${pos.etfShares.toLocaleString()} 股</td><td>${pos.etfCost ?? '--'}</td><td>${etfPrice ? etfPrice.toFixed(2) : '--'}</td><td class="${etfPnl >= 0 ? 'c-success' : 'c-danger'}">${fmtSigned(etfPnl)}</td></tr>` : ''}
                </tbody>
                <tfoot><tr><td colspan="3">合計未實現損益</td><td class="${total >= 0 ? 'c-success' : 'c-danger'}"><strong>${fmtSigned(total)}</strong></td></tr></tfoot>
            </table>
            <div class="pm-note">* 標示為 Black-Scholes 估計值；請在上方填入 APP 實際現價以取得精確數字。00981A 現價為最近收盤 (${row ? row.date : '--'})。</div>
        `;
    }

    // ─────────────────────────────────────────
    // #3 保證金 / 維持率試算
    // ─────────────────────────────────────────
    function renderMargin(pos, row, ctx) {
        const box = $('pm-margin-out');
        if (!box) return;
        const margins = getMargins();
        if (!pos.deposit) {
            box.innerHTML = `<div class="pm-empty">請輸入「期貨帳戶入金總額」才能試算維持率。</div>`;
            return;
        }
        if (!pos.futQty && !pos.callQty) {
            box.innerHTML = `<div class="pm-empty">請輸入期貨或 Call 部位。</div>`;
            return;
        }
        const S0 = pos.indexNow;
        // 現況：若使用者輸入了 APP 現價，用實際價格
        const nowPrices = valueAt(pos, S0, ctx);
        if (pos.callNow) nowPrices.call = pos.callNow;
        if (pos.putNow) nowPrices.put = pos.putNow;
        const cur = accountAt(pos, S0, ctx, margins, nowPrices);

        // 掃描指數 -40% ~ +40%
        const scan = [];
        for (let p = -0.40; p <= 0.4001; p += 0.0025) {
            const S = S0 * (1 + p);
            scan.push({ p, S, a: accountAt(pos, S, ctx, margins) });
        }
        const findLine = (dir, test) => {
            const arr = dir < 0 ? scan.filter((x) => x.p <= 0).reverse() : scan.filter((x) => x.p >= 0);
            const hit = arr.find((x) => test(x.a));
            return hit || null;
        };
        const callDown = findLine(-1, (a) => a.maintRatio !== null && a.maintRatio < 1);
        const callUp = findLine(1, (a) => a.maintRatio !== null && a.maintRatio < 1);
        const liqDown = findLine(-1, (a) => a.riskIdx !== null && a.riskIdx < 0.25);
        const liqUp = findLine(1, (a) => a.riskIdx !== null && a.riskIdx < 0.25);

        const lineTxt = (hit) => hit
            ? `<strong>${fmt(hit.S)}</strong> <em>(${hit.p >= 0 ? '+' : ''}${pct(hit.p, 1)}｜${fmtSigned(hit.S - S0)} 點)</em>`
            : `<strong class="c-success">±40% 內不會觸及</strong>`;

        const ratioCls = cur.maintRatio === null ? '' : (cur.maintRatio >= 1.5 ? 'c-success' : (cur.maintRatio >= 1.0 ? 'c-warning' : 'c-danger'));
        const shocks = [-0.15, -0.10, -0.07, -0.05, -0.03, 0.03, 0.05, 0.07, 0.10];
        const rows = shocks.map((p) => {
            const a = accountAt(pos, S0 * (1 + p), ctx, margins);
            const st = a.riskIdx !== null && a.riskIdx < 0.25 ? '<span class="c-danger">💀 代沖銷</span>'
                : (a.maintRatio !== null && a.maintRatio < 1 ? '<span class="c-danger">⚠️ 追繳</span>'
                    : (a.maintRatio !== null && a.maintRatio < 1.5 ? '<span class="c-warning">🟡 偏低</span>' : '<span class="c-success">🟢 安全</span>'));
            return `<tr><td>${p >= 0 ? '+' : ''}${pct(p, 0)}</td><td>${fmt(S0 * (1 + p))}</td><td>${fmt(a.eqForRatio)}</td><td>${a.maintRatio !== null ? pct(a.maintRatio, 0) : '--'}</td><td>${st}</td></tr>`;
        }).join('');

        const fm = margins.fut(pos.futCode);
        box.innerHTML = `
            <div class="pm-kpis">
                <div class="pm-kpi"><span>權益數</span><strong>${fmt(cur.eqForRatio)}</strong><em>入金 + 收付權利金 + 期貨損益 (+Put 市值)</em></div>
                <div class="pm-kpi"><span>所需維持保證金</span><strong>${fmt(cur.reqMaint)}</strong><em>原始 ${fmt(cur.reqInit)}</em></div>
                <div class="pm-kpi"><span>維持率</span><strong class="${ratioCls}">${cur.maintRatio !== null ? pct(cur.maintRatio, 0) : '--'}</strong><em>&lt;100% 盤後追繳</em></div>
                <div class="pm-kpi"><span>風險指標</span><strong class="${cur.riskIdx !== null && cur.riskIdx < 0.5 ? 'c-danger' : ''}">${cur.riskIdx !== null ? pct(cur.riskIdx, 0) : '--'}</strong><em>&lt;25% 盤中代沖銷</em></div>
            </div>
            <div class="pm-lines">
                <div>⬇️ 下跌追繳點：${lineTxt(callDown)}</div>
                <div>⬇️ 下跌代沖銷點：${lineTxt(liqDown)}</div>
                <div>⬆️ 上漲追繳點：${lineTxt(callUp)}</div>
                <div>⬆️ 上漲代沖銷點：${lineTxt(liqUp)}</div>
                <div class="pm-sub">可再承受下跌：${callDown ? `<strong>${fmt(S0 - callDown.S)} 點</strong>才會被追繳` : '—'}　|　若要撐到 -15% 不追繳，需再入金約 <strong>${(() => { const a = accountAt(pos, S0 * 0.85, ctx, margins); const need = a.reqMaint - a.eqForRatio; return need > 0 ? fmt(need) : '0'; })()}</strong> 元</div>
            </div>
            <table class="pm-table">
                <thead><tr><th>大盤瞬間變動</th><th>指數</th><th>權益數</th><th>維持率</th><th>狀態</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
            <div class="pm-note">
                保證金採期交所公告（${marginTable.taifex_updated || '--'}）：${pos.futCode} 原始 ${fmt(fm.initial)} / 維持 ${fmt(fm.maintenance)}；TXO A 值 ${fmt(margins.A.initial)} / ${fmt(margins.A.maintenance)}，B 值 ${fmt(margins.B.initial)} / ${fmt(margins.B.maintenance)}。
                賣出買權保證金 = 權利金市值 + MAX(A 值 − 價外值, B 值)。
                情境為「瞬間變動、剩餘天數不變」的估算；未計組合部位減收、夜盤與跳空，各券商風險指標算法略有差異。00981A 放在證券帳戶，不計入期貨維持率。
            </div>
        `;
    }

    // ─────────────────────────────────────────
    // #4 均線訊號燈
    // ─────────────────────────────────────────
    function parseEvents() {
        const txt = localStorage.getItem(LS_EVENTS) ?? DEFAULT_EVENTS;
        return txt.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
            const m = l.match(/^(\d{4}-\d{2}-\d{2})\s*(.*)$/);
            return m ? { date: m[1], label: m[2] || '事件' } : null;
        }).filter(Boolean);
    }

    function computeSignals() {
        const data = getData();
        const n = data.length - 1;
        if (n < 60) return null;
        const row = data[n];
        const S = row.taiex;
        const ma5 = getTaiexMA(data, n, 5);
        const ma21 = getTaiexMA(data, n, 21);
        const ma60 = getTaiexMA(data, n, 60);

        // 連續收在季線下方的天數
        let belowDays = 0;
        for (let i = n; i >= 59; i--) {
            const m = getTaiexMA(data, i, 60);
            if (data[i].taiex < m) belowDays++; else break;
        }
        // 20 日歷史波動率 (自行由收盤價計算)
        const rets = [];
        for (let i = n - 19; i <= n; i++) rets.push(Math.log(data[i].taiex / data[i - 1].taiex));
        const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
        const hv20 = Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1)) * Math.sqrt(252);

        // 跌深反彈偵測：近 10 日曾自 60 日高點回落 ≥ 8%，且目前已自低點反彈 ≥ 3%
        let hi60 = 0;
        for (let i = n - 59; i <= n; i++) hi60 = Math.max(hi60, data[i].taiex);
        let lo10 = Infinity;
        for (let i = n - 9; i <= n; i++) lo10 = Math.min(lo10, data[i].taiex);
        const ddFromHigh = lo10 / hi60 - 1;
        const bounce = S / lo10 - 1;
        const isRebound = ddFromHigh <= -0.08 && bounce >= 0.03;

        // 事件週：今天 ~ 下一個結算日之間
        const expiry = row.expiry_date_weekly || getNextWeeklyExpiryDate(row.date);
        const events = parseEvents().filter((e) => e.date >= row.date && e.date <= expiry);

        const b5 = ma5 < ma21;
        const halve = belowDays >= 5;
        const highVol = hv20 >= 0.30;
        const wideReasons = [];
        if (events.length) wideReasons.push('本週有重大事件');
        if (isRebound) wideReasons.push('跌深反彈週 (死貓跳易急漲)');
        if (highVol) wideReasons.push(`波動率偏高 (HV20 ${pct(hv20, 0)})`);
        const otm = wideReasons.length ? 7 : 5;

        return { row, S, ma5, ma21, ma60, belowDays, hv20, ddFromHigh, bounce, isRebound, events, expiry, b5, halve, highVol, wideReasons, otm };
    }

    function light(state, label, value, desc) {
        return `<div class="pm-light pm-light--${state}"><div class="pm-light-dot"></div><div class="pm-light-body"><div class="pm-light-label">${label}</div><div class="pm-light-value">${value}</div><div class="pm-light-desc">${desc}</div></div></div>`;
    }

    function renderSignals() {
        const box = $('pm-signal-out');
        if (!box) return;
        const s = computeSignals();
        if (!s) { box.innerHTML = '<div class="pm-empty">資料不足 60 日，無法計算季線。</div>'; return; }
        const putK = Math.round(s.S * 0.98 / 100) * 100;
        const contract = getTaifexContractCodeByExpiry(s.expiry, 'weekly');

        const actions = [];
        actions.push(`賣 Call 使用 <strong>OTM ${s.otm}%</strong>（履約價約 <strong>${(Math.round(s.S * (1 + s.otm / 100) / 100) * 100).toLocaleString()}</strong>）${s.wideReasons.length ? '：' + s.wideReasons.join('、') : '：無特殊風險，維持標準距離'}`);
        if (s.b5) actions.push(`🛡️ 買進 B5 避險 Put：<strong>[${contract.shortCode}] ${putK.toLocaleString()} Put</strong>（價外 2%）`);
        else actions.push('不需買 Put（MA5 在 MA21 之上）；若手上還有 Put，可賣出回收殘值');
        if (s.halve) actions.push('⚠️ 期貨多單與賣 Call 口數<strong>減半</strong>（跌破季線已滿一週）');
        else if (s.belowDays > 0) actions.push(`收在季線下方第 ${s.belowDays} 天，滿 5 天才減半，先觀察`);

        box.innerHTML = `
            <div class="pm-lights">
                ${light(s.b5 ? 'red' : 'green', 'B5 避險 (MA5 vs MA21)', `${fmt(s.ma5)} ${s.b5 ? '&lt;' : '&gt;'} ${fmt(s.ma21)}`, s.b5 ? '破月線：買價外 2% Put' : '多頭：免買 Put')}
                ${light(s.halve ? 'red' : (s.belowDays > 0 ? 'yellow' : 'green'), '季線 MA60', `收盤 ${fmt(s.S)} / MA60 ${fmt(s.ma60)}`, s.belowDays > 0 ? `連續 ${s.belowDays} 天在季線下${s.halve ? '：減半' : ''}` : `高於季線 ${pct(s.S / s.ma60 - 1)}`)}
                ${light(s.highVol ? 'red' : (s.hv20 >= 0.22 ? 'yellow' : 'green'), '20 日波動率', pct(s.hv20, 1), s.highVol ? '≥30%：拉遠到 OTM 7%' : (s.hv20 >= 0.22 ? '偏高，留意' : '正常'))}
                ${light(s.isRebound ? 'yellow' : 'green', '跌深反彈', `近10日最深 ${pct(s.ddFromHigh)}｜反彈 ${pct(s.bounce)}`, s.isRebound ? '急彈週：OTM 7%' : '無')}
                ${light(s.events.length ? 'yellow' : 'green', `事件 (至 ${s.expiry} 結算)`, s.events.length ? s.events.map((e) => `${e.date.slice(5)} ${e.label}`).join('<br>') : '無', s.events.length ? '事件週：OTM 7%' : '可在下方編輯事件清單')}
            </div>
            <div class="pm-alert pm-alert--${s.halve || s.b5 ? 'danger' : (s.wideReasons.length ? 'warning' : 'success')}">
                <div class="pm-alert-title">📋 本週行動清單（資料日 ${s.row.date}）</div>
                <div class="pm-alert-body"><ol>${actions.map((a) => `<li>${a}</li>`).join('')}</ol></div>
            </div>
            <div class="pm-actions">
                <button type="button" class="pm-btn" id="pm-apply-otm">套用 OTM ${s.otm}% 到「今日建倉建議」</button>
            </div>
        `;
        const btn = $('pm-apply-otm');
        if (btn) btn.addEventListener('click', () => {
            const srEl = document.getElementById('strike-rule');
            const coEl = document.getElementById('custom-otm-value');
            if (!srEl || !coEl) return;
            srEl.value = 'CUSTOM_OTM';
            srEl.dispatchEvent(new Event('change'));
            coEl.value = String(s.otm);
            coEl.dispatchEvent(new Event('input'));
            const adv = document.getElementById('section-advice');
            if (adv) adv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // ─────────────────────────────────────────
    // 保證金參數編輯
    // ─────────────────────────────────────────
    function renderMarginEditor() {
        const box = $('pm-margin-params');
        if (!box) return;
        const m = getMargins();
        const keys = [
            ['MTX', '小型臺指', m.fut('MTX')], ['TMF', '微型臺指', m.fut('TMF')], ['TX', '大台指', m.fut('TX')],
            ['TXO_A', 'TXO A 值', m.A], ['TXO_B', 'TXO B 值', m.B],
        ];
        box.innerHTML = `
            <div class="pm-note">來源：期交所公告 ${marginTable.taifex_updated || '--'}${marginTable.fetched_at ? `（抓取於 ${marginTable.fetched_at}）` : ''}。如券商加收，可在此覆寫（存在本機瀏覽器）。</div>
            <table class="pm-table pm-table--compact">
                <thead><tr><th>項目</th><th>原始</th><th>維持</th></tr></thead>
                <tbody>${keys.map(([k, label, v]) => `<tr><td>${label}</td><td><input type="number" data-mk="${k}" data-mf="initial" value="${v.initial}"></td><td><input type="number" data-mk="${k}" data-mf="maintenance" value="${v.maintenance}"></td></tr>`).join('')}</tbody>
            </table>
            <button type="button" class="pm-btn pm-btn--ghost" id="pm-margin-reset">↺ 還原期交所公告值</button>
        `;
        box.querySelectorAll('input[data-mk]').forEach((inp) => inp.addEventListener('change', () => {
            const ov = JSON.parse(localStorage.getItem(LS_MARGIN) || '{}');
            const k = inp.dataset.mk, f = inp.dataset.mf;
            ov[k] = ov[k] || {};
            ov[k][f] = parseFloat(inp.value) || 0;
            localStorage.setItem(LS_MARGIN, JSON.stringify(ov));
            renderAll();
        }));
        $('pm-margin-reset').addEventListener('click', () => {
            localStorage.removeItem(LS_MARGIN);
            renderMarginEditor();
            renderAll();
        });
    }

    // ─────────────────────────────────────────
    // 主流程
    // ─────────────────────────────────────────
    function renderAll() {
        const row = latestRow();
        if (!row) return;
        const idxEl = $('pm-index-now');
        if (idxEl) idxEl.placeholder = String(Math.round(row.taiex));
        const expEl = $('pm-expiry');
        if (expEl && !expEl.value) expEl.value = row.expiry_date_weekly || getNextWeeklyExpiryDate(row.date);
        const pos = readPosition();
        const ctx = pricingContext(pos, row);
        try { renderSignals(); } catch (e) { console.error('[PM] signals', e); }
        try { renderMonitor(pos, row, ctx); } catch (e) { console.error('[PM] monitor', e); }
        try { renderMargin(pos, row, ctx); } catch (e) { console.error('[PM] margin', e); }
    }

    function fillFromAdvice() {
        // 從「今日建倉建議」帶入履約價 / 點數 / 口數
        const row = latestRow();
        const k = parseFloat((document.getElementById('actual-strike-input') || {}).value)
            || parseFloat((document.getElementById('actual-strike-input') || {}).placeholder);
        const p = parseFloat((document.getElementById('actual-premium-input') || {}).value)
            || parseFloat((document.getElementById('actual-premium-input') || {}).placeholder);
        const q = parseInt((document.getElementById('option-contracts') || {}).value, 10);
        if (k) $('pm-call-strike').value = k;
        if (p) $('pm-call-sold').value = p;
        if (q) $('pm-call-qty').value = q;
        if (row) $('pm-expiry').value = row.expiry_date_weekly || getNextWeeklyExpiryDate(row.date);
        $('pm-call-now').value = '';
        savePosition();
        renderAll();
    }

    async function loadMargins() {
        try {
            const r = await fetch('./data/margins.json?v=' + Date.now(), { cache: 'no-store' });
            if (r.ok) {
                const j = await r.json();
                if (j && j.margins && j.margins.MTX) marginTable = j;
            }
        } catch (e) { /* 使用備援值 */ }
    }

    function bindEvents() {
        const section = $('section-position');
        if (!section) return;
        section.querySelectorAll('.pm-form input, .pm-form select').forEach((el) => {
            el.addEventListener('input', () => { savePosition(); renderAll(); });
            el.addEventListener('change', () => { savePosition(); renderAll(); });
        });
        const fill = $('pm-fill-advice');
        if (fill) fill.addEventListener('click', fillFromAdvice);
        const clear = $('pm-clear');
        if (clear) clear.addEventListener('click', () => {
            if (!confirm('確定清除已輸入的持倉資料？')) return;
            localStorage.removeItem(LS_POS);
            section.querySelectorAll('.pm-form input').forEach((el) => { el.value = ''; });
            renderAll();
        });
        const ev = $('pm-events');
        if (ev) {
            ev.value = localStorage.getItem(LS_EVENTS) ?? DEFAULT_EVENTS;
            ev.addEventListener('change', () => { localStorage.setItem(LS_EVENTS, ev.value); renderAll(); });
        }
    }

    async function init() {
        if (initialized) return;
        initialized = true;
        loadPosition();
        bindEvents();
        await loadMargins();
        renderMarginEditor();
        renderAll();

        // app.js 重新整理資料後同步更新
        if (typeof window.updateRecommendation === 'function') {
            const orig = window.updateRecommendation;
            window.updateRecommendation = function (...args) {
                const r = orig.apply(this, args);
                try { renderAll(); } catch (e) { console.error(e); }
                return r;
            };
        }
    }

    // 等待 app.js 載入 rawData
    const waitTimer = setInterval(() => {
        if (getData().length > 0) {
            clearInterval(waitTimer);
            init();
        }
    }, 300);
    setTimeout(() => clearInterval(waitTimer), 60000);

    window.PositionManager = { renderAll };
})();
