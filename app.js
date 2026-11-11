// ─────────────────────────────────────────────
// ASSET CATALOG: built-in assets (data.json backed, no network needed)
// ─────────────────────────────────────────────
const BUILTIN_ASSETS = [
    {
        symbol: '00981A',
        name: '統一台股增長 ETF',
        type: 'etf',
        priceField: 'etf_981',
        contractMultiplier: 1,
        marginRate: 0,
        betaField_taiex: '981_taiex',
        betaField_tsmc: '981_tsmc',
        source: 'builtin',
    },
    {
        symbol: '00991A',
        name: '復華台灣未來50 ETF',
        type: 'etf',
        priceField: 'etf_991',
        contractMultiplier: 1,
        marginRate: 0,
        betaField_taiex: '991_taiex',
        betaField_tsmc: '991_tsmc',
        source: 'builtin',
    },
    {
        symbol: 'TSMC',
        name: '台積電 (2330) 現貨',
        type: 'stock',
        priceField: 'tsmc',
        contractMultiplier: 1,
        marginRate: 0,
        betaField_taiex: null,
        betaField_tsmc: null,
        source: 'builtin',
    },
    {
        symbol: 'TX',
        name: '大台指期貨 (TX)',
        type: 'futures',
        priceField: 'taiex',
        contractMultiplier: 200,      // 1 point = 200 TWD
        marginRate: 0.115,
        betaField_taiex: null,
        betaField_tsmc: null,
        source: 'builtin',
    },
    {
        symbol: 'MTX',
        name: '小台指期貨 (MTX)',
        type: 'futures',
        priceField: 'taiex',
        contractMultiplier: 50,       // 1 point = 50 TWD
        marginRate: 0.115,
        betaField_taiex: null,
        betaField_tsmc: null,
        source: 'builtin',
    },
    {
        symbol: 'CDF',
        name: '台積電股期 (CDF)',
        type: 'futures',
        priceField: 'tsmc',
        contractMultiplier: 2000,     // 1 contract = 2000 shares
        marginRate: 0.115,
        betaField_taiex: null,
        betaField_tsmc: null,
        source: 'builtin',
    },
    {
        symbol: 'QFF',
        name: '小型台積電股期 (QFF)',
        type: 'futures',
        priceField: 'tsmc',
        contractMultiplier: 100,      // 1 contract = 100 shares
        marginRate: 0.115,
        betaField_taiex: null,
        betaField_tsmc: null,
        source: 'builtin',
    },
    {
        symbol: '0050F',
        name: '元大台灣50 ETF期貨 (0050F)',
        type: 'futures',
        priceField: 'etf_0050',
        contractMultiplier: 10000,    // 1 contract = 10,000 shares
        marginRate: 0.15,
        betaField_taiex: '0050_taiex',
        betaField_tsmc: '0050_tsmc',
        source: 'builtin',
    },
    {
        symbol: '0050',
        name: '元大台灣50 ETF (0050)',
        type: 'etf',
        priceField: 'etf_0050',
        contractMultiplier: 1,
        marginRate: 0,
        betaField_taiex: '0050_taiex',
        betaField_tsmc: '0050_tsmc',
        source: 'builtin',
    },
];

// ─────────────────────────────────────────────
// POPULAR_CATALOG: commonly traded TW ETFs and stocks
// These are fetched via TWSE API when selected
// ─────────────────────────────────────────────
const POPULAR_CATALOG = [
    // Popular ETFs
    { symbol: '0050',   name: '元大台灣50 ETF (0050)',           type: 'etf',   twseCode: '0050',   exchange: 'tse' },
    { symbol: '0050F',  name: '元大台灣50 ETF期貨 (0050F)',       type: 'futures', twseCode: '0050',   exchange: 'tse', contractMultiplier: 10000, marginRate: 0.15 },
    { symbol: '0056',   name: '元大高股息 ETF (0056)',            type: 'etf',   twseCode: '0056',   exchange: 'tse' },
    { symbol: '006208', name: '富邦台50 ETF (006208)',            type: 'etf',   twseCode: '006208', exchange: 'tse' },
    { symbol: '00878',  name: '國泰永續高股息 ETF (00878)',       type: 'etf',   twseCode: '00878',  exchange: 'tse' },
    { symbol: '00919',  name: '群益台灣精選高息 ETF (00919)',     type: 'etf',   twseCode: '00919',  exchange: 'tse' },
    { symbol: '00929',  name: '復華台灣科技優息 ETF (00929)',     type: 'etf',   twseCode: '00929',  exchange: 'tse' },
    { symbol: '00713',  name: '元大台灣高息低波 ETF (00713)',     type: 'etf',   twseCode: '00713',  exchange: 'tse' },
    { symbol: '00850',  name: '元大臺灣ESG永續 ETF (00850)',      type: 'etf',   twseCode: '00850',  exchange: 'tse' },
    { symbol: '00881',  name: '國泰台灣5G+ ETF (00881)',          type: 'etf',   twseCode: '00881',  exchange: 'tse' },
    { symbol: '00900',  name: '富邦特選高股息30 ETF (00900)',     type: 'etf',   twseCode: '00900',  exchange: 'tse' },
    { symbol: '020009', name: '元大S&P500 ETF (020009)',          type: 'etf',   twseCode: '020009', exchange: 'tse' },
    { symbol: '00896',  name: '中信綠色關鍵金屬 ETF (00896)',     type: 'etf',   twseCode: '00896',  exchange: 'tse' },
    // Blue-chip stocks
    { symbol: '2330',   name: '台積電半導體',                     type: 'stock', twseCode: '2330',   exchange: 'tse' },
    { symbol: '2317',   name: '鴻海精密工業 (鴻海)',               type: 'stock', twseCode: '2317',   exchange: 'tse' },
    { symbol: '2454',   name: '聯發科技',                         type: 'stock', twseCode: '2454',   exchange: 'tse' },
    { symbol: '2412',   name: '中華電信',                         type: 'stock', twseCode: '2412',   exchange: 'tse' },
    { symbol: '2881',   name: '富邦金控',                         type: 'stock', twseCode: '2881',   exchange: 'tse' },
    { symbol: '2882',   name: '國泰金控',                         type: 'stock', twseCode: '2882',   exchange: 'tse' },
    { symbol: '2884',   name: '玉山金控',                         type: 'stock', twseCode: '2884',   exchange: 'tse' },
    { symbol: '2886',   name: '兆豐金控',                         type: 'stock', twseCode: '2886',   exchange: 'tse' },
    { symbol: '2891',   name: '中信金控',                         type: 'stock', twseCode: '2891',   exchange: 'tse' },
    { symbol: '2303',   name: '聯電',                             type: 'stock', twseCode: '2303',   exchange: 'tse' },
    { symbol: '2308',   name: '台達電',                           type: 'stock', twseCode: '2308',   exchange: 'tse' },
    { symbol: '3008',   name: '大立光',                           type: 'stock', twseCode: '3008',   exchange: 'tse' },
    { symbol: '2379',   name: '瑞昱',                             type: 'stock', twseCode: '2379',   exchange: 'tse' },
    { symbol: '2002',   name: '中鋼',                             type: 'stock', twseCode: '2002',   exchange: 'tse' },
    { symbol: '1301',   name: '台塑',                             type: 'stock', twseCode: '1301',   exchange: 'tse' },
    { symbol: '2609',   name: '陽明海運',                         type: 'stock', twseCode: '2609',   exchange: 'tse' },
    { symbol: '2615',   name: '萬海航運',                         type: 'stock', twseCode: '2615',   exchange: 'tse' },
    { symbol: '4904',   name: '遠傳電信',                         type: 'stock', twseCode: '4904',   exchange: 'tse' },
    { symbol: '2395',   name: '研華科技',                         type: 'stock', twseCode: '2395',   exchange: 'tse' },
];

// ─────────────────────────────────────────────
// GLOBAL STATE
// ─────────────────────────────────────────────
let rawData = [];
let chartInstance = null;
let isAutoWeight = true;

let selectedAssets = [];  // Will be set to frugal preset on init

// ─────────────────────────────────────────────
// PORTFOLIO PRESETS
// ─────────────────────────────────────────────
// Helper: find asset in builtin or popular catalog
function findPresetAsset(symbol) {
    const builtin = BUILTIN_ASSETS.find(a => a.symbol === symbol);
    if (builtin) return { ...builtin };
    const cat = POPULAR_CATALOG.find(a => a.symbol === symbol);
    if (cat) return {
        symbol: cat.symbol,
        name: cat.name,
        type: cat.type,
        priceField: null,
        contractMultiplier: cat.contractMultiplier !== undefined ? cat.contractMultiplier : 1,
        marginRate: cat.marginRate !== undefined ? cat.marginRate : (cat.type === 'futures' ? 0.115 : 0),
        betaField_taiex: null,
        betaField_tsmc: null,
        source: 'twse',
        twseCode: cat.twseCode,
        exchange: cat.exchange,
    };
    return null;
}

const PORTFOLIO_PRESETS = {
    frugal: {
        label: '小資組合',
        symbols: ['0050F', 'QFF', '00981A'],
    },
    stable: {
        label: '穩健組合',
        symbols: ['00981A', '00991A', 'TSMC'],
    },
};

// Custom slot state (3 slots), loaded from localStorage
let customSlots = [null, null, null];
const CUSTOM_SLOTS_KEY = 'covercall_custom_portfolios';

function loadCustomSlots() {
    try {
        const raw = localStorage.getItem(CUSTOM_SLOTS_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length === 3) {
                customSlots = parsed;
            }
        }
    } catch (e) { console.warn('Failed to load custom slots:', e); }
}

function saveCustomSlots() {
    try {
        localStorage.setItem(CUSTOM_SLOTS_KEY, JSON.stringify(customSlots));
    } catch (e) { console.warn('Failed to save custom slots:', e); }
}

/**
 * Serialize current selectedAssets AND all strategy settings into a slot.
 */
function serializeCurrentPortfolio() {
    const assets = selectedAssets.map(a => ({
        symbol: a.symbol,
        name: a.name,
        type: a.type,
        source: a.source || 'builtin',
        priceField: a.priceField || null,
        contractMultiplier: a.contractMultiplier,
        marginRate: a.marginRate,
        betaField_taiex: a.betaField_taiex || null,
        betaField_tsmc: a.betaField_tsmc || null,
        twseCode: a.twseCode || null,
        exchange: a.exchange || null,
        weight: a.weight,
    }));

    // Capture all strategy form settings
    const strategy = {
        optionType:        optionTypeSelect.value,
        optionCycle:       optionCycleSelect.value,
        strikeRule:        strikeRuleSelect.value,
        customOtmValue:    customOtmValueInput.value,
        optionContracts:   optionContractsInput.value,
        hedgeMode:         hedgeModeSelect ? hedgeModeSelect.value : 'b5',
        rollDefenseMode:   rollDefenseModeSelect ? rollDefenseModeSelect.value : 'smart_both',
        portfolioMode:     portfolioModeSelect.value,
        capitalMode:       capitalModeSelect.value,
        capital:           capitalInput.value,
        targetMarginRatio: targetMarginRatioInput.value,
        isAutoWeight:      isAutoWeight,
    };

    return { assets, strategy };
}

/**
 * Apply a serialized portfolio (assets + strategy settings) from a slot.
 */
function applySerializedPortfolio(saved) {
    // Support old format (plain array) for backward compat
    const assets  = Array.isArray(saved) ? saved : saved.assets;
    const strategy = Array.isArray(saved) ? null  : saved.strategy;

    selectedAssets = assets.map(a => {
        const builtin = BUILTIN_ASSETS.find(b => b.symbol === a.symbol);
        if (builtin) return { ...builtin, weight: a.weight };
        return { ...a };
    });

    // Restore strategy settings if present
    if (strategy) {
        if (strategy.optionType       != null) optionTypeSelect.value       = strategy.optionType;
        if (strategy.optionCycle      != null) optionCycleSelect.value      = strategy.optionCycle;
        if (strategy.strikeRule       != null) strikeRuleSelect.value       = strategy.strikeRule;
        if (strategy.customOtmValue   != null) customOtmValueInput.value    = strategy.customOtmValue;
        if (strategy.optionContracts  != null) optionContractsInput.value   = strategy.optionContracts;
        if (strategy.hedgeMode        != null && hedgeModeSelect) hedgeModeSelect.value = strategy.hedgeMode;
        if (strategy.rollDefenseMode  != null && rollDefenseModeSelect) rollDefenseModeSelect.value = strategy.rollDefenseMode;
        if (strategy.portfolioMode    != null) portfolioModeSelect.value    = strategy.portfolioMode;
        if (strategy.capitalMode      != null) capitalModeSelect.value      = strategy.capitalMode;
        if (strategy.capital          != null) capitalInput.value           = strategy.capital;
        if (strategy.targetMarginRatio != null) {
            const savedRatio = parseFloat(strategy.targetMarginRatio) || 200;
            targetMarginRatioInput.value = savedRatio < 180 ? 200 : savedRatio;
        }
        if (strategy.isAutoWeight     != null) {
            isAutoWeight = strategy.isAutoWeight;
            if (chkAutoWeight) chkAutoWeight.checked = isAutoWeight;
        }
        // Sync UI state from restored values
        const isAutoSolve = capitalModeSelect.value === 'auto-solve';
        capitalInput.disabled = isAutoSolve;
        targetRatioRow.classList.toggle('hidden', !isAutoSolve);
        customOtmRow.classList.toggle('hidden', strikeRuleSelect.value !== 'CUSTOM_OTM');
        autoWeightsContainer.classList.toggle('hidden', portfolioModeSelect.value !== 'delta-neutral');
    }

    if (isAutoWeight) autoDistributeWeights();
    renderAssetCards();
    updateWeightTotalBar();
    updateAutoWeightsList();
    updateRecommendation();
    runBacktest();

    // Fetch TWSE history for any TWSE assets
    for (const asset of selectedAssets) {
        if (asset.source === 'twse' && asset.priceHistory === undefined) {
            fetchTWSEHistory(asset);
        }
    }
}

// Track which preset is active ('frugal' | 'stable' | 'custom' | null)
let activePreset = 'frugal';

function setActivePreset(preset) {
    activePreset = preset;
    ['frugal', 'stable'].forEach(id => {
        const btn = document.getElementById(`preset-btn-${id}`);
        if (btn) btn.classList.toggle('active', id === preset);
    });
}

function applyPreset(preset) {
    const def = PORTFOLIO_PRESETS[preset];
    if (!def) return;
    const assets = def.symbols.map(sym => findPresetAsset(sym)).filter(Boolean);
    selectedAssets = assets.map(a => ({ ...a, weight: 0 }));
    autoDistributeWeights();
    setActivePreset(preset);
    renderAssetCards();
    updateWeightTotalBar();
    updateAutoWeightsList();
    updateRecommendation();
    runBacktest();
    // Fetch TWSE history for any TWSE-sourced assets in the preset
    for (const asset of selectedAssets) {
        if (asset.source === 'twse' && asset.priceHistory === undefined) {
            fetchTWSEHistory(asset);
        }
    }
}

function saveToCustomSlot(slotIndex) {
    if (selectedAssets.length === 0) return;
    const data = serializeCurrentPortfolio();
    const assetLabel   = data.assets.map(a => a.symbol).join(' · ');
    const strategyLabel = buildStrategyLabel(data.strategy);
    customSlots[slotIndex] = {
        label: assetLabel,
        strategyLabel,
        data,                     // full serialized object {assets, strategy}
    };
    saveCustomSlots();
    renderCustomSlots();
    showFetchStatus(`✅ 已儲存至自選組合 ${slotIndex + 1}（含策略設定）`, 'success');
    setTimeout(() => hideFetchStatus(), 2500);
}

/** Build a short human-readable strategy summary for display */
function buildStrategyLabel(s) {
    if (!s) return '';
    const typeMap  = { taiex: '台指', tsmc: '台積電' };
    const cycleMap = { weekly: '周選', monthly: '月選' };
    const strikeMap = {
        ATM: 'ATM', OTM_2: 'OTM2%', OTM_5: 'OTM5%', OTM_10: 'OTM10%',
        CUSTOM_OTM: `OTM${s.customOtmValue}%`,
        DELTA_3: 'Δ0.30', DELTA_2: 'Δ0.20', DELTA_1: 'Δ0.10',
    };
    const modeMap = { 'delta-neutral': 'Auto Δ', manual: '手動' };
    const hedgeMap = { 'none': '不避險', 'b5': '🛡️B5', 'b3': '🛡️B3', 'a1': '🛡️A1' };
    return [
        typeMap[s.optionType]  || s.optionType,
        cycleMap[s.optionCycle] || s.optionCycle,
        strikeMap[s.strikeRule] || s.strikeRule,
        `${s.optionContracts}口`,
        hedgeMap[s.hedgeMode] || '🛡️B5',
        modeMap[s.portfolioMode] || s.portfolioMode,
    ].join(' · ');
}

function loadFromCustomSlot(slotIndex) {
    const slot = customSlots[slotIndex];
    if (!slot) return;
    // Support both old format (slot.assets plain array) and new format (slot.data)
    const payload = slot.data || slot.assets;
    applySerializedPortfolio(payload);
    setActivePreset(null);
    renderCustomSlots();
}

function clearCustomSlot(slotIndex) {
    customSlots[slotIndex] = null;
    saveCustomSlots();
    renderCustomSlots();
}

function renderCustomSlots() {
    const container = document.getElementById('custom-slots-row');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const slot = customSlots[i];
        const card = document.createElement('div');
        card.className = 'custom-slot-card' + (slot ? ' has-data' : ' empty');
        if (slot) {
            const stratLine = slot.strategyLabel
                ? `<div class="custom-slot-strategy" title="${slot.strategyLabel}">${slot.strategyLabel}</div>`
                : '';
            card.innerHTML = `
                <div class="custom-slot-num">自選 ${i + 1}</div>
                <div class="custom-slot-label" title="${slot.label}">${slot.label}</div>
                ${stratLine}
                <div class="custom-slot-actions">
                    <button type="button" class="slot-btn slot-btn--load" onclick="loadFromCustomSlot(${i})" title="載入此組合（含策略設定）">▶ 載入</button>
                    <button type="button" class="slot-btn slot-btn--save" onclick="saveToCustomSlot(${i})" title="覆蓋儲存目前組合">💾</button>
                    <button type="button" class="slot-btn slot-btn--clear" onclick="clearCustomSlot(${i})" title="清除此組合">✕</button>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="custom-slot-num">自選 ${i + 1}</div>
                <div class="custom-slot-empty-hint">空白</div>
                <div class="custom-slot-actions">
                    <button type="button" class="slot-btn slot-btn--save" onclick="saveToCustomSlot(${i})" title="儲存目前組合到此槽（含策略設定）">💾 儲存</button>
                </div>
            `;
        }
        container.appendChild(card);
    }
}


const twsePriceCache = {};
let searchDebounceTimer = null;

// ─────────────────────────────────────────────
// DOM ELEMENTS
// ─────────────────────────────────────────────
const startSelect = document.getElementById('start-date');
const endSelect = document.getElementById('end-date');
const capitalModeSelect = document.getElementById('capital-mode');
const capitalInput = document.getElementById('input-capital');
const portfolioModeSelect = document.getElementById('portfolio-mode');
const optionTypeSelect = document.getElementById('option-type');
const optionCycleSelect = document.getElementById('option-cycle');
const strikeRuleSelect = document.getElementById('strike-rule');
const optionContractsInput = document.getElementById('option-contracts');
const hedgeModeSelect = document.getElementById('hedge-mode');
const rollDefenseModeSelect = document.getElementById('roll-defense-mode');
const customOtmRow = document.getElementById('custom-otm-row');
const customOtmValueInput = document.getElementById('custom-otm-value');
const targetRatioRow = document.getElementById('target-ratio-row');
const targetMarginRatioInput = document.getElementById('target-margin-ratio');
const autoWeightsContainer = document.getElementById('auto-weights-container');
const autoWeightsList = document.getElementById('auto-weights-list');
const btnRun = document.getElementById('btn-run');
const dataStatusBadge = document.getElementById('data-status-badge');

const assetSearchInput = document.getElementById('asset-search-input');
const assetSearchDropdown = document.getElementById('asset-search-dropdown');
const assetCardsContainer = document.getElementById('asset-cards-container');
const weightTotalVal = document.getElementById('weight-total-val');
const weightTotalFill = document.getElementById('weight-total-fill');
const dataFetchStatus = document.getElementById('data-fetch-status');
const chkAutoWeight = document.getElementById('chk-auto-weight');

const adviceStrike = document.getElementById('advice-strike');
const advicePremium = document.getElementById('advice-premium');
const adviceHedgeStatus = document.getElementById('advice-hedge-status');
const adviceAssetsTbody = document.getElementById('advice-assets-tbody');
const adviceMarginRatio = document.getElementById('advice-margin-ratio');
const latestTaiexSpan = document.getElementById('latest-taiex');
const latestTsmcSpan = document.getElementById('latest-tsmc');
const instTableRowsSelect = document.getElementById('inst-table-rows');
const instTableTbody = document.getElementById('inst-table-tbody');
const kpiForeignBpAmt = document.getElementById('kpi-foreign-bp-amt');
const kpiForeignSp = document.getElementById('kpi-foreign-sp');
const kpiForeignSpBpDiff = document.getElementById('kpi-foreign-sp-bp-diff');
const kpiForeignBcAmt = document.getElementById('kpi-foreign-bc-amt');
const btnRefreshData = document.getElementById('btn-refresh-data');
const btnTableRefresh = document.getElementById('btn-table-refresh');
const refreshIcon = document.getElementById('refresh-icon');

// ─────────────────────────────────────────────
// INITIALIZE
// ─────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("Loading database...");
        let response;
        try {
            response = await fetch('./data/data.json?v=' + Date.now());
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        } catch (localErr) {
            console.warn("Local fetch failed, trying GitHub raw fallback...", localErr);
            response = await fetch('https://raw.githubusercontent.com/pilimesai/cover-call/main/data/data.json?v=' + Date.now());
            if (!response.ok) throw new Error(`遠端數據載入失敗: ${response.statusText}`);
        }
        rawData = await response.json();
        console.log(`Database loaded successfully. Records: ${rawData.length}`);
        // 自動檢查 FinMind 是否有比靜態 data.json 更新的當日籌碼與行情
        try {
            await syncLiveFinMindData();
        } catch (liveErr) {
            console.warn("Live FinMind auto-sync skipped:", liveErr);
        }
        const initLatest = rawData[rawData.length - 1];
        dataStatusBadge.innerHTML = `<span class="dot green"></span> 數據已載入 (${initLatest ? initLatest.date : ''})`;
        populateDropdowns();
        setupEventListeners();
        if (chkAutoWeight) chkAutoWeight.checked = isAutoWeight;

        // Load custom slots from localStorage
        loadCustomSlots();
        renderCustomSlots();

        // Apply default frugal preset (小資組合)
        applyPreset('frugal');

        // Render Institutional Options Table & KPIs
        renderInstitutionalOptionsTable();
    } catch (error) {
        console.error("Initialization error:", error);
        dataStatusBadge.innerHTML = '<span class="dot red"></span> 數據載入失敗';
        alert("載入歷史數據時發生錯誤，請確保已執行 generate_data.py！");
    }
});


function populateDropdowns() {
    startSelect.innerHTML = '';
    endSelect.innerHTML = '';
    let defaultStartIndex = 0;
    for (let i = 0; i < rawData.length; i++) {
        if (rawData[i].etf_991 !== null) { defaultStartIndex = i; break; }
    }
    rawData.forEach((record, index) => {
        const optionStart = document.createElement('option');
        optionStart.value = index;
        optionStart.textContent = record.date;
        if (index === defaultStartIndex) optionStart.selected = true;
        startSelect.appendChild(optionStart);

        const optionEnd = document.createElement('option');
        optionEnd.value = index;
        optionEnd.textContent = record.date;
        if (index === rawData.length - 1) optionEnd.selected = true;
        endSelect.appendChild(optionEnd);
    });
}

function autoDistributeWeights() {
    if (!selectedAssets.length) return;
    const len = selectedAssets.length;
    if (len === 1) {
        selectedAssets[0].weight = 100;
        return;
    }
    const futuresIdx = [];
    const spotIdx = [];
    selectedAssets.forEach((a, idx) => {
        if (a.type === 'futures') futuresIdx.push(idx);
        else spotIdx.push(idx);
    });

    // 智慧期現貨配比：若同時包含「期貨」與「現股/ETF」，自動將高現金消耗的現股控制在 20%~25%，
    // 讓 75%~80% 曝險由高資金效率的期貨承擔，將現金留在期貨專戶保護維持率
    if (futuresIdx.length > 0 && spotIdx.length > 0) {
        if (len === 2) {
            selectedAssets[futuresIdx[0]].weight = 75;
            selectedAssets[spotIdx[0]].weight = 25;
        } else if (len === 3) {
            if (futuresIdx.length === 2 && spotIdx.length === 1) {
                selectedAssets[futuresIdx[0]].weight = 40;
                selectedAssets[futuresIdx[1]].weight = 40;
                selectedAssets[spotIdx[0]].weight = 20;
            } else {
                selectedAssets[futuresIdx[0]].weight = 60;
                selectedAssets[spotIdx[0]].weight = 20;
                selectedAssets[spotIdx[1]].weight = 20;
            }
        }
        return;
    }

    // 純現股或純期貨組合：等權重分配
    if (len === 2) {
        selectedAssets[0].weight = 50;
        selectedAssets[1].weight = 50;
    } else if (len === 3) {
        selectedAssets[0].weight = 33;
        selectedAssets[1].weight = 33;
        selectedAssets[2].weight = 34;
    }
}

function setupEventListeners() {
    capitalModeSelect.addEventListener('change', () => {
        if (capitalModeSelect.value === 'auto-solve') {
            capitalInput.disabled = true;
            targetRatioRow.classList.remove('hidden');
        } else {
            capitalInput.disabled = false;
            targetRatioRow.classList.add('hidden');
        }
        updateRecommendation();
        runBacktest();
    });

    targetMarginRatioInput.addEventListener('input', () => updateRecommendation());
    targetMarginRatioInput.addEventListener('change', () => runBacktest());

    startSelect.addEventListener('change', () => {
        if (parseInt(startSelect.value) >= parseInt(endSelect.value))
            endSelect.value = Math.min(parseInt(startSelect.value) + 1, rawData.length - 1);
        updateRecommendation(); runBacktest();
    });
    endSelect.addEventListener('change', () => {
        if (parseInt(endSelect.value) <= parseInt(startSelect.value))
            startSelect.value = Math.max(parseInt(endSelect.value) - 1, 0);
        updateRecommendation(); runBacktest();
    });

    portfolioModeSelect.addEventListener('change', () => {
        const isAuto = portfolioModeSelect.value === 'delta-neutral';
        if (isAuto) autoWeightsContainer.classList.remove('hidden');
        else autoWeightsContainer.classList.add('hidden');
        updateAutoWeightsList();
        updateRecommendation(); runBacktest();
    });

    const clearActualInputs = () => {
        const elS = document.getElementById('actual-strike-input');
        const elP = document.getElementById('actual-premium-input');
        if (elS) elS.value = '';
        if (elP) elP.value = '';
    };

    optionTypeSelect.addEventListener('change', () => { clearActualInputs(); updateRecommendation(); runBacktest(); });
    optionCycleSelect.addEventListener('change', () => { clearActualInputs(); updateRecommendation(); runBacktest(); });

    strikeRuleSelect.addEventListener('change', () => {
        if (strikeRuleSelect.value === 'CUSTOM_OTM') customOtmRow.classList.remove('hidden');
        else customOtmRow.classList.add('hidden');
        clearActualInputs();
        updateRecommendation(); runBacktest();
    });

    customOtmValueInput.addEventListener('input', () => { clearActualInputs(); updateRecommendation(); });
    customOtmValueInput.addEventListener('change', () => runBacktest());

    const actualStrikeEl = document.getElementById('actual-strike-input');
    const actualPremEl = document.getElementById('actual-premium-input');
    const btnResetActual = document.getElementById('btn-reset-actual');
    if (actualStrikeEl) actualStrikeEl.addEventListener('input', () => updateRecommendation());
    if (actualPremEl) actualPremEl.addEventListener('input', () => updateRecommendation());
    if (btnResetActual) {
        btnResetActual.addEventListener('click', () => {
            clearActualInputs();
            updateRecommendation();
        });
    }
    if (hedgeModeSelect) {
        hedgeModeSelect.addEventListener('change', () => { updateRecommendation(); runBacktest(); });
    }
    if (rollDefenseModeSelect) {
        rollDefenseModeSelect.addEventListener('change', () => { updateRecommendation(); runBacktest(); });
    }
    optionContractsInput.addEventListener('input', () => updateRecommendation());
    optionContractsInput.addEventListener('change', () => runBacktest());
    btnRun.addEventListener('click', () => runBacktest());
    if (instTableRowsSelect) {
        instTableRowsSelect.addEventListener('change', () => renderInstitutionalOptionsTable());
    }
    if (btnRefreshData) {
        btnRefreshData.addEventListener('click', handleRefreshData);
    }
    if (btnTableRefresh) {
        btnTableRefresh.addEventListener('click', handleRefreshData);
    }

    assetSearchInput.addEventListener('input', () => {
        clearTimeout(searchDebounceTimer);
        const q = assetSearchInput.value.trim();
        if (q.length < 1) { hideDropdown(); return; }
        searchDebounceTimer = setTimeout(() => handleAssetSearch(q), 250);
    });
    assetSearchInput.addEventListener('focus', () => {
        const q = assetSearchInput.value.trim();
        if (q.length >= 1) handleAssetSearch(q);
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#asset-search-section')) hideDropdown();
    });

    if (chkAutoWeight) {
        chkAutoWeight.addEventListener('change', () => {
            isAutoWeight = chkAutoWeight.checked;
            if (isAutoWeight) {
                autoDistributeWeights();
            }
            renderAssetCards();
            updateWeightTotalBar();
            updateRecommendation();
            runBacktest();
        });
    }
}

// ─────────────────────────────────────────────
// ASSET SEARCH
// ─────────────────────────────────────────────
async function handleAssetSearch(query) {
    showDropdownLoading();
    const q = query.trim().toLowerCase();

    const alreadySelected = new Set(selectedAssets.map(a => a.symbol));
    if (alreadySelected.has('TSMC')) alreadySelected.add('2330');
    if (alreadySelected.has('2330')) alreadySelected.add('TSMC');
    const builtinSymbols = new Set(BUILTIN_ASSETS.map(a => a.symbol));
    const addedSymbols = new Set();
    const items = [];

    // 1. Builtin matches (instant)
    for (const asset of BUILTIN_ASSETS) {
        if (alreadySelected.has(asset.symbol) || addedSymbols.has(asset.symbol)) continue;
        if (asset.symbol.toLowerCase().includes(q) || asset.name.toLowerCase().includes(q)) {
            items.push({ ...asset });
        }
    }

    // 2. Popular catalog matches
    for (const cat of POPULAR_CATALOG) {
        if (alreadySelected.has(cat.symbol) || builtinSymbols.has(cat.symbol) || addedSymbols.has(cat.symbol)) continue;
        if (cat.symbol.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q)) {
            items.push({
                symbol: cat.symbol,
                name: cat.name,
                type: cat.type,
                priceField: null,
                contractMultiplier: cat.contractMultiplier !== undefined ? cat.contractMultiplier : 1,
                marginRate: cat.marginRate !== undefined ? cat.marginRate : (cat.type === 'futures' ? 0.115 : 0),
                source: 'twse',
                twseCode: cat.twseCode,
                exchange: cat.exchange,
            });
            addedSymbols.add(cat.symbol);
        }
    }

    // 3. TWSE API — always try if query looks like a stock code
    const looksLikeCode = /^[0-9]{2,8}[A-Za-z]?$/.test(query.trim());
    if (looksLikeCode) {
        try {
            const twseResults = await searchTWSE(query.trim());
            for (const r of twseResults) {
                if (!alreadySelected.has(r.symbol) && !addedSymbols.has(r.symbol)) {
                    items.push(r);
                    addedSymbols.add(r.symbol);
                }
            }
        } catch (e) { console.warn('TWSE search failed:', e); }
    }

    renderDropdown(items, query);
}


async function searchTWSE(query) {
    const results = [];
    const codeQuery = query.replace(/\s/g, '');
    if (codeQuery.length < 2 || codeQuery.length > 8) return results;
    for (const exchange of ['tse', 'otc']) {
        try {
            const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${exchange}_${codeQuery}.tw&json=1&delay=0`;
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(5000) });
            const data = await resp.json();
            const parsed = JSON.parse(data.contents);
            if (parsed && parsed.msgArray) {
                for (const item of parsed.msgArray) {
                    if (!item.n || !item.c) continue;
                    if (results.some(r => r.symbol === item.c)) continue;
                    const isEtf = /^\d{5,6}[A-Z]?$/.test(item.c);
                    results.push({
                        symbol: item.c, name: item.n,
                        type: isEtf ? 'etf' : 'stock',
                        priceField: null, contractMultiplier: 1, marginRate: 0,
                        source: 'twse', twseCode: item.c, exchange,
                    });
                }
            }
        } catch (e) { /* ignore */ }
    }
    return results;
}

// ─────────────────────────────────────────────
// DROPDOWN RENDER
// ─────────────────────────────────────────────
function showDropdownLoading() {
    assetSearchDropdown.classList.remove('hidden');
    assetSearchDropdown.innerHTML = `<div class="asset-dropdown-loading"><span class="spin">⏳</span> 搜尋中...</div>`;
}
function hideDropdown() {
    assetSearchDropdown.classList.add('hidden');
    assetSearchDropdown.innerHTML = '';
}
function renderDropdown(items, query = '') {
    const looksLikeCode = /^[0-9]{2,8}[A-Za-z]?$/.test(query.trim());
    if (items.length === 0) {
        const hint = looksLikeCode
            ? `找不到股票代碼 <strong>${query}</strong>，請確認是否為 TWSE/OTC 上市股票，或網路暫時不穩定。`
            : `找不到 <strong>${query}</strong>。搜尋目錄外的股票請直接輸入股票代碼（如 <strong>2912</strong>、3045、1216）`;
        assetSearchDropdown.innerHTML = `<div class="asset-dropdown-empty">${hint}</div>`;
        assetSearchDropdown.classList.remove('hidden');
        return;
    }
    assetSearchDropdown.classList.remove('hidden');
    assetSearchDropdown.innerHTML = items.slice(0, 12).map(item => {
        const bc = item.type === 'futures' ? 'futures' : item.type === 'etf' ? 'etf' : 'stock';
        const bl = item.type === 'futures' ? '期貨' : item.type === 'etf' ? 'ETF' : '股票';
        return `<div class="asset-dropdown-item" data-symbol="${item.symbol}" data-source="${item.source}">
            <span class="asset-dropdown-symbol">${item.symbol}</span>
            <span class="asset-dropdown-name">${item.name}</span>
            <span class="asset-badge ${bc}">${bl}</span>
        </div>`;
    }).join('');

    assetSearchDropdown.querySelectorAll('.asset-dropdown-item').forEach(el => {
        el.addEventListener('click', () => {
            const sym = el.dataset.symbol;
            const src = el.dataset.source;
            let assetDef;
            if (src === 'builtin') {
                assetDef = BUILTIN_ASSETS.find(a => a.symbol === sym);
            } else {
                const cat = POPULAR_CATALOG.find(c => c.symbol === sym);
                const nameEl = el.querySelector('.asset-dropdown-name');
                const badgeEl = el.querySelector('.asset-badge');
                const typeMap = { 'ETF': 'etf', '股票': 'stock', '期貨': 'futures' };
                const type = typeMap[badgeEl ? badgeEl.textContent.trim() : '股票'] || 'stock';
                assetDef = {
                    symbol: sym, name: nameEl ? nameEl.textContent : sym,
                    type, priceField: null,
                    contractMultiplier: cat && cat.contractMultiplier !== undefined ? cat.contractMultiplier : 1,
                    marginRate: cat && cat.marginRate !== undefined ? cat.marginRate : (type === 'futures' ? 0.115 : 0),
                    source: 'twse',
                    twseCode: cat ? cat.twseCode : sym,
                    exchange: cat ? cat.exchange : 'tse',
                };
            }
            if (assetDef) addAsset(assetDef);
            hideDropdown();
            assetSearchInput.value = '';
        });
    });
}



// ─────────────────────────────────────────────
// ADD / REMOVE ASSET
// ─────────────────────────────────────────────
async function addAsset(assetDef) {
    if (selectedAssets.length >= 3) {
        showFetchStatus('⚠️ 最多只能選 3 個標的', 'warning'); return;
    }
    const alreadySelected = new Set(selectedAssets.map(a => a.symbol));
    if (alreadySelected.has('TSMC')) alreadySelected.add('2330');
    if (alreadySelected.has('2330')) alreadySelected.add('TSMC');
    if (alreadySelected.has(assetDef.symbol)) {
        showFetchStatus('ℹ️ 此標的已在組合中', 'info'); return;
    }

    // Clear preset highlight when user customizes manually
    setActivePreset(null);

    const newAsset = { ...assetDef, weight: 0 };
    selectedAssets.push(newAsset);

    if (isAutoWeight) {
        autoDistributeWeights();
    } else {
        const totalUsed = selectedAssets.reduce((s, a) => s + a.weight, 0);
        const remaining = Math.max(0, 100 - totalUsed);
        newAsset.weight = remaining > 0 ? Math.min(remaining, 40) : 20;
    }

    if (assetDef.source === 'twse') {
        renderAssetCards();
        updateWeightTotalBar();
        await fetchTWSEHistory(newAsset);
    } else {
        renderAssetCards();
        updateWeightTotalBar();
        updateAutoWeightsList();
        updateRecommendation();
        runBacktest();
    }
}

function removeAsset(index) {
    // Clear preset highlight when user customizes manually
    setActivePreset(null);
    selectedAssets.splice(index, 1);
    if (isAutoWeight) {
        autoDistributeWeights();
    }
    renderAssetCards();
    updateWeightTotalBar();
    updateAutoWeightsList();
    updateRecommendation();
    runBacktest();
}

// ─────────────────────────────────────────────
// FETCH TWSE HISTORICAL DATA
// ─────────────────────────────────────────────
async function fetchTWSEHistory(asset) {
    if (twsePriceCache[asset.symbol]) {
        asset.priceHistory = twsePriceCache[asset.symbol];
        return;
    }

    showFetchStatus(`<span class="spin">⟳</span> 正在從 TWSE 下載 ${asset.symbol} 歷史數據...`);

    const startIdx = parseInt(startSelect.value) || 0;
    const endIdx = parseInt(endSelect.value) || rawData.length - 1;
    const startDate = new Date(rawData[startIdx].date);
    const endDate = new Date(rawData[endIdx].date);

    const months = new Set();
    const cur = new Date(startDate);
    cur.setDate(1);
    while (cur <= endDate) {
        months.add(`${cur.getFullYear()}${String(cur.getMonth() + 1).padStart(2, '0')}01`);
        cur.setMonth(cur.getMonth() + 1);
    }

    const stockCode = asset.twseCode || asset.symbol;
    const allRecords = [];
    for (const yyyymmdd of [...months].sort()) {
        try {
            const url = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${yyyymmdd}&stockNo=${stockCode}`;
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
            const proxyData = await resp.json();
            const parsed = JSON.parse(proxyData.contents);
            if (parsed && parsed.data) {
                for (const row of parsed.data) {
                    const dateStr = twseRowDateToISO(row[0]);
                    const close = parseFloat(row[6].replace(/,/g, ''));
                    if (dateStr && !isNaN(close)) allRecords.push({ date: dateStr, close });
                }
            }
            await sleep(250);
        } catch (e) { console.warn(`TWSE fetch failed for ${yyyymmdd}:`, e); }
    }

    if (allRecords.length > 0) {
        allRecords.sort((a, b) => a.date.localeCompare(b.date));
        twsePriceCache[asset.symbol] = allRecords;
        const found = selectedAssets.find(a => a.symbol === asset.symbol);
        if (found) found.priceHistory = allRecords;
        showFetchStatus(`✅ ${asset.symbol} 歷史數據載入完成 (${allRecords.length} 筆)`, 'success');
        setTimeout(() => hideFetchStatus(), 3000);
    } else {
        twsePriceCache[asset.symbol] = [];
        const found = selectedAssets.find(a => a.symbol === asset.symbol);
        if (found) found.priceHistory = [];
        showFetchStatus(`⚠️ ${asset.symbol} 無法取得歷史數據（將使用最新價格進行靜態分析）`, 'warning');
        setTimeout(() => hideFetchStatus(), 4000);
    }
    renderAssetCards();
    updateRecommendation();
    runBacktest();
}

function twseRowDateToISO(twseDate) {
    const parts = twseDate.split('/');
    if (parts.length !== 3) return null;
    return `${parseInt(parts[0]) + 1911}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
}

function getPriceFromHistory(priceHistory, dateStr) {
    if (!priceHistory || priceHistory.length === 0) return null;
    let lo = 0, hi = priceHistory.length - 1, result = null;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (priceHistory[mid].date <= dateStr) { result = priceHistory[mid].close; lo = mid + 1; }
        else hi = mid - 1;
    }
    return result;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function showFetchStatus(html, type = 'info') {
    dataFetchStatus.innerHTML = html;
    dataFetchStatus.className = 'data-fetch-status';
    if (type === 'warning') dataFetchStatus.style.borderColor = 'rgba(245,158,11,0.4)';
    else if (type === 'success') dataFetchStatus.style.borderColor = 'rgba(16,185,129,0.4)';
    else dataFetchStatus.style.borderColor = 'rgba(6,182,212,0.25)';
    dataFetchStatus.classList.remove('hidden');
}
function hideFetchStatus() { dataFetchStatus.classList.add('hidden'); }

// ─────────────────────────────────────────────
// RENDER ASSET CARDS
// ─────────────────────────────────────────────
function renderAssetCards() {
    assetCardsContainer.innerHTML = '';
    selectedAssets.forEach((asset, i) => {
        const bc = asset.type === 'futures' ? 'futures' : asset.type === 'etf' ? 'etf' : 'stock';
        const bl = asset.type === 'futures' ? '期貨' : asset.type === 'etf' ? 'ETF' : '股票';

        let dataNote = '';
        if (asset.source === 'twse') {
            if (asset.priceHistory === undefined) {
                dataNote = `<div class="asset-card-margin-note" style="color:var(--warning)">⏳ 歷史數據載入中...</div>`;
            } else if (asset.priceHistory.length > 0) {
                dataNote = `<div class="asset-card-margin-note">📊 TWSE 歷史數據: ${asset.priceHistory.length} 筆</div>`;
            } else {
                dataNote = `<div class="asset-card-margin-note" style="color:var(--text-muted)">⚠️ 載入失敗 (將使用現價回測)</div>`;
            }
        }
        const marginNote = asset.marginRate > 0
            ? `<div class="asset-card-margin-note">💰 期貨保證金: ${(asset.marginRate * 100).toFixed(1)}% | 合約乘數: ×${asset.contractMultiplier}</div>`
            : '';

        let sliderRow = '';
        if (isAutoWeight) {
            sliderRow = `
                <div class="asset-card-slider-row">
                    <span class="asset-card-slider-label">配置權重</span>
                    <span class="asset-card-weight-val" style="margin-left:auto; font-weight:600; color:var(--primary);">${asset.weight}% (自動分配)</span>
                </div>
            `;
        } else {
            sliderRow = `
                <div class="asset-card-slider-row">
                    <span class="asset-card-slider-label">配置權重</span>
                    <input type="range" class="asset-card-slider" id="slider-asset-${i}" min="0" max="100" value="${asset.weight}">
                    <span class="asset-card-weight-val" id="weight-val-asset-${i}">${asset.weight}%</span>
                </div>
            `;
        }

        const card = document.createElement('div');
        card.className = 'asset-card';
        card.innerHTML = `
            <div class="asset-card-header">
                <span class="asset-card-symbol">${asset.symbol}</span>
                <span class="asset-badge ${bc}">${bl}</span>
                <span class="asset-card-name">${asset.name}</span>
                <button class="asset-card-remove" onclick="removeAsset(${i})" title="移除此標的">✕</button>
            </div>
            ${sliderRow}
            ${marginNote}${dataNote}
        `;
        assetCardsContainer.appendChild(card);

        if (!isAutoWeight) {
            const slider = card.querySelector(`#slider-asset-${i}`);
            const valSpan = card.querySelector(`#weight-val-asset-${i}`);
            slider.addEventListener('input', () => {
                selectedAssets[i].weight = parseInt(slider.value);
                valSpan.textContent = `${selectedAssets[i].weight}%`;
                updateWeightTotalBar();
                updateRecommendation();
            });
            slider.addEventListener('change', () => { if (!btnRun.disabled) runBacktest(); });
        }
    });

    if (selectedAssets.length < 3) {
        const hint = document.createElement('div');
        hint.className = 'asset-add-hint';
        hint.innerHTML = `🔍 還可新增 ${3 - selectedAssets.length} 個標的 — 在上方搜尋框輸入代碼或名稱`;
        assetCardsContainer.appendChild(hint);
    } else {
        const hint = document.createElement('div');
        hint.className = 'asset-max-hint';
        hint.textContent = '已達最多 3 個標的上限。移除一個以新增其他組合。';
        assetCardsContainer.appendChild(hint);
    }
    updateAutoWeightsList();
}

function updateWeightTotalBar() {
    const total = selectedAssets.reduce((s, a) => s + a.weight, 0);
    const pct = Math.min(total, 100);
    weightTotalFill.style.width = `${pct}%`;
    if (total === 100) {
        weightTotalVal.textContent = '100%  ✓';
        weightTotalVal.className = 'weight-total-val ok';
        weightTotalFill.style.background = 'var(--success)';
        btnRun.disabled = false;
    } else if (total > 100) {
        weightTotalVal.textContent = `${total}%  ⚠`;
        weightTotalVal.className = 'weight-total-val over';
        weightTotalFill.style.background = 'var(--danger)';
        btnRun.disabled = true;
    } else {
        weightTotalVal.textContent = `${total}%`;
        weightTotalVal.className = 'weight-total-val under';
        weightTotalFill.style.background = 'var(--warning)';
        btnRun.disabled = true;
    }
}

function getTotalWeight() { return selectedAssets.reduce((s, a) => s + a.weight, 0); }

function updateAutoWeightsList() {
    if (!autoWeightsList) return;
    autoWeightsList.innerHTML = selectedAssets.map(a =>
        `<li>${a.symbol} (${a.name})：分配 ${a.weight}% 的 Delta 避險比重</li>`
    ).join('');
}

// ─────────────────────────────────────────────
// HELPER: Get asset price
// ─────────────────────────────────────────────
function getAssetPrice(asset, row) {
    if (asset.source === 'builtin') return row[asset.priceField] || null;
    const historyPrice = getPriceFromHistory(asset.priceHistory, row.date);
    if (historyPrice !== null) return historyPrice;

    // Intelligent fallback for TWSE assets without downloaded history
    if (asset.symbol === '0050' || asset.symbol === '0050F') {
        return row.etf_0050 || (row.taiex / 200.0);
    }
    if (asset.priceField && row[asset.priceField]) {
        return row[asset.priceField];
    }
    // For general stocks/ETFs, fallback to reasonable estimate rather than whole TAIEX index
    if (asset.type === 'stock' || asset.type === 'etf') {
        return row.tsmc ? (row.tsmc / 10.0) : 100.0;
    }
    return row.taiex || null;
}

// ─────────────────────────────────────────────
// ASSET BETA HELPER
// ─────────────────────────────────────────────
/**
 * Returns the effective beta of an asset relative to the option underlying.
 * - Futures always track their underlying exactly → beta = 1.0
 * - TSMC stock vs TSMC options → beta = 1.0
 * - Builtin ETFs: read rolling beta from the row's betas object
 * - TWSE assets without beta data → assume 1.0
 */
function getAssetBeta(asset, row, optionType) {
    if (asset.type === 'futures') return 1.0;

    // TSMC stock is the underlying for tsmc options
    if ((asset.symbol === 'TSMC' || asset.symbol === '2330') && optionType === 'tsmc') return 1.0;

    // Builtin ETFs carry betaField references
    const betaField = optionType === 'taiex' ? asset.betaField_taiex : asset.betaField_tsmc;
    if (betaField && row.betas && row.betas[betaField] !== undefined) {
        return Math.max(0.05, row.betas[betaField]); // floor at 0.05 to avoid division blow-up
    }

    // TWSE-fetched assets or anything without beta data → assume 1
    return 1.0;
}

// ─────────────────────────────────────────────
// ESTIMATE DELTA
// ─────────────────────────────────────────────
function estimateDelta(rule) {
    if (rule === 'CUSTOM_OTM') {
        const customOtmPct = parseFloat(customOtmValueInput.value) || 0;
        return Math.max(0.50 - (customOtmPct * 0.045), 0.01);
    }
    switch (rule) {
        case 'ATM': return 0.50;
        case 'OTM_2': return 0.38;
        case 'OTM_5': return 0.22;
        case 'OTM_10': return 0.08;
        case 'DELTA_3': return 0.30;
        case 'DELTA_2': return 0.20;
        case 'DELTA_1': return 0.10;
        default: return 0.20;
    }
}

// ─────────────────────────────────────────────
// SMART RESIDUAL EXPOSURE SIZING (避免大顆粒期貨如 MTX 造成多單超買)
// ─────────────────────────────────────────────
function computeSmartAssetQuantities(row, optionType, targetExposure, isDeltaNeutral) {
    const entries = selectedAssets.map((asset, idx) => {
        const wFrac = asset.weight / 100.0;
        const price = getAssetPrice(asset, row) || (asset.symbol === '0050' || asset.symbol === '0050F' ? (row.etf_0050 || row.taiex / 200.0) : (asset.priceField === 'tsmc' || asset.symbol === 'TSMC' || asset.symbol === 'QFF' || asset.symbol === 'CDF' ? row.tsmc : (asset.type === 'stock' || asset.type === 'etf' ? 100.0 : row.taiex)));
        const beta = getAssetBeta(asset, row, optionType);
        const unitExp = asset.type === 'futures' ? (price * asset.contractMultiplier) : (price * beta);
        return {
            idx, asset, wFrac, weightPct: asset.weight, price, beta, unitExp,
            value: targetExposure * wFrac,
            qty: 0, rawQty: 0, rawCost: 0, margin: 0, effectiveExposure: 0
        };
    });

    if (!isDeltaNeutral) {
        entries.forEach(entry => {
            if (entry.asset.type === 'futures') {
                const cv = entry.price * entry.asset.contractMultiplier;
                entry.qty = cv > 0 ? Math.max(1, Math.round(entry.value / cv)) : 0;
                entry.effectiveExposure = entry.qty * cv;
                entry.margin = entry.effectiveExposure * entry.asset.marginRate;
            } else {
                entry.rawQty = (entry.price > 0 && entry.beta > 0) ? Math.round(entry.value / (entry.price * entry.beta)) : 0;
                entry.rawCost = Math.round(entry.rawQty * entry.price);
                entry.qty = entry.rawQty;
                entry.effectiveExposure = entry.qty * entry.price * entry.beta;
            }
        });
        return entries;
    }

    // Delta-Neutral 智慧殘餘曝險分配：
    // 先依合約價值由大到小配置期貨 (如 MTX 199萬 > 0050F 93萬 > QFF 21萬)，
    // 扣除大合約實際吃掉的曝險後，將「剩餘缺口曝險」按比例交由小合約期貨(QFF)與現股(00981A)精準填補！
    let remExp = targetExposure;
    let remWeight = 1.0;
    const futuresSorted = entries.filter(e => e.asset.type === 'futures').sort((a, b) => b.unitExp - a.unitExp);
    const spotEntries = entries.filter(e => e.asset.type !== 'futures');

    for (const e of futuresSorted) {
        const desiredExp = remWeight > 0 ? remExp * (e.wFrac / remWeight) : 0;
        const cv = e.price * e.asset.contractMultiplier;
        e.qty = cv > 0 ? Math.max(1, Math.round(desiredExp / cv)) : 0;
        e.effectiveExposure = e.qty * cv;
        e.margin = e.effectiveExposure * e.asset.marginRate;
        remExp = Math.max(0, remExp - e.effectiveExposure);
        remWeight = Math.max(0, remWeight - e.wFrac);
    }

    for (const e of spotEntries) {
        const desiredExp = remWeight > 0 ? remExp * (e.wFrac / remWeight) : 0;
        e.rawQty = (e.price > 0 && e.beta > 0) ? Math.round(desiredExp / (e.price * e.beta)) : 0;
        e.rawCost = Math.round(e.rawQty * e.price);
        e.qty = e.rawQty;
        e.effectiveExposure = e.qty * e.price * e.beta;
        remExp = Math.max(0, remExp - e.effectiveExposure);
        remWeight = Math.max(0, remWeight - e.wFrac);
    }

    return entries;
}

// ─────────────────────────────────────────────
// SOLVE REQUIRED CAPITAL
// ─────────────────────────────────────────────
function solveRequiredCapital(row, optionType, optionCycle, strikeRule, portfolioMode) {
    const multiplier = optionType === 'taiex' ? 50 : 2000;
    const S_underlying = optionType === 'taiex' ? row.taiex : row.tsmc;
    const optionContracts = Math.max(1, parseInt(optionContractsInput.value) || 1);
    const targetRatio = parseFloat(targetMarginRatioInput.value) || 200;
    const ratioMultiplier = targetRatio / 100.0;

    let optInfo, delta = 0.20;
    if (strikeRule === 'CUSTOM_OTM') {
        const customOtmPct = parseFloat(customOtmValueInput.value) || 0;
        optInfo = getCustomOtmOption(row, optionType, optionCycle, customOtmPct);
        delta = optInfo.delta;
    } else {
        optInfo = row.options[optionType][optionCycle][strikeRule];
        delta = estimateDelta(strikeRule);
    }

    const optionMaintMargin = optionContracts * multiplier * (optInfo.premium + S_underlying * 0.115);

    if (portfolioMode === 'delta-neutral') {
        const targetExposure = optionContracts * (1.0 + delta) * multiplier * S_underlying;
        const sized = computeSmartAssetQuantities(row, optionType, targetExposure, true);
        const totalSpotCost = sized.filter(e => e.asset.type !== 'futures').reduce((s, e) => s + e.rawCost, 0);
        const totalFuturesMargin = sized.filter(e => e.asset.type === 'futures').reduce((s, e) => s + e.margin, 0);
        const requiredCashBuffer = ratioMultiplier * (totalFuturesMargin + optionMaintMargin);
        return Math.ceil((totalSpotCost + requiredCashBuffer) / 10000) * 10000;
    } else {
        let spotCostFactor = 0, futuresMarginFactor = 0;
        for (const asset of selectedAssets) {
            const wFrac = asset.weight / 100.0;
            const beta = getAssetBeta(asset, row, optionType);
            if (asset.type === 'futures') futuresMarginFactor += wFrac * asset.marginRate;
            else spotCostFactor += (beta > 0 ? wFrac / beta : wFrac);
        }
        const wCashFrac = Math.max(0.05, 1.0 - spotCostFactor);
        const denom = wCashFrac - ratioMultiplier * futuresMarginFactor;
        const capital = denom > 0.05 ? (ratioMultiplier * optionMaintMargin) / denom : optionContracts * multiplier * S_underlying;
        return Math.ceil(capital / 10000) * 10000;
    }
}

// ─────────────────────────────────────────────
// TAIFEX CONTRACT CODE HELPER (自動計算券商 APP 對應之 11_W1 / 11_W2 / 11月選 / 11_W4 代號)
// ─────────────────────────────────────────────
function getTaifexContractCodeByExpiry(expiryDateStr, optionCycle = 'weekly') {
    if (!expiryDateStr) return { code: '近月', fullLabel: '近月合約', md: '' };
    const parts = expiryDateStr.split('-').map(Number);
    const mo = parts[1];
    const dy = parts[2];
    const md = `${mo}/${String(dy).padStart(2, '0')}`;
    const weekNum = Math.ceil(dy / 7); // 第幾個週三 (1~5)

    if (optionCycle === 'monthly') {
        return {
            code: `${mo}`,
            badgeText: `${mo}月選 (代號 ${mo}｜${md}結算)`,
            shortCode: `${mo} (${mo}月選)`,
            md
        };
    }

    // 台指周選規則：每月第 1、2、4、5 個週三為 W1、W2、W4、W5；
    // 第 3 個週三剛好是「月選擇權結算日」，期交所不另設 W3，券商 APP 直接選「MM (月選)」！
    if (weekNum === 3) {
        return {
            code: `${mo}`,
            badgeText: `${mo} (第3週即${mo}月選，無${mo}_W3｜${md}結算)`,
            shortCode: `${mo} (第3週選${mo}月)`,
            md
        };
    }
    return {
        code: `${mo}_W${weekNum}`,
        badgeText: `${mo}_W${weekNum} (周選｜${md}結算)`,
        shortCode: `${mo}_W${weekNum}`,
        md
    };
}

function getNextPeriodExpiryStr(expiryDateStr) {
    const d = new Date(expiryDateStr);
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
}

// 台灣期交所 (TAIFEX) 臺指選擇權合法最小跳動點位 (Tick Size) 對齊：
// <10點: 0.1點 ｜ 10~50點: 0.5點 ｜ 50~500點: 1點 ｜ 500~1000點: 5點
function roundToTaifexOptionTick(pts) {
    const p = Math.max(0.5, pts);
    if (p < 10) return +(Math.round(p * 10) / 10).toFixed(1);
    if (p < 50) return +(Math.round(p * 2) / 2).toFixed(1);
    if (p < 500) return Math.round(p);
    return Math.round(p / 5) * 5;
}

// 校準真實台指選上檔 Call 波動率偏態 (Call IV Skew Damper)：
// 當近期大盤暴跌暴漲導致 20日歷史波動率 (HV) 飆破 22% 時，真實造市商對上檔價外 Call 的隱含波動率 (IV)
// 通常維持在 18%~24%（Put 高、Call 低的負偏態），避免理論價高估成 250 點而與實盤脫節。
function getCalibratedCallPremium(row, optionType, optionCycle, strike, rawPremium) {
    const S = optionType === 'taiex' ? row.taiex : row.tsmc;
    const rawVol = optionType === 'taiex' ? row.taiex_vol : row.tsmc_vol;
    if (!rawVol || rawVol <= 0.21) return rawPremium;
    const expiryDateStr = optionCycle === 'weekly'
        ? (row.expiry_date_weekly || getNextWeeklyExpiryDate(row.date))
        : (row.expiry_date_monthly || getNextMonthlyExpiryDate(row.date));
    const days = Math.max((new Date(expiryDateStr) - new Date(row.date)) / 86400000, 1);
    const T = days / 365.0;
    const otmRatio = Math.max(0, (strike - S) / S);
    const dampedVol = Math.min(0.25, 0.19 + (rawVol - 0.19) * 0.30) * Math.max(0.78, 1.0 - otmRatio * 2.0);
    const calPrem = blackScholesCall(S, strike, T, 0.015, dampedVol);
    const minFloor = optionCycle === 'weekly' ? 0.5 : 1.0;
    return roundToTaifexOptionTick(Math.max(calPrem, minFloor));
}

// ─────────────────────────────────────────────
// UPDATE RECOMMENDATION (WITH MARGIN SAFETY GUARD & EFFICIENCY DIAGNOSTICS)
// ─────────────────────────────────────────────
function updateRecommendation() {
    if (rawData.length === 0) return;
    const row = rawData[rawData.length - 1];
    let capital = parseFloat(capitalInput.value) || 1000000;
    const optionType = optionTypeSelect.value;
    const optionCycle = optionCycleSelect.value;
    const strikeRule = strikeRuleSelect.value;
    const portfolioMode = portfolioModeSelect.value;
    const capitalMode = capitalModeSelect.value;
    const optionContracts = Math.max(1, parseInt(optionContractsInput.value) || 1);
    const multiplier = optionType === 'taiex' ? 50 : 2000;
    const S_underlying = optionType === 'taiex' ? row.taiex : row.tsmc;

    if (capitalMode === 'auto-solve') {
        const todayCapital = solveRequiredCapital(row, optionType, optionCycle, strikeRule, portfolioMode);
        capital = todayCapital;
        const todayHint = document.getElementById('today-capital-hint');
        if (todayHint) { todayHint.textContent = `📅 今日建倉建議資金：${todayCapital.toLocaleString()} TWD`; todayHint.style.display = 'block'; }
    } else {
        const todayHint = document.getElementById('today-capital-hint');
        if (todayHint) todayHint.style.display = 'none';
    }

    latestTaiexSpan.textContent = Math.round(row.taiex).toLocaleString();
    latestTsmcSpan.textContent = row.tsmc.toFixed(1);

    let rawOptInfo, delta = 0.20;
    if (strikeRule === 'CUSTOM_OTM') {
        const customOtmPct = parseFloat(customOtmValueInput.value) || 0;
        rawOptInfo = getCustomOtmOption(row, optionType, optionCycle, customOtmPct);
        delta = rawOptInfo.delta;
    } else {
        rawOptInfo = row.options[optionType][optionCycle][strikeRule];
        delta = estimateDelta(strikeRule);
    }

    // 校準真實台指選 Call 波動率偏態後的理論參考點數，並支援「券商 APP 實際報價換算器」覆寫
    const calibratedPrem = getCalibratedCallPremium(row, optionType, optionCycle, rawOptInfo.strike, rawOptInfo.premium);
    const actualStrikeEl = document.getElementById('actual-strike-input');
    const actualPremEl = document.getElementById('actual-premium-input');
    if (actualStrikeEl) actualStrikeEl.placeholder = String(rawOptInfo.strike);
    if (actualPremEl) actualPremEl.placeholder = String(calibratedPrem);

    const userStrikeVal = actualStrikeEl && actualStrikeEl.value.trim() !== '' ? parseFloat(actualStrikeEl.value) : null;
    const userPremVal = actualPremEl && actualPremEl.value.trim() !== '' ? parseFloat(actualPremEl.value) : null;

    const optInfo = {
        strike: (userStrikeVal && userStrikeVal > 0) ? userStrikeVal : rawOptInfo.strike,
        premium: (userPremVal && userPremVal > 0) ? userPremVal : calibratedPrem,
        isCustomActual: Boolean((userStrikeVal && userStrikeVal > 0) || (userPremVal && userPremVal > 0)),
        rawTheoreticalPremium: rawOptInfo.premium,
        calibratedPremium: calibratedPrem
    };

    const activeExpiryStr = optionCycle === 'weekly'
        ? (row.expiry_date_weekly || getNextWeeklyExpiryDate(row.date))
        : (row.expiry_date_monthly || getNextMonthlyExpiryDate(row.date));
    const curContract = getTaifexContractCodeByExpiry(activeExpiryStr, optionCycle);
    const nextContract = getTaifexContractCodeByExpiry(getNextPeriodExpiryStr(activeExpiryStr), 'weekly');
    const weeklyPutContract = getTaifexContractCodeByExpiry(row.expiry_date_weekly || getNextWeeklyExpiryDate(row.date), 'weekly');

    adviceStrike.textContent = `${optInfo.strike} Call (${optionType === 'taiex' ? '台指' : '台積電'}) 【合約：${curContract.badgeText}】(賣出 ${optionContracts} 口)`;
    const totalPremTwd = Math.round(optInfo.premium * multiplier * optionContracts);
    const sourceBadge = optInfo.isCustomActual
        ? `<span style="font-size:0.74rem; color:var(--secondary); background:rgba(6,182,212,0.15); padding:2px 6px; border-radius:4px; margin-left:6px;">📱 已套用 APP 實盤輸入值</span>`
        : `<span style="font-size:0.74rem; color:var(--text-muted); margin-left:6px;">(實盤偏態校準估計；原始HV公式值 ${optInfo.rawTheoreticalPremium} 點)</span>`;
    let premHtml = `<strong>${optInfo.premium} 點</strong> (~${totalPremTwd.toLocaleString()} TWD) ${sourceBadge}`;
    if (optInfo.premium < 15) {
        const sweetRaw = row.options[optionType][optionCycle]['OTM_5'] || getCustomOtmOption(row, optionType, optionCycle, 4.5);
        const sweetCal = getCalibratedCallPremium(row, optionType, optionCycle, sweetRaw.strike, sweetRaw.premium);
        const sweetTwd = Math.round(sweetCal * multiplier * optionContracts);
        premHtml += `<div style="margin-top:4px; font-size:0.78rem; color:var(--warning); background:rgba(245,158,11,0.1); border-left:3px solid var(--warning); padding:4px 8px; border-radius:3px;">
            💡 <strong>收租效率優化建議：</strong>目前單口僅 <strong>${optInfo.premium} 點</strong>，保證金報酬率偏低。建議在 APP 報價表往內挑 <strong>30~60 點</strong> 的履約價（或改選 <strong>OTM 5% 履約價 ${sweetRaw.strike}</strong>，約 <strong>${sweetCal} 點 / ~${sweetTwd.toLocaleString()} TWD</strong>）！
        </div>`;
    }
    advicePremium.innerHTML = premHtml;

    // 動態更新「選擇權停利與防穿價轉倉機制」實戰操作說明 (含今日精確點位、期交所合法跳動點與合約代號對照)
    const rollDefenseMode = rollDefenseModeSelect ? rollDefenseModeSelect.value : 'smart_both';
    const rollDefenseDescEl = document.getElementById('roll-defense-desc');
    const adviceRollSopEl = document.getElementById('advice-roll-sop');
    const tpTargetPts = roundToTaifexOptionTick(optInfo.premium * 0.15);
    const touchTriggerPrice = optionType === 'taiex' ? Math.round(optInfo.strike * 0.998) : +(optInfo.strike * 0.998).toFixed(1);
    const rollStep = optionType === 'taiex' ? 300 : 20;
    const nextRollStrike = optInfo.strike + rollStep;
    const undLabel = optionType === 'taiex' ? '加權指數' : '台積電';

    let rollDescHtml = '';
    let rollSopHtml = '';
    if (rollDefenseMode === 'smart_both') {
        const tpRuleText = optInfo.premium >= 15
            ? `建倉賣出 <strong>[${curContract.shortCode}] ${optInfo.strike} Call</strong> (收 <strong>${optInfo.premium} 點</strong>) 後，立即在券商 APP 掛「<strong style="color:var(--success);">買進平倉限價單 ${tpTargetPts} 點</strong> (殘值 15%)」。成交即入袋 85% 獲利並釋放保證金，空手至原結算日(${curContract.md} 週三)再賣新倉。`
            : `目前 <strong>[${curContract.shortCode}] ${optInfo.strike} Call</strong> 初始權利金 <strong>${optInfo.premium} 點</strong> (&lt;15點)，不掛提前停利單，直接抱到 ${curContract.md}(週三) 結算自動歸零以省下平倉手續費。`;
        rollDescHtml = `
            <div style="color:var(--text-main); font-weight:600; margin-bottom:4px;">📋 【實戰推薦：85% 提前停利 + 觸價轉倉】操作 SOP（本週期合約：<span style="color:var(--secondary);">${curContract.badgeText}</span>）：</div>
            <div><strong>① 提前停利掛單：</strong>${tpRuleText}</div>
            <div style="margin-top:4px;"><strong>② 防穿價向上轉倉 (Roll Up)：</strong>設定${undLabel}觸價通知 <strong style="color:var(--warning);">${touchTriggerPrice.toLocaleString()}</strong> (履約價 ×99.8%)。一旦急漲觸及，盤中立即「<strong>買回平倉 [${curContract.shortCode}] ${optInfo.strike} Call</strong>」，並同步「<strong style="color:var(--primary);">向上賣出 ${nextRollStrike} Call</strong>」(若距結算 ≤2 天則直接改賣下週 <strong>[${nextContract.shortCode}]</strong> 合約)。</div>
        `;
        rollSopHtml = `
            <div style="font-size:0.82rem; line-height:1.5; background:rgba(16,185,129,0.08); border-left:3px solid var(--success); padding:5px 8px; border-radius:3px;">
                🎯 <strong>停利掛單 (${curContract.shortCode})：</strong>${optInfo.premium >= 15 ? `賣出後直接預掛 <strong style="color:var(--success);">買進平倉 ${tpTargetPts} 點</strong> (賺 85% 釋放保證金)` : `點數偏小 (&lt;15點)，免掛停利單抱到 ${curContract.md} 結算歸零`}<br>
                🛡️ <strong>防穿價轉倉：</strong>${undLabel}觸及 <strong style="color:var(--warning);">${touchTriggerPrice.toLocaleString()}</strong> 時，平倉 [${curContract.shortCode}] ${optInfo.strike} Call 並向上轉賣 <strong style="color:var(--primary);">${nextRollStrike} Call</strong> (近結算改賣下週 <strong>${nextContract.shortCode}</strong>)
            </div>
        `;
    } else if (rollDefenseMode === 'take_profit') {
        const tpRuleText = optInfo.premium >= 15
            ? `建倉賣出 <strong>[${curContract.shortCode}] ${optInfo.strike} Call</strong> (收 <strong>${optInfo.premium} 點</strong>) 後，立即預掛「<strong style="color:var(--success);">買進平倉限價單 ${tpTargetPts} 點</strong>」。成交即鎖定 85% 獲利並釋放約 18~20 萬保證金，休息至 ${curContract.md}(週三) 結算後再賣下一期 (${nextContract.shortCode})。`
            : `目前初始權利金 <strong>${optInfo.premium} 點</strong> (&lt;15點)，無需提前停利，抱到 ${curContract.md}(週三) 結算自動歸零即可。`;
        rollDescHtml = `
            <div style="color:var(--text-main); font-weight:600; margin-bottom:4px;">📋 【僅啟用 85% 提前停利】實戰操作 SOP（合約：<span style="color:var(--secondary);">${curContract.badgeText}</span>）：</div>
            <div><strong>① 提前停利掛單：</strong>${tpRuleText}</div>
            <div style="margin-top:4px;"><strong>② 上漲處理：</strong>不做盤中轉倉；若大盤大漲超過 <strong>${optInfo.strike}</strong>，直接憑藉底下 100% 多單覆蓋抱到 ${curContract.md} 結算日現金交割。</div>
        `;
        rollSopHtml = `
            <div style="font-size:0.82rem; line-height:1.5; background:rgba(16,185,129,0.08); border-left:3px solid var(--success); padding:5px 8px; border-radius:3px;">
                🎯 <strong>停利掛單 (${curContract.shortCode})：</strong>${optInfo.premium >= 15 ? `預掛 <strong style="color:var(--success);">買進平倉 ${tpTargetPts} 點</strong> (獲利 85% 提前釋放保證金)` : `點數 &lt;15 點免掛單，抱到 ${curContract.md} 結算`} ｜ 不做中途轉倉
            </div>
        `;
    } else if (rollDefenseMode === 'roll_up') {
        rollDescHtml = `
            <div style="color:var(--text-main); font-weight:600; margin-bottom:4px;">📋 【僅啟用防穿價向上轉倉】實戰操作 SOP（合約：<span style="color:var(--secondary);">${curContract.badgeText}</span>）：</div>
            <div><strong>① 平常抱到結算：</strong>賣出 <strong>[${curContract.shortCode}] ${optInfo.strike} Call</strong> 後不掛提前停利單，若未觸價則抱到 ${curContract.md}(週三) 13:30 結算歸零（賺取 100% 權利金並省平倉手續費）。</div>
            <div style="margin-top:4px;"><strong>② 防穿價向上轉倉 (Roll Up)：</strong>設定${undLabel}觸價通知 <strong style="color:var(--warning);">${touchTriggerPrice.toLocaleString()}</strong>。一旦盤中急漲摸到該價位，立即「<strong>買回平倉 [${curContract.shortCode}] ${optInfo.strike} Call</strong>」並同步「<strong style="color:var(--primary);">向上轉賣 ${nextRollStrike} Call</strong>」。</div>
        `;
        rollSopHtml = `
            <div style="font-size:0.82rem; line-height:1.5; background:rgba(245,158,11,0.08); border-left:3px solid var(--warning); padding:5px 8px; border-radius:3px;">
                🛡️ <strong>防穿價轉倉 (${curContract.shortCode})：</strong>${undLabel}觸及 <strong style="color:var(--warning);">${touchTriggerPrice.toLocaleString()}</strong> 時，買回 ${optInfo.strike} Call 並轉賣 <strong style="color:var(--primary);">${nextRollStrike} Call</strong>（未觸價則抱到 ${curContract.md} 結算）
            </div>
        `;
    } else {
        rollDescHtml = `
            <div style="color:var(--text-main); font-weight:600; margin-bottom:4px;">📋 【傳統抱到結算日】實戰操作 SOP（合約：<span style="color:var(--secondary);">${curContract.badgeText}</span>）：</div>
            <div><strong>① 免盯盤被動結算：</strong>賣出新倉 <strong>[${curContract.shortCode}] ${optInfo.strike} Call</strong> (收 <strong>${optInfo.premium} 點</strong>) 後，盤中不掛停利單、也不做中途轉倉。</div>
            <div style="margin-top:4px;"><strong>② 週三 13:30 換倉：</strong>直接放到 ${curContract.md}(週三) 結算日依結算價自動交割，結算後再賣出下一週期 (${nextContract.shortCode}) Call 合約。</div>
        `;
        rollSopHtml = `<span style="color:var(--text-muted); font-size:0.82rem;">傳統抱到 ${curContract.md}(週三) 13:30 自動結算（合約：<strong>${curContract.shortCode}</strong>）</span>`;
    }
    if (rollDefenseDescEl) rollDefenseDescEl.innerHTML = rollDescHtml;
    if (adviceRollSopEl) adviceRollSopEl.innerHTML = rollSopHtml;

    // Check MA5 vs MA21 signal for hedge recommendation
    const lastIdx = rawData.length - 1;
    const ma5 = getTaiexMA(rawData, lastIdx, 5);
    const ma21 = getTaiexMA(rawData, lastIdx, 21);
    const hedgeMode = hedgeModeSelect ? hedgeModeSelect.value : 'b5';
    const hedgeModeDescEl = document.getElementById('hedge-mode-desc');
    if (hedgeModeDescEl && ma5 !== null && ma21 !== null) {
        const isBearNow = ma5 < ma21;
        const putK2 = Math.round(row.taiex * 0.98 / 100) * 100;
        const putK0 = Math.round(row.taiex / 100) * 100;
        const statusTag = isBearNow
            ? `<span style="color:var(--danger); font-weight:700;">[目前 MA5 ${Math.round(ma5)} &lt; MA21 ${Math.round(ma21)}：已觸發避險]</span>`
            : `<span style="color:var(--success); font-weight:700;">[目前 MA5 ${Math.round(ma5)} &gt; MA21 ${Math.round(ma21)}：多頭免避險]</span>`;
        if (hedgeMode === 'b5') {
            hedgeModeDescEl.innerHTML = `
                <div style="color:var(--text-main); font-weight:600; margin-bottom:4px;">📋 【B5 買進價外 2% Put】實戰操作 SOP ${statusTag}：</div>
                <div><strong>① 進場條件：</strong>每日收盤若大盤 <strong>MA5 &lt; MA21</strong>，買進 <strong>${optionContracts} 口</strong> 台指周選價外 2% Put（今日對照：<strong style="color:var(--danger);">[${weeklyPutContract.shortCode}] ${putK2} Put</strong>，${weeklyPutContract.md}結算）。</div>
                <div style="margin-top:4px;"><strong>② 出場條件：</strong>週三結算若仍 MA5 &lt; MA21 則轉倉續買下週 Put；一旦任一日收盤 <strong>MA5 &gt; MA21</strong> 站回多頭，立即將 Put 賣出平倉回收殘值。</div>
            `;
        } else if (hedgeMode === 'b3') {
            hedgeModeDescEl.innerHTML = `
                <div style="color:var(--text-main); font-weight:600; margin-bottom:4px;">📋 【B3 買進價平 ATM Put】實戰操作 SOP ${statusTag}：</div>
                <div><strong>① 進場條件：</strong>當收盤 <strong>MA5 &lt; MA21</strong> 翻空時，買進 <strong>${optionContracts} 口</strong> 台指周選價平 Put（今日對照：<strong style="color:var(--danger);">[${weeklyPutContract.shortCode}] ${putK0} Put</strong>，${weeklyPutContract.md}結算），提供約 -0.50 Delta 強效保護。</div>
                <div style="margin-top:4px;"><strong>② 出場條件：</strong>一旦收盤 <strong>MA5 &gt; MA21</strong> 重新翻多，立即將 Put 賣出平倉回收殘值。</div>
            `;
        } else if (hedgeMode === 'a1') {
            hedgeModeDescEl.innerHTML = `
                <div style="color:var(--text-main); font-weight:600; margin-bottom:4px;">📋 【A1 多單減半避險】實戰操作 SOP ${statusTag}：</div>
                <div><strong>① 減碼條件：</strong>不買 Put（免付權利金）。當大盤 <strong>MA5 &lt; MA21</strong> 翻空時，直接將手中期貨與現股多單<strong>平倉賣出一半（降為 50% 部位、保留 50% 現金）</strong>。</div>
                <div style="margin-top:4px;"><strong>② 加碼條件：</strong>當大盤 <strong>MA5 &gt; MA21</strong> 重新站回多頭時，將多單買回恢復 100% 正常水位。</div>
            `;
        } else {
            hedgeModeDescEl.innerHTML = `
                <div style="color:var(--text-main); font-weight:600; margin-bottom:4px;">📋 【不啟用均線避險】實戰操作 SOP：</div>
                <div>不論大盤均線多空，底層多單（期貨/ETF）維持 100% 長抱不減碼、也不買進 Put，純靠每週賣出 Call 收取的權利金緩衝波動。</div>
            `;
        }
    }
    
    if (adviceHedgeStatus) {
        if (ma5 !== null && ma21 !== null) {
            const isBear = ma5 < ma21;
            const diffPct = ((ma5 - ma21) / ma21 * 100).toFixed(2);
            if (isBear) {
                if (hedgeMode === 'b5') {
                    const putK = Math.round(row.taiex * 0.98 / 100) * 100;
                    adviceHedgeStatus.innerHTML = `<span style="color:var(--danger); font-weight:700;">⚠️ 翻空警示 (MA5 ${Math.round(ma5)} &lt; MA21 ${Math.round(ma21)})</span>
                        <div style="margin-top:3px; font-size:0.82rem; color:var(--text); background:rgba(239,68,68,0.1); border-left:3px solid var(--danger); padding:4px 8px; border-radius:3px;">
                            🛡️ <strong>觸發 B5 避險：</strong>建議買進台指周選 <strong>[${weeklyPutContract.shortCode}] ${putK} Put</strong> (價外 2%｜${weeklyPutContract.md}結算)，口數 <strong>${optionContracts}</strong> 口對沖多單風險。
                        </div>`;
                } else if (hedgeMode === 'b3') {
                    const putK = Math.round(row.taiex / 100) * 100;
                    adviceHedgeStatus.innerHTML = `<span style="color:var(--danger); font-weight:700;">⚠️ 翻空警示 (MA5 ${Math.round(ma5)} &lt; MA21 ${Math.round(ma21)})</span>
                        <div style="margin-top:3px; font-size:0.82rem; color:var(--text); background:rgba(239,68,68,0.1); border-left:3px solid var(--danger); padding:4px 8px; border-radius:3px;">
                            🛡️ <strong>觸發 B3 避險：</strong>建議買進台指周選 <strong>[${weeklyPutContract.shortCode}] ${putK} Put</strong> (價平 ATM｜${weeklyPutContract.md}結算)，口數 <strong>${optionContracts}</strong> 口。
                        </div>`;
                } else if (hedgeMode === 'a1') {
                    adviceHedgeStatus.innerHTML = `<span style="color:var(--danger); font-weight:700;">⚠️ 翻空警示 (MA5 ${Math.round(ma5)} &lt; MA21 ${Math.round(ma21)})</span>
                        <div style="margin-top:3px; font-size:0.82rem; color:var(--text); background:rgba(239,68,68,0.1); border-left:3px solid var(--danger); padding:4px 8px; border-radius:3px;">
                            🛡️ <strong>觸發 A1 避險：</strong>建議將下方多單配置比例降為 50%，保留 50% 現金。
                        </div>`;
                } else {
                    adviceHedgeStatus.innerHTML = `<span style="color:var(--text-muted);">MA5 ${Math.round(ma5)} &lt; MA21 ${Math.round(ma21)} (未啟用避險)</span>`;
                }
            } else {
                adviceHedgeStatus.innerHTML = `<span style="color:var(--success); font-weight:600;">✅ 多頭走勢 (MA5 ${Math.round(ma5)} &gt; MA21 ${Math.round(ma21)}，+${diffPct}%)</span>
                    <span style="font-size:0.8rem; color:var(--text-muted); margin-left:6px;">無需買進 Put，維持正常 Covered Call 多頭配置。</span>`;
            }
        } else {
            adviceHedgeStatus.textContent = '數據計算中...';
        }
    }

    // Build target allocations via Smart Residual Exposure Sizing
    const targetExposure = portfolioMode === 'delta-neutral'
        ? optionContracts * (1.0 + delta) * multiplier * S_underlying
        : capital;

    const rawEntries = computeSmartAssetQuantities(row, optionType, targetExposure, portfolioMode === 'delta-neutral');
    const totalFuturesMargin = rawEntries.filter(e => e.asset.type === 'futures').reduce((s, e) => s + e.margin, 0);
    const rawSpotCostSum = rawEntries.filter(e => e.asset.type !== 'futures').reduce((s, e) => s + e.rawCost, 0);

    const optionMaintMargin = optionContracts * multiplier * (optInfo.premium + S_underlying * 0.115);
    const totalMaintMargin = totalFuturesMargin + optionMaintMargin;
    const targetRatio = parseFloat(targetMarginRatioInput.value) || 200;

    const minSafeRatio = capitalMode === 'auto-solve' ? (targetRatio / 100.0) : 1.80;
    const minMarginCashRequired = totalMaintMargin > 0 ? (totalMaintMargin * minSafeRatio) : 0;
    const maxSpotBudget = totalMaintMargin > 0 ? Math.max(0, capital - minMarginCashRequired) : capital;
    const spotScale = (totalMaintMargin > 0 && rawSpotCostSum > maxSpotBudget && rawSpotCostSum > 0)
        ? (maxSpotBudget / rawSpotCostSum)
        : 1.0;

    // Render advice table
    adviceAssetsTbody.innerHTML = '';
    let totalSpotCost = 0;
    let totalEffectiveExposure = 0;
    const callExposure = optionContracts * multiplier * S_underlying;

    rawEntries.forEach(entry => {
        const { asset, weightPct, price, beta } = entry;
        let qtyText, valText, betaText, weightText;
        if (asset.type === 'futures') {
            totalEffectiveExposure += entry.effectiveExposure;
            qtyText = `${entry.qty} 口`;
            valText = `保證金 ${Math.round(entry.margin).toLocaleString()}`;
            betaText = `β 1.00`;
            weightText = `${weightPct.toFixed(0)}%`;
        } else {
            const finalQty = Math.round(entry.rawQty * spotScale);
            const cost = Math.round(finalQty * price);
            totalSpotCost += cost;
            totalEffectiveExposure += finalQty * price * beta;
            qtyText = `${finalQty.toLocaleString()} 股`;
            valText = `${cost.toLocaleString()} TWD`;
            betaText = `β ${beta.toFixed(2)}`;
            weightText = spotScale < 0.98
                ? `${weightPct.toFixed(0)}% <span title="為保護期貨維持率 ≥ 180%，已自動限縮現股資金佔用" style="color:var(--warning); font-size:0.7rem;">(🛡️保維持率)</span>`
                : `${weightPct.toFixed(0)}%`;
        }
        const bc = asset.type === 'futures' ? 'futures' : asset.type === 'etf' ? 'etf' : 'stock';
        const bl = asset.type === 'futures' ? '期貨' : asset.type === 'etf' ? 'ETF' : '股票';
        const betaColor = beta < 0.7 ? 'var(--warning)' : beta < 0.9 ? 'var(--accent)' : 'var(--success)';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${asset.symbol} <span class="asset-badge ${bc}" style="font-size:0.63rem">${bl}</span> ${asset.name.substring(0, 10)}</td>
            <td>${weightText}</td>
            <td class="bold-val">${qtyText}</td>
            <td style="color:${asset.type === 'futures' ? 'var(--text-muted)' : 'inherit'}">${valText}</td>
            <td style="font-size:0.8rem; color:${betaColor}; font-weight:600;">${betaText}</td>`;
        adviceAssetsTbody.appendChild(tr);
    });

    // Beta-adjusted coverage ratio row
    const coverageRatio = callExposure > 0 ? (totalEffectiveExposure / callExposure) * 100 : 0;
    const coverageColor = coverageRatio < 80 ? 'var(--danger)' : coverageRatio < 100 ? 'var(--warning)' : 'var(--success)';
    const coverageIcon = coverageRatio < 80 ? '🔴' : coverageRatio < 100 ? '⚠️' : '✅';
    const coverageTr = document.createElement('tr');
    coverageTr.style.cssText = 'background: rgba(0,0,0,0.15); border-top: 1px solid var(--border);';
    coverageTr.innerHTML = `
        <td colspan="4" style="font-size:0.78rem; color:var(--text-muted); padding:5px 8px;">
            ${coverageIcon} Beta 加權有效覆蓋率：
            <strong style="color:${coverageColor}; font-size:0.9rem;">${coverageRatio.toFixed(1)}%</strong>
            <span style="color:var(--text-muted); margin-left:6px;">(多單有效曝險 ${Math.round(totalEffectiveExposure).toLocaleString()} / Call 名義曝險 ${Math.round(callExposure).toLocaleString()} TWD)</span>
        </td>
        <td></td>`;
    adviceAssetsTbody.appendChild(coverageTr);

    // 修正：扣除實際花費的現股成本 (totalSpotCost)，而非未除 Beta 的名義曝險
    const cashValue = Math.max(0, capital - totalSpotCost);
    const targetMarginAmount = Math.round(totalMaintMargin * targetRatio / 100);

    if (totalMaintMargin > 0) {
        const ratio = (cashValue / totalMaintMargin) * 100;
        adviceMarginRatio.textContent = `${ratio.toFixed(0)}%`;
        adviceMarginRatio.style.color = ratio < 130 ? 'var(--danger)' : ratio < 175 ? 'var(--warning)' : 'var(--success)';
    } else {
        adviceMarginRatio.textContent = '--%';
        adviceMarginRatio.style.color = 'var(--text-muted)';
    }

    const avTM = document.getElementById('advice-val-total-margin');
    const avTgtM = document.getElementById('advice-val-target-margin');
    if (avTM) avTM.textContent = `${Math.round(totalMaintMargin).toLocaleString()} TWD`;
    if (avTgtM) avTgtM.textContent = `${targetMarginAmount.toLocaleString()} TWD`;

    // Clear summary boxes
    const elSpot = document.getElementById('advice-summary-spot');
    const elMargin = document.getElementById('advice-summary-margin');
    if (elSpot) elSpot.textContent = `${totalSpotCost.toLocaleString()} TWD`;
    if (elMargin) elMargin.textContent = `${Math.max(targetMarginAmount, Math.round(cashValue)).toLocaleString()} TWD`;

    const aqo = document.getElementById('advice-qty-options');
    if (aqo) aqo.textContent = `${optionContracts} 口`;
}

// ─────────────────────────────────────────────
// BACKTEST CORE (WITH REALISTIC FRICTION, MONTHLY FUTURES ROLLOVER & SMART OPTION DEFENSE)
// ─────────────────────────────────────────────
function runBacktest() {
    if (rawData.length === 0) return;
    if (getTotalWeight() !== 100) return;

    const startIdx = parseInt(startSelect.value);
    const endIdx = parseInt(endSelect.value);
    if (startIdx >= endIdx) { alert("開始日期必須早於結束日期！"); return; }

    const optionType = optionTypeSelect.value;
    const optionCycle = optionCycleSelect.value;
    const strikeRule = strikeRuleSelect.value;
    const portfolioMode = portfolioModeSelect.value;
    const capitalMode = capitalModeSelect.value;

    let initialCapital = parseFloat(capitalInput.value) || 1000000;
    if (capitalMode === 'auto-solve') {
        initialCapital = solveRequiredCapital(rawData[startIdx], optionType, optionCycle, strikeRule, portfolioMode);
        capitalInput.value = initialCapital;
    }
    const optionContracts = Math.max(1, parseInt(optionContractsInput.value) || 1);
    const hedgeMode = hedgeModeSelect ? hedgeModeSelect.value : 'b5';
    const rollDefenseMode = rollDefenseModeSelect ? rollDefenseModeSelect.value : 'smart_both';

    const positions = selectedAssets.map(() => ({ qty: 0, entryPrice: 0 }));
    let cash = initialCapital;
    let activeOption = null;
    let optionCooldownUntil = null;
    let activePut = null;
    let currentScaleMultiplier = 1.0;
    let putNetProfitTotal = 0;
    let totalFrictionCost = 0;
    let earlyTakeProfitCount = 0, rollUpCount = 0, futuresMonthlyRollCount = 0;
    const strategyEquity = [], taiexEquity = [], tsmcEquity = [], dates = [];
    let marginCalls = 0, liquidations = 0, isBankrupt = false;
    let optionCyclesCount = 0, optionWinsCount = 0, totalPremiumIncome = 0, totalCallSettlement = 0;

    const initialTaiex = rawData[startIdx].taiex;
    const multiplier = optionType === 'taiex' ? 50 : 2000;
    let nextMonthlyFuturesExpiry = getNextMonthlyExpiryDate(rawData[startIdx].date);

    // Friction Helpers (手續費、稅、期貨換月滑價、選擇權價差損耗)
    const calcSpotFriction = (tradeVal, isSell, isEtf) => {
        if (tradeVal <= 0) return 0;
        const comm = Math.max(20, tradeVal * 0.001425 * 0.6); // 6折手續費
        const tax = isSell ? tradeVal * (isEtf ? 0.001 : 0.003) : 0; // ETF證交稅0.1%, 股票0.3%
        return comm + tax;
    };
    const calcFuturesFriction = (notionalVal, qty, isRollover = false) => {
        if (qty <= 0 || notionalVal <= 0) return 0;
        const legs = isRollover ? 2 : 1; // 換月轉倉需平倉近月+建倉遠月(雙邊)
        const comm = qty * 40 * legs;
        const tax = notionalVal * 0.00002 * legs; // 期交稅十萬分之2
        const slippage = notionalVal * (isRollover ? 0.00035 : 0.00015); // 換月逆價差與買賣價差滑價
        return comm + tax + slippage;
    };
    const calcOptionFriction = (premiumPts, mult, contracts, includeSlip = true) => {
        if (contracts <= 0) return 0;
        const comm = contracts * 25;
        const tax = Math.max(0, premiumPts) * mult * contracts * 0.001; // 選擇權期交稅千分之1
        const slip = includeSlip ? (0.5 * mult * contracts) : 0; // 買賣價差滑價約0.5點
        return comm + tax + slip;
    };

    for (let i = startIdx; i <= endIdx; i++) {
        const row = rawData[i];
        const dateStr = row.date;
        dates.push(dateStr);
        const price_taiex = row.taiex;
        const price_tsmc = row.tsmc;
        const currentUnderlyingPrice = optionType === 'taiex' ? price_taiex : price_tsmc;

        if (isBankrupt) {
            positions.forEach(p => { p.qty = 0; });
            cash = 0; activeOption = null;
            strategyEquity.push(0);
            taiexEquity.push(initialCapital * (price_taiex / initialTaiex));
            let portfolioPnLSum = 0;
            selectedAssets.forEach((asset) => {
                const startPrice = getAssetPrice(asset, rawData[startIdx]) || 1;
                const curPrice = getAssetPrice(asset, row) || getAssetPrice(asset, rawData[Math.max(0, i - 1)]) || startPrice;
                const assetReturn = (curPrice - startPrice) / startPrice;
                portfolioPnLSum += assetReturn * (asset.weight / 100.0);
            });
            tsmcEquity.push(initialCapital * (1.0 + portfolioPnLSum));
            continue;
        }

        // 1. Normal Option Expiration / End-of-Backtest Settlement
        if (activeOption && (dateStr >= activeOption.expiry_date || i === endIdx)) {
            let buybackPts = 0;
            if (dateStr >= activeOption.expiry_date) {
                buybackPts = Math.max(0, currentUnderlyingPrice - activeOption.strike);
            } else {
                const T = Math.max(0, (new Date(activeOption.expiry_date) - new Date(dateStr)) / (1000 * 60 * 60 * 24)) / 365.0;
                const vol = optionType === 'taiex' ? row.taiex_vol : row.tsmc_vol;
                buybackPts = blackScholesCall(currentUnderlyingPrice, activeOption.strike, T, 0.015, vol);
            }
            const buyback = buybackPts * multiplier * optionContracts;
            const settleFee = buybackPts > 0 ? calcOptionFriction(buybackPts, multiplier, optionContracts, i !== endIdx) : 0;
            cash -= (buyback + settleFee);
            totalCallSettlement += buyback;
            totalFrictionCost += settleFee;
            const cyclePnL = activeOption.premium * multiplier * optionContracts - buyback - settleFee;
            if (cyclePnL > 0) optionWinsCount++;
            optionCyclesCount++;
            activeOption = null;
            optionCooldownUntil = null;
        }

        // 1.05 Mid-Cycle Smart Option Management (85% Early Take-Profit & Defensive Roll Up)
        if (activeOption && dateStr < activeOption.expiry_date && i < endIdx) {
            const remDays = Math.max(0.1, (new Date(activeOption.expiry_date) - new Date(dateStr)) / (1000 * 60 * 60 * 24));
            const T = remDays / 365.0;
            const vol = optionType === 'taiex' ? row.taiex_vol : row.tsmc_vol;
            const curCallPts = blackScholesCall(currentUnderlyingPrice, activeOption.strike, T, 0.015, vol);

            // (A) 85% Early Take-Profit (當初始權利金 >= 15 點且殘值跌破 15% 即獲利達 85% 時提前買回，釋放保證金；小點數遠價外則直接放到結算歸零免手續費)
            const canTakeProfit = (rollDefenseMode === 'smart_both' || rollDefenseMode === 'take_profit');
            if (canTakeProfit && activeOption.premium >= 15.0 && curCallPts <= activeOption.premium * 0.15) {
                const buyback = curCallPts * multiplier * optionContracts;
                const closeFee = calcOptionFriction(curCallPts, multiplier, optionContracts, true);
                cash -= (buyback + closeFee);
                totalCallSettlement += buyback;
                totalFrictionCost += closeFee;
                optionWinsCount++;
                optionCyclesCount++;
                earlyTakeProfitCount++;
                optionCooldownUntil = activeOption.expiry_date; // 等原定結算日再賣下一期，跌市期間完全釋放保證金
                activeOption = null;
            }
            // (B) Defensive Roll Up & Out (大盤急漲觸碰履約價時，提前平倉並向上轉倉拉高天花板)
            else if ((rollDefenseMode === 'smart_both' || rollDefenseMode === 'roll_up') && !activeOption.hasRolledUp) {
                if (currentUnderlyingPrice >= activeOption.strike * 0.998) {
                    const buyback = curCallPts * multiplier * optionContracts;
                    const closeFee = calcOptionFriction(curCallPts, multiplier, optionContracts, true);
                    cash -= (buyback + closeFee);
                    totalCallSettlement += buyback;
                    totalFrictionCost += closeFee;
                    if (activeOption.premium * multiplier * optionContracts - buyback - closeFee > 0) optionWinsCount++;
                    optionCyclesCount++;
                    rollUpCount++;

                    // Roll to higher strike (and next cycle expiry if <= 2 days left)
                    let newExpiry = activeOption.expiry_date;
                    if (remDays <= 2.5) {
                        newExpiry = optionCycle === 'weekly' ? getNextWeeklyExpiryDate(activeOption.expiry_date) : getNextMonthlyExpiryDate(activeOption.expiry_date);
                    }
                    let newOptInfo;
                    if (strikeRule === 'CUSTOM_OTM') {
                        const customOtmPct = parseFloat(customOtmValueInput.value) || 0;
                        newOptInfo = getCustomOtmOption(row, optionType, optionCycle, customOtmPct);
                    } else {
                        newOptInfo = row.options[optionType][optionCycle][strikeRule];
                    }
                    const minStep = optionType === 'taiex' ? 300 : 20;
                    const newStrike = Math.max(newOptInfo.strike, activeOption.strike + minStep);
                    const newT = Math.max(1.0, (new Date(newExpiry) - new Date(dateStr)) / (1000 * 60 * 60 * 24)) / 365.0;
                    const newPrem = Math.max(blackScholesCall(currentUnderlyingPrice, newStrike, newT, 0.015, vol), optionCycle === 'weekly' ? 8.0 : 15.0);
                    const openFee = calcOptionFriction(newPrem, multiplier, optionContracts, true);
                    cash += (newPrem * multiplier * optionContracts - openFee);
                    totalPremiumIncome += newPrem * multiplier * optionContracts;
                    totalFrictionCost += openFee;
                    activeOption = {
                        strike: newStrike,
                        premium: newPrem,
                        expiry_date: newExpiry,
                        hasRolledUp: true
                    };
                }
            }
        }

        // Check MA5 vs MA21 signal for hedging (using i - 1 to prevent look-ahead bias)
        let isBearSignal = false;
        if (i > startIdx) {
            const m5 = getTaiexMA(rawData, i - 1, 5);
            const m21 = getTaiexMA(rawData, i - 1, 21);
            if (m5 !== null && m21 !== null && m5 < m21) {
                isBearSignal = true;
            }
        }

        // 1.1 Put expiration / close-out
        if (activePut && (dateStr >= activePut.expiry_date || i === endIdx)) {
            const payoffPts = Math.max(0, activePut.strike - price_taiex);
            const payoff = payoffPts * 50 * activePut.contracts;
            const putSettleFee = payoffPts > 0 ? calcOptionFriction(payoffPts, 50, activePut.contracts, false) : 0;
            cash += (payoff - putSettleFee);
            putNetProfitTotal += (payoff - putSettleFee);
            totalFrictionCost += putSettleFee;
            activePut = null;
        }

        // 1.2 Monthly Futures Rollover (每月第三個週三結算換月，扣除雙邊轉倉滑價與期交稅)
        if (i > startIdx && dateStr >= nextMonthlyFuturesExpiry && i < endIdx) {
            let anyFuturesRolled = false;
            selectedAssets.forEach((asset, ai) => {
                const pos = positions[ai];
                const price = getAssetPrice(asset, row);
                if (asset.type === 'futures' && pos.qty > 0 && price) {
                    cash += pos.qty * asset.contractMultiplier * (price - pos.entryPrice);
                    pos.entryPrice = price;
                    const rollFee = calcFuturesFriction(pos.qty * asset.contractMultiplier * price, pos.qty, true);
                    cash -= rollFee;
                    totalFrictionCost += rollFee;
                    anyFuturesRolled = true;
                }
            });
            if (anyFuturesRolled) futuresMonthlyRollCount++;
            nextMonthlyFuturesExpiry = getNextMonthlyExpiryDate(dateStr);
        }

        // Target scale for A1 (reduce spot)
        let targetScale = (hedgeMode === 'a1' && isBearSignal) ? 0.5 : 1.0;

        // 2. Open New Short Call on Scheduled Roll Day
        const canOpenNewOption = (activeOption === null && (!optionCooldownUntil || dateStr >= optionCooldownUntil) && i < endIdx);
        let currentDelta = 0.20;
        if (strikeRule === 'CUSTOM_OTM') {
            const customOtmPct = parseFloat(customOtmValueInput.value) || 0;
            currentDelta = getCustomOtmOption(row, optionType, optionCycle, customOtmPct).delta;
        } else {
            currentDelta = estimateDelta(strikeRule);
        }

        if (canOpenNewOption) {
            let optInfo;
            if (strikeRule === 'CUSTOM_OTM') {
                const customOtmPct = parseFloat(customOtmValueInput.value) || 0;
                optInfo = getCustomOtmOption(row, optionType, optionCycle, customOtmPct);
            } else {
                optInfo = row.options[optionType][optionCycle][strikeRule];
            }
            const openFee = calcOptionFriction(optInfo.premium, multiplier, optionContracts, true);
            activeOption = {
                strike: optInfo.strike,
                premium: optInfo.premium,
                expiry_date: optionCycle === 'weekly' ? getNextWeeklyExpiryDate(dateStr) : getNextMonthlyExpiryDate(dateStr),
                hasRolledUp: false
            };
            optionCooldownUntil = null;
            cash += (activeOption.premium * multiplier * optionContracts - openFee);
            totalPremiumIncome += activeOption.premium * multiplier * optionContracts;
            totalFrictionCost += openFee;
        }

        // 2.05 Allocate / Adjust Underlying Positions (僅在初始建倉或 A1 避險比例切換時調整，現貨買進後長抱不每週洗盤)
        const needPositionAdjust = (i === startIdx || targetScale !== currentScaleMultiplier);
        if (needPositionAdjust && i < endIdx) {
            // Calculate current total equity before resizing
            let curAssetVal = 0;
            selectedAssets.forEach((asset, ai) => {
                const pos = positions[ai];
                const price = getAssetPrice(asset, row);
                if (pos.qty > 0 && price !== null) {
                    if (asset.type === 'futures') curAssetVal += pos.qty * asset.contractMultiplier * (price - pos.entryPrice);
                    else curAssetVal += pos.qty * price;
                }
            });
            const totalEquity = cash + curAssetVal;

            // (A) 使用智慧殘餘曝險分配計算期貨與現股目標數量
            let curFuturesMarginReq = 0;
            const baseTargetExp = (portfolioMode === 'delta-neutral'
                ? optionContracts * (1.0 + currentDelta) * multiplier * currentUnderlyingPrice
                : totalEquity) * targetScale;
            const smartEntries = computeSmartAssetQuantities(row, optionType, baseTargetExp, portfolioMode === 'delta-neutral');

            smartEntries.forEach(entry => {
                const { idx: ai, asset, price, qty: newQty } = entry;
                if (asset.type !== 'futures' || !price) return;
                const pos = positions[ai];
                if (pos.qty > 0) {
                    cash += pos.qty * asset.contractMultiplier * (price - pos.entryPrice);
                }
                const contractVal = price * asset.contractMultiplier;
                const finalQty = targetScale > 0 ? newQty : 0;
                const diffQty = Math.abs(finalQty - pos.qty);
                if (diffQty > 0) {
                    const fFee = calcFuturesFriction(diffQty * contractVal, diffQty, false);
                    cash -= fFee;
                    totalFrictionCost += fFee;
                }
                pos.qty = finalQty;
                pos.entryPrice = price;
                curFuturesMarginReq += finalQty * contractVal * asset.marginRate;
            });

            // (B) 配置現股/ETF 部位，啟動「維持率安全鎖」(保留至少 180% 期貨+選擇權保證金現金)
            const estOptionMargin = optionContracts * multiplier * currentUnderlyingPrice * 0.12;
            const totalReqMargin = curFuturesMarginReq + estOptionMargin;
            const maxSpotCashBudget = totalReqMargin > 0 ? Math.max(0, totalEquity - totalReqMargin * 1.80) : totalEquity * 0.95;

            const desiredSpotQtys = [];
            let rawSpotCostTotal = 0;
            smartEntries.forEach(entry => {
                const { idx: ai, asset, rawQty, rawCost } = entry;
                if (asset.type === 'futures') return;
                desiredSpotQtys[ai] = rawQty;
                rawSpotCostTotal += rawCost;
            });

            const btSpotScale = (totalReqMargin > 0 && rawSpotCostTotal > maxSpotCashBudget && rawSpotCostTotal > 0)
                ? (maxSpotCashBudget / rawSpotCostTotal)
                : 1.0;

            selectedAssets.forEach((asset, ai) => {
                if (asset.type === 'futures') return;
                const pos = positions[ai];
                const price = getAssetPrice(asset, row);
                if (!price) return;
                const newQty = Math.floor((desiredSpotQtys[ai] || 0) * btSpotScale);
                const diffShares = newQty - pos.qty;
                if (diffShares > 0) {
                    const buyVal = diffShares * price;
                    const sFee = calcSpotFriction(buyVal, false, asset.type === 'etf');
                    cash -= (buyVal + sFee);
                    totalFrictionCost += sFee;
                } else if (diffShares < 0) {
                    const sellVal = Math.abs(diffShares) * price;
                    const sFee = calcSpotFriction(sellVal, true, asset.type === 'etf');
                    cash += (sellVal - sFee);
                    totalFrictionCost += sFee;
                }
                pos.qty = newQty;
                pos.entryPrice = price;
            });
            currentScaleMultiplier = targetScale;
        }

        // 2.1 Put Hedging Overlay (B5 / B3)
        if ((hedgeMode === 'b5' || hedgeMode === 'b3') && i < endIdx) {
            if (isBearSignal && !activePut) {
                const putKRate = (hedgeMode === 'b5') ? 0.98 : 1.0;
                const putStrike = Math.round(price_taiex * putKRate / 100) * 100;
                const putExpiryDate = getNextWeeklyExpiryDate(dateStr);
                const T_put = Math.max((new Date(putExpiryDate) - new Date(dateStr)) / (1000 * 60 * 60 * 24), 0.1) / 365.0;
                const vol_taiex = row.taiex_vol || 0.20;
                const putEstPremium = Math.max(blackScholesPut(price_taiex, putStrike, T_put, 0.015, vol_taiex), 0.5);

                const putQty = optionContracts;
                const putCost = putEstPremium * 50 * putQty;
                const putFee = calcOptionFriction(putEstPremium, 50, putQty, true);
                cash -= (putCost + putFee);
                putNetProfitTotal -= (putCost + putFee);
                totalFrictionCost += putFee;
                activePut = {
                    strike: putStrike,
                    premium: putEstPremium,
                    expiry_date: putExpiryDate,
                    contracts: putQty
                };
            } else if (!isBearSignal && activePut) {
                const todayDate = new Date(dateStr);
                const expDate = new Date(activePut.expiry_date);
                const T_put = Math.max(0, (expDate - todayDate) / (1000 * 60 * 60 * 24)) / 365.0;
                const vol_taiex = row.taiex_vol || 0.20;
                const putCurVal = blackScholesPut(price_taiex, activePut.strike, T_put, 0.015, vol_taiex);
                const closeVal = putCurVal * 50 * activePut.contracts;
                const putCloseFee = calcOptionFriction(putCurVal, 50, activePut.contracts, true);
                cash += (closeVal - putCloseFee);
                putNetProfitTotal += (closeVal - putCloseFee);
                totalFrictionCost += putCloseFee;
                activePut = null;
            }
        }

        // 3. Daily MTM
        let dailyAssetValue = 0, totalFuturesMarginReq = 0;
        selectedAssets.forEach((asset, ai) => {
            const pos = positions[ai];
            const price = getAssetPrice(asset, row) || getAssetPrice(asset, rawData[Math.max(0, i - 1)]);
            if (!price) return;
            if (asset.type === 'futures') {
                dailyAssetValue += pos.qty * asset.contractMultiplier * (price - pos.entryPrice);
                totalFuturesMarginReq += pos.qty * asset.contractMultiplier * price * asset.marginRate;
            } else {
                dailyAssetValue += pos.qty * price;
            }
        });

        let optionLiability = 0;
        if (activeOption) {
            const todayDate = new Date(dateStr);
            const expiryDate = new Date(activeOption.expiry_date);
            const T = Math.max(0, (expiryDate - todayDate) / (1000 * 60 * 60 * 24)) / 365.0;
            const vol = optionType === 'taiex' ? row.taiex_vol : row.tsmc_vol;
            const currentPremium = blackScholesCall(currentUnderlyingPrice, activeOption.strike, T, 0.015, vol);
            optionLiability = currentPremium * multiplier * optionContracts;
        }

        let putAssetValue = 0;
        if (activePut) {
            const todayDate = new Date(dateStr);
            const expDate = new Date(activePut.expiry_date);
            const T_put = Math.max(0, (expDate - todayDate) / (1000 * 60 * 60 * 24)) / 365.0;
            const vol_taiex = row.taiex_vol || 0.20;
            const putCurVal = blackScholesPut(price_taiex, activePut.strike, T_put, 0.015, vol_taiex);
            putAssetValue = putCurVal * 50 * activePut.contracts;
        }

        const dailyEquity = cash + dailyAssetValue - optionLiability + putAssetValue;
        strategyEquity.push(dailyEquity);
        taiexEquity.push(initialCapital * (price_taiex / initialTaiex));
        let portfolioPnLSum = 0;
        selectedAssets.forEach((asset) => {
            const startPrice = getAssetPrice(asset, rawData[startIdx]) || 1;
            const curPrice = getAssetPrice(asset, row) || getAssetPrice(asset, rawData[Math.max(0, i - 1)]) || startPrice;
            const assetReturn = (curPrice - startPrice) / startPrice;
            portfolioPnLSum += assetReturn * (asset.weight / 100.0);
        });
        tsmcEquity.push(initialCapital * (1.0 + portfolioPnLSum));

        // 4. Margin call check (Option margin is 0 when activeOption is closed early via 85% take-profit!)
        const optionMargin = activeOption ? (optionLiability + optionContracts * multiplier * currentUnderlyingPrice * 0.115) : 0;
        const totalReqMargin = totalFuturesMarginReq + optionMargin;
        const freeCash = cash + (dailyAssetValue - selectedAssets.reduce((s, a, ai) => {
            if (a.type !== 'futures') { const p = getAssetPrice(a, row) || 0; return s + positions[ai].qty * p; }
            return s;
        }, 0));

        if (totalReqMargin > 0 && freeCash < totalReqMargin) {
            marginCalls++;
            if (freeCash < 0.25 * totalReqMargin && (positions.some(p => p.qty > 0) || activeOption)) {
                liquidations++;
                selectedAssets.forEach((asset, ai) => {
                    if (asset.type === 'futures' && positions[ai].qty > 0) {
                        const p = getAssetPrice(asset, row) || 0;
                        cash += positions[ai].qty * asset.contractMultiplier * (p - positions[ai].entryPrice);
                        positions[ai].qty = 0;
                    }
                });
                cash -= optionLiability;
                cash -= totalReqMargin * 0.05;
                activeOption = null;
                const spotVal = selectedAssets.reduce((s, a, ai) => {
                    if (a.type !== 'futures') { const p = getAssetPrice(a, row) || 0; return s + positions[ai].qty * p; }
                    return s;
                }, 0);
                const postLiq = Math.max(0, cash + spotVal);
                if (postLiq <= 0) { isBankrupt = true; cash = 0; positions.forEach(p => { p.qty = 0; }); }
                strategyEquity[strategyEquity.length - 1] = postLiq;
            }
        }

        if (!isBankrupt && strategyEquity[strategyEquity.length - 1] <= 0) {
            isBankrupt = true;
            strategyEquity[strategyEquity.length - 1] = 0;
            cash = 0; positions.forEach(p => { p.qty = 0; }); activeOption = null;
        }
    }

    // ─── Metrics ───
    const finalEquity = strategyEquity[strategyEquity.length - 1];
    const totalReturnVal = (finalEquity - initialCapital) / initialCapital;
    const dayCount = strategyEquity.length;
    const annRet = Math.pow(Math.max(finalEquity, 1) / initialCapital, 365 / (dayCount * (365 / 252))) - 1;
    const taiexReturnVal = (taiexEquity[taiexEquity.length - 1] - initialCapital) / initialCapital;

    let maxDrawdownVal = 0, peak = 0;
    strategyEquity.forEach(v => { if (v > peak) peak = v; const dd = peak > 0 ? (v - peak) / peak : 0; if (dd < maxDrawdownVal) maxDrawdownVal = dd; });

    const dailyReturns = strategyEquity.slice(1).map((v, k) => { const prev = strategyEquity[k]; return prev <= 0 ? 0 : (v - prev) / prev; });
    const meanRet = dailyReturns.reduce((a, b) => a + b, 0) / Math.max(dailyReturns.length, 1);
    const annVol = Math.sqrt(dailyReturns.reduce((s, v) => s + Math.pow(v - meanRet, 2), 0) / Math.max(dailyReturns.length, 1)) * Math.sqrt(252);
    const sharpeVal = annVol > 0 ? (annRet - 0.015) / annVol : 0;

    const fmtSigned = (n) => `${n >= 0 ? '+' : '-'}${Math.abs(Math.round(n)).toLocaleString()}`;
    const totalNetPnL = Math.round(finalEquity - initialCapital);
    const callGrossVal = Math.round(totalPremiumIncome);
    const callSettleVal = Math.round(totalCallSettlement);
    const callNetVal = callGrossVal - callSettleVal;
    const putNetVal = Math.round(putNetProfitTotal);
    const frictionVal = Math.round(totalFrictionCost);
    const longAssetGrossPnL = totalNetPnL - callNetVal - putNetVal + frictionVal;
    const optionsTotalNetPnL = callNetVal + putNetVal;

    const returnSpan = document.getElementById('metric-total-return');
    returnSpan.textContent = `${totalReturnVal >= 0 ? '+' : ''}${(totalReturnVal * 100).toFixed(2)}%`;
    returnSpan.className = `metric-value ${totalReturnVal >= 0 ? 'positive' : 'negative'}`;

    let totalPnlHtml = `<div style="margin-top:2px; line-height:1.55;">` +
        `<div><strong>總淨損益：</strong><strong style="color:${totalNetPnL >= 0 ? 'var(--success)' : 'var(--danger)'}">${fmtSigned(totalNetPnL)} TWD</strong> &nbsp;|&nbsp; 大盤同期: ${taiexReturnVal >= 0 ? '+' : ''}${(taiexReturnVal * 100).toFixed(2)}%</div>` +
        `<div style="font-size:0.74rem; color:var(--text-muted); margin-top:2px;">` +
        `明細 ＝ 多單 <span style="color:${longAssetGrossPnL >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight:600;">${fmtSigned(longAssetGrossPnL)}</span>` +
        ` ＋ Call淨損益 <span style="color:${callNetVal >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight:600;">${fmtSigned(callNetVal)}</span>`;
    if (hedgeMode === 'b5' || hedgeMode === 'b3') {
        totalPnlHtml += ` ＋ Put避險 <span style="color:${putNetVal >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight:600;">${fmtSigned(putNetVal)}</span>`;
    }
    totalPnlHtml += ` － 轉倉/手續費 <span style="color:var(--warning); font-weight:600;">-${frictionVal.toLocaleString()}</span></div></div>`;
    document.getElementById('metric-total-pnl').innerHTML = totalPnlHtml;

    const winRate = optionCyclesCount > 0 ? (optionWinsCount / optionCyclesCount) * 100 : 0;
    document.getElementById('metric-total-premium').textContent = `+TWD ${callGrossVal.toLocaleString()}`;
    let winRateHtml = `<div style="margin-top:2px; line-height:1.55;">` +
        `<div style="font-size:0.75rem;">` +
        `Call毛收 <span style="color:var(--success); font-weight:600;">+${callGrossVal.toLocaleString()}</span>` +
        ` － 買回/賠付 <span style="color:var(--danger); font-weight:600;">-${callSettleVal.toLocaleString()}</span>`;
    if (hedgeMode === 'b5' || hedgeMode === 'b3') {
        winRateHtml += ` ${putNetVal >= 0 ? '＋' : '－'} Put淨損益 <span style="color:${putNetVal >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight:600;">${fmtSigned(putNetVal)}</span>`;
    }
    winRateHtml += ` ＝ <strong>期權淨賺 <span style="color:${optionsTotalNetPnL >= 0 ? 'var(--success)' : 'var(--danger)'};">${fmtSigned(optionsTotalNetPnL)}</span></strong></div>` +
        `<div style="font-size:0.73rem; color:var(--text-muted); margin-top:2px;">` +
        `勝率: ${winRate.toFixed(0)}% (轉倉 ${optionCyclesCount} 次 · 提前停利 ${earlyTakeProfitCount} 次 · 觸價上移 ${rollUpCount} 次)</div></div>`;
    document.getElementById('metric-premium-yield').innerHTML = winRateHtml;
    document.getElementById('metric-sharpe').textContent = sharpeVal.toFixed(2);

    const mddSpan = document.getElementById('metric-mdd');
    mddSpan.textContent = `${(maxDrawdownVal * 100).toFixed(2)}%`;
    mddSpan.className = 'metric-value negative';

    let mcHtml = `追繳: <span style="color: ${marginCalls > 0 ? 'var(--danger)' : 'inherit'}; font-weight:bold">${marginCalls}</span>` +
        ` | 爆倉: <span style="color: ${liquidations > 0 ? 'var(--danger)' : 'inherit'}; font-weight:bold">${liquidations}</span>`;
    if (isBankrupt) mcHtml += ` <span style="color: var(--danger); font-weight:bold; background: rgba(239,68,68,0.2); padding: 2px 6px; border-radius: 4px; margin-left: 4px;">⚠️ 已破產</span>`;
    document.getElementById('metric-margin-calls').innerHTML = mcHtml;

    const portfolioLabel = selectedAssets.map(a => `${a.symbol}(${a.weight}%)`).join(' + ');
    const hedgeTitleMap = { 'none': '', 'b5': ' + [B5]周選Put 2%避險', 'b3': ' + [B3]周選ATM Put避險', 'a1': ' + [A1]降多單50%' };
    const fullStrategyLabel = portfolioLabel + (hedgeTitleMap[hedgeMode] || '');
    renderChart(dates, strategyEquity, taiexEquity, tsmcEquity, fullStrategyLabel);
}

// ─────────────────────────────────────────────
// CHART
// ─────────────────────────────────────────────
function renderChart(labels, strategyData, taiexData, tsmcData, portfolioLabel = '策略組合') {
    const ctx = document.getElementById('pnlChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    const initialVal = strategyData[0] || 1;
    const toReturn = arr => arr.map(v => ((v - initialVal) / initialVal) * 100);

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                { label: `📋 ${portfolioLabel} Covered Call 策略`, data: toReturn(strategyData), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.05)', borderWidth: 2.5, pointRadius: toReturn(strategyData).map((_, i) => i === strategyData.length - 1 ? 6 : 0), pointHoverRadius: 8, tension: 0.1, fill: true },
                { label: '對比加權指數 (TAIEX)', data: toReturn(taiexData), borderColor: '#94a3b8', borderWidth: 1.5, borderDash: [5, 5], pointRadius: toReturn(taiexData).map((_, i) => i === taiexData.length - 1 ? 6 : 0), pointHoverRadius: 8, tension: 0.1, fill: false },
                { label: '對比單純持有組合 (Buy & Hold)', data: toReturn(tsmcData), borderColor: '#f59e0b', borderWidth: 1.5, pointRadius: toReturn(tsmcData).map((_, i) => i === tsmcData.length - 1 ? 6 : 0), pointHoverRadius: 8, tension: 0.1, fill: false },
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: '#cbd5e1', font: { family: 'Inter', size: 11 } } },
                tooltip: { mode: 'index', intersect: false, callbacks: { label: c => `${c.dataset.label}: ${c.parsed.y >= 0 ? '+' : ''}${c.parsed.y.toFixed(2)}%` } }
            },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#94a3b8', maxTicksLimit: 12, font: { size: 10 } } },
                y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#94a3b8', callback: v => `${v >= 0 ? '+' : ''}${v}%`, font: { size: 10 } } }
            }
        }
    });
}

// ─────────────────────────────────────────────
// BLACK-SCHOLES & DATE HELPERS
// ─────────────────────────────────────────────
function normCdf(x) {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x) / Math.sqrt(2.0);
    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
    return 0.5 * (1.0 + sign * y);
}

function blackScholesCall(S, K, T, r, sigma) {
    if (T <= 0) return Math.max(0, S - K);
    if (sigma <= 0) return Math.max(0, S - K * Math.exp(-r * T));
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    return S * normCdf(d1) - K * Math.exp(-r * T) * normCdf(d1 - sigma * Math.sqrt(T));
}

function blackScholesPut(S, K, T, r, sigma) {
    if (T <= 0) return Math.max(0, K - S);
    return blackScholesCall(S, K, T, r, sigma) - S + K * Math.exp(-r * T);
}

function getTaiexMA(dataArray, endIndex, period) {
    if (endIndex < period - 1) return null;
    let sum = 0;
    for (let k = endIndex - period + 1; k <= endIndex; k++) {
        sum += dataArray[k].taiex;
    }
    return sum / period;
}

function getNextWeeklyExpiryDate(dateStr) {
    const d = new Date(dateStr);
    let daysAhead = (3 - d.getDay() + 7) % 7;
    if (daysAhead === 0) daysAhead = 7;
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
}

function getThirdWednesday(year, month) {
    const d = new Date(year, month, 1);
    return new Date(year, month, (3 - d.getDay() + 7) % 7 + 15);
}

function getNextMonthlyExpiryDate(dateStr) {
    const d = new Date(dateStr);
    const cTW = getThirdWednesday(d.getFullYear(), d.getMonth()).toISOString().split('T')[0];
    if (dateStr >= cTW) {
        let nm = d.getMonth() + 1, yr = d.getFullYear();
        if (nm > 11) { nm = 0; yr++; }
        return getThirdWednesday(yr, nm).toISOString().split('T')[0];
    }
    return cTW;
}

function getCustomOtmOption(row, optionType, optionCycle, customOtmPct) {
    const S = optionType === 'taiex' ? row.taiex : row.tsmc;
    const vol = optionType === 'taiex' ? row.taiex_vol : row.tsmc_vol;
    const r = 0.015;
    const expiryDateStr = optionCycle === 'weekly' ? getNextWeeklyExpiryDate(row.date) : getNextMonthlyExpiryDate(row.date);
    const T = Math.max((new Date(expiryDateStr) - new Date(row.date)) / (1000 * 60 * 60 * 24), 0.1) / 365.0;
    const K = S * (1.0 + customOtmPct / 100);
    const K_rounded = optionType === 'taiex' ? Math.round(K / 100) * 100 : Math.round(K / 10) * 10;
    const premium = Math.max(blackScholesCall(S, K_rounded, T, r, vol), optionCycle === 'weekly' ? 0.5 : 1.0);
    let d1 = 0;
    if (vol > 0 && T > 0) d1 = (Math.log(S / K_rounded) + (r + 0.5 * vol * vol) * T) / (vol * Math.sqrt(T));
    return { strike: K_rounded, premium: Math.round(premium * 100) / 100, delta: normCdf(d1) };
}


// ─────────────────────────────────────────────
// INSTITUTIONAL OPTIONS FLOW TABLE (TAIFEX)
// ─────────────────────────────────────────────
function renderInstitutionalOptionsTable() {
    if (!instTableTbody || !rawData || rawData.length === 0) return;

    // Filter valid records that contain institutional_options
    const validRecords = rawData.filter(r => r.institutional_options);
    if (validRecords.length === 0) {
        instTableTbody.innerHTML = '<tr><td colspan="11" style="text-align:center; padding:1.5rem; color:var(--text-muted);">尚無三大法人選擇權數據</td></tr>';
        return;
    }

    // Update KPI Cards using the latest available record
    const latestRec = validRecords[validRecords.length - 1];
    const prevRec = validRecords.length > 1 ? validRecords[validRecords.length - 2] : null;
    const lInst = latestRec.institutional_options;

    if (kpiForeignBpAmt) {
        const bpYi = (lInst.foreign_bp_amt / 100000).toFixed(2);
        kpiForeignBpAmt.textContent = `${Number(bpYi).toLocaleString()} 億`;
    }
    if (kpiForeignSp) {
        const spCnt = (lInst.foreign_sp_cnt || 0).toLocaleString();
        const spYi = ((lInst.foreign_sp_amt || 0) / 100000).toFixed(2);
        kpiForeignSp.textContent = `${spCnt} 口 / ${Number(spYi).toLocaleString()} 億`;
    }
    if (kpiForeignSpBpDiff) {
        const diffWan = Math.round(lInst.foreign_sp_bp_diff / 10);
        const prefix = diffWan > 0 ? '+' : '';
        kpiForeignSpBpDiff.textContent = `${prefix}${diffWan.toLocaleString()} 萬`;
        kpiForeignSpBpDiff.style.color = diffWan < -50000 ? 'var(--danger)' : (diffWan > 0 ? 'var(--success)' : 'var(--warning)');
    }
    if (kpiForeignBcAmt) {
        const bcYi = ((lInst.foreign_bc_amt || 0) / 100000).toFixed(2);
        kpiForeignBcAmt.textContent = `${Number(bcYi).toLocaleString()} 億`;
    }

    // Select row limit
    let limit = 60;
    if (instTableRowsSelect) {
        const val = instTableRowsSelect.value;
        if (val === '30') limit = 30;
        else if (val === '60') limit = 60;
        else if (val === '120') limit = 120;
        else if (val === 'all') limit = validRecords.length;
    }

    // Slice and reverse to show most recent first
    const displayRecords = validRecords.slice(-limit).reverse();

    let rowsHtml = '';
    displayRecords.forEach(rec => {
        const d = rec.date;
        const taiex = Math.round(rec.taiex).toLocaleString();
        const inst = rec.institutional_options;

        // Find previous record to calculate index change
        const origIdx = rawData.findIndex(r => r.date === d);
        let changeText = '--';
        let changeStyle = 'color:var(--text-muted);';
        if (origIdx > 0) {
            const diff = Math.round(rec.taiex - rawData[origIdx - 1].taiex);
            const diffSign = diff > 0 ? `+${diff}` : `${diff}`;
            changeStyle = diff > 0 ? 'color:var(--danger);' : (diff < 0 ? 'color:var(--success);' : 'color:var(--text-muted);');
            changeText = diffSign;
        }

        // 1. Foreign BP 金額 (千元) -> 暴增標記
        const bpAmt = inst.foreign_bp_amt || 0;
        let bpBg = 'transparent';
        let bpColor = 'inherit';
        let bpWeight = 'normal';
        if (bpAmt >= 3000000) {
            bpBg = 'rgba(239, 68, 68, 0.45)'; // 30億以上極度避險
            bpColor = '#fff';
            bpWeight = '700';
        } else if (bpAmt >= 1500000) {
            bpBg = 'rgba(239, 68, 68, 0.25)'; // 15億以上顯著避險
            bpColor = '#fca5a5';
            bpWeight = '600';
        } else if (bpAmt >= 800000) {
            bpBg = 'rgba(239, 68, 68, 0.12)';
        }

        // 2. Foreign SP 口數與金額
        const spCnt = (inst.foreign_sp_cnt || 0).toLocaleString();
        const spAmt = (inst.foreign_sp_amt || 0).toLocaleString();
        let spBg = (inst.foreign_sp_cnt >= 20000) ? 'rgba(59, 130, 246, 0.18)' : 'transparent';

        // 3. (SP增幅 - BP增幅)
        const diff = inst.foreign_sp_bp_diff || 0;
        const diffStr = diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString();
        let diffBg = 'transparent';
        let diffColor = 'inherit';
        if (diff <= -500000) {
            diffBg = 'rgba(239, 68, 68, 0.35)'; // 單日避險大增5億以上
            diffColor = '#fff';
        } else if (diff < 0) {
            diffColor = 'var(--danger)';
        } else if (diff >= 300000) {
            diffBg = 'rgba(16, 185, 129, 0.2)'; // 偏多回補3億以上
            diffColor = 'var(--success)';
        } else if (diff > 0) {
            diffColor = 'var(--success)';
        }

        // 4. Other institutional fields
        const bcAmt = (inst.foreign_bc_amt || 0).toLocaleString();
        const scAmt = (inst.foreign_sc_amt || 0).toLocaleString();
        const d_bp = (inst.dealer_bp_amt || 0).toLocaleString();
        const d_sp = (inst.dealer_sp_amt || 0).toLocaleString();

        rowsHtml += `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.15s;">
                <td class="sticky-date-col" style="text-align:center; padding:7px 8px; font-weight:500; font-family:monospace;">${d}</td>
                <td style="padding:7px 8px; font-weight:600;">${taiex}</td>
                <td style="padding:7px 8px; font-weight:600; ${changeStyle}">${changeText}</td>
                <td style="padding:7px 8px; background:${bpBg}; color:${bpColor}; font-weight:${bpWeight};">${bpAmt.toLocaleString()}</td>
                <td style="padding:7px 8px; background:${spBg}; font-weight:500;">${spCnt}</td>
                <td style="padding:7px 8px; background:${spBg}; font-weight:500;">${spAmt}</td>
                <td style="padding:7px 8px; background:${diffBg}; color:${diffColor}; font-weight:600;">${diffStr}</td>
                <td style="padding:7px 8px; color:rgba(255,255,255,0.8);">${bcAmt}</td>
                <td style="padding:7px 8px; color:rgba(255,255,255,0.8);">${scAmt}</td>
                <td style="padding:7px 8px; color:var(--text-muted);">${d_bp}</td>
                <td style="padding:7px 8px; color:var(--text-muted);">${d_sp}</td>
            </tr>
        `;
    });

    instTableTbody.innerHTML = rowsHtml;
}


// ─────────────────────────────────────────────
// LIVE FINMIND BROWSER SYNC (即時抓取期交所最新三大法人選擇權籌碼與收盤行情)
// ─────────────────────────────────────────────
function normPpf(p) {
    let low = -8.0, high = 8.0;
    for (let i = 0; i < 45; i++) {
        const mid = (low + high) / 2.0;
        if (normCdf(mid) < p) low = mid;
        else high = mid;
    }
    return (low + high) / 2.0;
}

function strikeForDeltaJS(S, delta, T, r, sigma) {
    if (T <= 0 || sigma <= 0) return S;
    const d1 = normPpf(delta);
    return S * Math.exp((r + 0.5 * sigma * sigma) * T - d1 * sigma * Math.sqrt(T));
}

function buildOptionsChainForRecord(S_taiex, vol_taiex, S_tsmc, vol_tsmc, T_w, T_m) {
    const r = 0.015;
    const options_data = {
        taiex: { weekly: {}, monthly: {} },
        tsmc: { weekly: {}, monthly: {} }
    };
    for (const [term, T_term] of [['weekly', T_w], ['monthly', T_m]]) {
        const taiex_strikes = {
            ATM: S_taiex,
            OTM_2: S_taiex * 1.02,
            OTM_5: S_taiex * 1.05,
            OTM_10: S_taiex * 1.10,
            DELTA_3: strikeForDeltaJS(S_taiex, 0.3, T_term, r, vol_taiex),
            DELTA_2: strikeForDeltaJS(S_taiex, 0.2, T_term, r, vol_taiex),
            DELTA_1: strikeForDeltaJS(S_taiex, 0.1, T_term, r, vol_taiex),
        };
        for (const [name, K] of Object.entries(taiex_strikes)) {
            const K_rounded = Math.round(K / 100) * 100;
            const min_floor = term === 'weekly' ? 0.5 : 1.0;
            const premium = Math.max(blackScholesCall(S_taiex, K_rounded, T_term, r, vol_taiex), min_floor);
            options_data.taiex[term][name] = { strike: K_rounded, premium: Math.round(premium * 100) / 100 };
        }
        const tsmc_strikes = {
            ATM: S_tsmc,
            OTM_2: S_tsmc * 1.02,
            OTM_5: S_tsmc * 1.05,
            OTM_10: S_tsmc * 1.10,
            DELTA_3: strikeForDeltaJS(S_tsmc, 0.3, T_term, r, vol_tsmc),
            DELTA_2: strikeForDeltaJS(S_tsmc, 0.2, T_term, r, vol_tsmc),
            DELTA_1: strikeForDeltaJS(S_tsmc, 0.1, T_term, r, vol_tsmc),
        };
        for (const [name, K] of Object.entries(tsmc_strikes)) {
            const K_rounded = Math.round(K / 10) * 10;
            const min_floor = term === 'weekly' ? 0.5 : 1.0;
            const premium = Math.max(blackScholesCall(S_tsmc, K_rounded, T_term, r, vol_tsmc), min_floor);
            options_data.tsmc[term][name] = { strike: K_rounded, premium: Math.round(premium * 100) / 100 };
        }
    }
    return options_data;
}

async function syncLiveFinMindData() {
    if (!rawData || rawData.length === 0) return { addedDays: 0, updatedChips: 0 };
    const lastRec = rawData[rawData.length - 1];
    const startObj = new Date(lastRec.date);
    startObj.setDate(startObj.getDate() - 10);
    const startStr = startObj.toISOString().split('T')[0];

    const fetchJson = async (url) => {
        const resp = await fetch(url, { cache: 'no-store' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return resp.json();
    };

    const baseUrl = 'https://api.finmindtrade.com/api/v4/data';
    const [optRes, taiexRes, tsmcRes, etf50Res, etf981Res, etf991Res] = await Promise.all([
        fetchJson(`${baseUrl}?dataset=TaiwanOptionInstitutionalInvestors&data_id=TXO&start_date=${startStr}`),
        fetchJson(`${baseUrl}?dataset=TaiwanStockPrice&data_id=TAIEX&start_date=${startStr}`).catch(() => ({ data: [] })),
        fetchJson(`${baseUrl}?dataset=TaiwanStockPrice&data_id=2330&start_date=${startStr}`).catch(() => ({ data: [] })),
        fetchJson(`${baseUrl}?dataset=TaiwanStockPrice&data_id=0050&start_date=${startStr}`).catch(() => ({ data: [] })),
        fetchJson(`${baseUrl}?dataset=TaiwanStockPrice&data_id=00981A&start_date=${startStr}`).catch(() => ({ data: [] })),
        fetchJson(`${baseUrl}?dataset=TaiwanStockPrice&data_id=00991A&start_date=${startStr}`).catch(() => ({ data: [] })),
    ]);

    // 1. Parse institutional options by date
    const instByDate = {};
    for (const row of (optRes.data || [])) {
        const d = row.date;
        if (!d) continue;
        if (!instByDate[d]) instByDate[d] = {};
        const inst = row.institutional_investors || '';
        const cp = row.call_put || '';
        const isForeign = inst.includes('外資') || inst.toLowerCase().includes('foreign');
        const isDealer = inst.includes('自營') || inst.toLowerCase().includes('dealer');
        const isTrust = inst.includes('投信') || inst.toLowerCase().includes('trust');
        const isCall = cp.includes('買') || cp.toLowerCase().includes('call');
        const isPut = cp.includes('賣') || cp.toLowerCase().includes('put');
        const prefix = isForeign ? 'foreign' : (isDealer ? 'dealer' : (isTrust ? 'trust' : 'other'));
        const cpTag = isCall ? 'call' : (isPut ? 'put' : 'unknown');
        if (prefix === 'other' || cpTag === 'unknown') continue;
        instByDate[d][`${prefix}_${cpTag}_b_cnt`] = parseInt(row.long_open_interest_balance_volume || 0, 10);
        instByDate[d][`${prefix}_${cpTag}_b_amt`] = parseInt(row.long_open_interest_balance_amount || 0, 10);
        instByDate[d][`${prefix}_${cpTag}_s_cnt`] = parseInt(row.short_open_interest_balance_volume || 0, 10);
        instByDate[d][`${prefix}_${cpTag}_s_amt`] = parseInt(row.short_open_interest_balance_amount || 0, 10);
    }

    // 2. Parse daily close prices by date
    const toPriceMap = (arr) => {
        const m = {};
        for (const r of (arr || [])) {
            if (r.date && r.close > 0) m[r.date] = Number(r.close);
        }
        return m;
    };
    const taiexMap = toPriceMap(taiexRes.data);
    const tsmcMap = toPriceMap(tsmcRes.data);
    const etf50Map = toPriceMap(etf50Res.data);
    const etf981Map = toPriceMap(etf981Res.data);
    const etf991Map = toPriceMap(etf991Res.data);

    // 3. Append any new trading dates that exist in FinMind but not yet in rawData
    const existingDates = new Set(rawData.map(r => r.date));
    const candidateDates = new Set([...Object.keys(taiexMap), ...Object.keys(instByDate)]);
    const newDates = [...candidateDates].filter(d => d > lastRec.date && !existingDates.has(d)).sort();

    let addedDays = 0;
    for (const dStr of newDates) {
        const prev = rawData[rawData.length - 1];
        const S_taiex = taiexMap[dStr] || prev.taiex;
        const S_tsmc = tsmcMap[dStr] || prev.tsmc;
        if (!taiexMap[dStr] && !instByDate[dStr]) continue;

        const expiry_weekly = getNextWeeklyExpiryDate(dStr);
        const expiry_monthly = getNextMonthlyExpiryDate(dStr);
        const curDate = new Date(dStr);
        const days_w = Math.max(1, Math.round((new Date(expiry_weekly) - curDate) / 86400000));
        const days_m = Math.max(1, Math.round((new Date(expiry_monthly) - curDate) / 86400000));

        // Compute 20-day annualized volatility
        const recent = rawData.slice(-20);
        const calcVol = (getter, latestVal, fallback) => {
            const vals = [...recent.map(getter), latestVal];
            if (vals.length < 5) return fallback;
            const rets = [];
            for (let i = 1; i < vals.length; i++) {
                if (vals[i - 1] > 0) rets.push((vals[i] - vals[i - 1]) / vals[i - 1]);
            }
            const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
            const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, rets.length - 1);
            return Math.sqrt(variance) * Math.sqrt(252);
        };
        const vol_taiex = calcVol(r => r.taiex, S_taiex, prev.taiex_vol);
        const vol_tsmc = calcVol(r => r.tsmc, S_tsmc, prev.tsmc_vol);

        const newRecord = {
            date: dStr,
            taiex: S_taiex,
            tsmc: S_tsmc,
            etf_0050: etf50Map[dStr] ?? prev.etf_0050,
            etf_981: etf981Map[dStr] ?? prev.etf_981,
            etf_991: etf991Map[dStr] ?? prev.etf_991,
            taiex_vol: vol_taiex,
            tsmc_vol: vol_tsmc,
            expiry_date_monthly: expiry_monthly,
            expiry_date_weekly: expiry_weekly,
            days_to_expiry_monthly: days_m,
            days_to_expiry_weekly: days_w,
            betas: { ...prev.betas },
            options: buildOptionsChainForRecord(S_taiex, vol_taiex, S_tsmc, vol_tsmc, days_w / 365.0, days_m / 365.0),
            institutional_options: null
        };
        rawData.push(newRecord);
        addedDays++;
    }

    // 4. Backfill / refresh institutional_options across recent records
    let updatedChips = 0;
    for (let i = 0; i < rawData.length; i++) {
        const rec = rawData[i];
        const tData = instByDate[rec.date];
        if (!tData || Object.keys(tData).length === 0) continue;

        const prevInst = i > 0 && rawData[i - 1].institutional_options ? rawData[i - 1].institutional_options : null;
        const f_bp_amt = tData.foreign_put_b_amt ?? 0;
        const f_sp_cnt = tData.foreign_put_s_cnt ?? 0;
        const f_sp_amt = tData.foreign_put_s_amt ?? 0;
        const f_bc_cnt = tData.foreign_call_b_cnt ?? 0;
        const f_bc_amt = tData.foreign_call_b_amt ?? 0;
        const f_sc_cnt = tData.foreign_call_s_cnt ?? 0;
        const f_sc_amt = tData.foreign_call_s_amt ?? 0;

        const foreign_sp_bp_diff = prevInst
            ? (f_sp_amt - (prevInst.foreign_sp_amt || 0)) - (f_bp_amt - (prevInst.foreign_bp_amt || 0))
            : 0;
        const foreign_bc_sc_diff = prevInst
            ? (f_bc_amt - (prevInst.foreign_bc_amt || 0)) - (f_sc_amt - (prevInst.foreign_sc_amt || 0))
            : 0;

        rec.institutional_options = {
            foreign_bp_amt: f_bp_amt,
            foreign_sp_cnt: f_sp_cnt,
            foreign_sp_amt: f_sp_amt,
            foreign_sp_bp_diff,
            foreign_bc_cnt: f_bc_cnt,
            foreign_bc_amt: f_bc_amt,
            foreign_sc_cnt: f_sc_cnt,
            foreign_sc_amt: f_sc_amt,
            foreign_bc_sc_diff,
            dealer_bp_amt: tData.dealer_put_b_amt ?? 0,
            dealer_sp_amt: tData.dealer_put_s_amt ?? 0,
            dealer_bc_amt: tData.dealer_call_b_amt ?? 0,
            dealer_sc_amt: tData.dealer_call_s_amt ?? 0,
        };
        updatedChips++;
    }

    return { addedDays, updatedChips };
}

// ─────────────────────────────────────────────
// REFRESH DATA & INSTITUTIONAL OPTIONS PIPELINE
// ─────────────────────────────────────────────
let isRefreshing = false;
async function handleRefreshData() {
    if (isRefreshing) return;
    isRefreshing = true;

    // UI Feedback: spinning animation & status
    if (refreshIcon) refreshIcon.classList.add('spin-animation');
    if (btnRefreshData) btnRefreshData.disabled = true;
    if (btnTableRefresh) {
        btnTableRefresh.disabled = true;
        btnTableRefresh.innerHTML = '<span class="spin-animation">⏳</span> 更新中...';
    }
    dataStatusBadge.innerHTML = '<span class="dot yellow"></span> 正在同步最新籌碼與行情...';

    showFetchStatus('<span class="spin">⟳</span> 正在從期交所/FinMind 與 GitHub 即時獲取最新行情與外資期權籌碼...');

    try {
        const timestamp = Date.now();
        const prevStartDate = rawData[parseInt(startSelect.value)]?.date;

        // 1. Fetch static data.json from both local & GitHub, pick the newer one
        const candidates = [];
        try {
            const rLocal = await fetch('./data/data.json?v=' + timestamp, { cache: 'no-store' });
            if (rLocal.ok) {
                const dLocal = await rLocal.json();
                if (Array.isArray(dLocal) && dLocal.length > 0) candidates.push(dLocal);
            }
        } catch (e) { /* ignore */ }
        try {
            const rRemote = await fetch('https://raw.githubusercontent.com/pilimesai/cover-call/main/data/data.json?v=' + timestamp, { cache: 'no-store' });
            if (rRemote.ok) {
                const dRemote = await rRemote.json();
                if (Array.isArray(dRemote) && dRemote.length > 0) candidates.push(dRemote);
            }
        } catch (e) { /* ignore */ }

        if (candidates.length > 0) {
            candidates.sort((a, b) => (b[b.length - 1].date).localeCompare(a[a.length - 1].date));
            rawData = candidates[0];
        }

        // 2. Real-time browser sync with FinMind API (即使 GitHub 尚未更新也能即時抓到當日最新籌碼！)
        try {
            await syncLiveFinMindData();
        } catch (liveErr) {
            console.warn('Live FinMind sync warning:', liveErr);
        }

        // 3. Re-populate dropdowns (preserving user's start date, setting end date to latest)
        populateDropdowns();
        if (prevStartDate) {
            const foundStartIdx = rawData.findIndex(r => r.date === prevStartDate);
            if (foundStartIdx >= 0 && foundStartIdx < rawData.length - 1) {
                startSelect.value = foundStartIdx;
            }
        }
        endSelect.value = rawData.length - 1;

        // 4. Re-render all components
        updateRecommendation();
        runBacktest();
        renderInstitutionalOptionsTable();

        const latestRec = rawData[rawData.length - 1];
        const validInst = rawData.filter(r => r.institutional_options);
        const latestInstDate = validInst.length > 0 ? validInst[validInst.length - 1].date : latestRec.date;

        dataStatusBadge.innerHTML = `<span class="dot green"></span> 已更新 (${latestRec.date})`;
        showFetchStatus(`✅ 籌碼與行情同步完成！最新交易日：<strong>${latestRec.date}</strong>｜最新三大法人籌碼日：<strong>${latestInstDate}</strong>`, 'success');
        setTimeout(() => hideFetchStatus(), 4500);
    } catch (err) {
        console.error('Refresh error:', err);
        dataStatusBadge.innerHTML = '<span class="dot red"></span> 更新失敗';
        showFetchStatus(`⚠️ 數據同步失敗: ${err.message}，請稍後重試。`, 'warning');
        setTimeout(() => hideFetchStatus(), 5000);
    } finally {
        isRefreshing = false;
        if (refreshIcon) refreshIcon.classList.remove('spin-animation');
        if (btnRefreshData) btnRefreshData.disabled = false;
        if (btnTableRefresh) {
            btnTableRefresh.disabled = false;
            btnTableRefresh.innerHTML = '<span>🔄</span> 立即更新籌碼';
        }
    }
}
