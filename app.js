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

let selectedAssets = [
    { ...BUILTIN_ASSETS[0], weight: 33 },
    { ...BUILTIN_ASSETS[1], weight: 33 },
    { ...BUILTIN_ASSETS[6], weight: 34 },
];

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
const adviceAssetsTbody = document.getElementById('advice-assets-tbody');
const adviceMarginRatio = document.getElementById('advice-margin-ratio');
const latestTaiexSpan = document.getElementById('latest-taiex');
const latestTsmcSpan = document.getElementById('latest-tsmc');

// ─────────────────────────────────────────────
// INITIALIZE
// ─────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("Loading database...");
        const response = await fetch('./data/data.json?v=' + Date.now());
        if (!response.ok) throw new Error(`Failed to load data.json: ${response.statusText}`);
        rawData = await response.json();
        console.log(`Database loaded successfully. Records: ${rawData.length}`);
        dataStatusBadge.innerHTML = '<span class="dot green"></span> 數據已載入';
        populateDropdowns();
        setupEventListeners();
        if (chkAutoWeight) chkAutoWeight.checked = isAutoWeight;
        if (isAutoWeight) autoDistributeWeights();
        renderAssetCards();
        updateWeightTotalBar();
        updateRecommendation();
        runBacktest();
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
    } else if (len === 2) {
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

    optionTypeSelect.addEventListener('change', () => { updateRecommendation(); runBacktest(); });
    optionCycleSelect.addEventListener('change', () => { updateRecommendation(); runBacktest(); });

    strikeRuleSelect.addEventListener('change', () => {
        if (strikeRuleSelect.value === 'CUSTOM_OTM') customOtmRow.classList.remove('hidden');
        else customOtmRow.classList.add('hidden');
        updateRecommendation(); runBacktest();
    });

    customOtmValueInput.addEventListener('input', () => updateRecommendation());
    customOtmValueInput.addEventListener('change', () => runBacktest());
    optionContractsInput.addEventListener('input', () => updateRecommendation());
    optionContractsInput.addEventListener('change', () => runBacktest());
    btnRun.addEventListener('click', () => runBacktest());

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
    return getPriceFromHistory(asset.priceHistory, row.date);
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
// SOLVE REQUIRED CAPITAL
// ─────────────────────────────────────────────
function solveRequiredCapital(row, optionType, optionCycle, strikeRule, portfolioMode) {
    const multiplier = optionType === 'taiex' ? 50 : 2000;
    const S_underlying = optionType === 'taiex' ? row.taiex : row.tsmc;
    const optionContracts = Math.max(1, parseInt(optionContractsInput.value) || 1);
    const targetRatio = parseFloat(targetMarginRatioInput.value) || 130;
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

    if (portfolioMode === 'delta-neutral') {
        const targetExposure = optionContracts * (1.0 + delta) * multiplier * S_underlying;
        let totalAssetValue = 0, totalFuturesMargin = 0;
        for (const asset of selectedAssets) {
            const wFrac = asset.weight / 100.0;
            const assetExposure = targetExposure * wFrac;
            if (asset.type === 'futures') totalFuturesMargin += assetExposure * asset.marginRate;
            else totalAssetValue += assetExposure;
        }
        const optionMaintMargin = optionContracts * multiplier * (optInfo.premium + S_underlying * 0.115);
        const requiredCashBuffer = ratioMultiplier * (totalFuturesMargin + optionMaintMargin);
        return Math.round((totalAssetValue + requiredCashBuffer) / 10000) * 10000;
    } else {
        const wCashFrac = Math.max(0, 1.0 - selectedAssets.filter(a => a.type !== 'futures').reduce((s, a) => s + a.weight / 100.0, 0));
        const wFuturesFrac = selectedAssets.filter(a => a.type === 'futures').reduce((s, a) => s + a.weight / 100.0, 0);
        const optionMaintMargin = optionContracts * multiplier * (optInfo.premium + S_underlying * 0.115);
        const denom = wCashFrac - ratioMultiplier * wFuturesFrac * 0.115;
        const capital = denom > 0 ? (ratioMultiplier * optionMaintMargin) / denom : optionContracts * multiplier * S_underlying;
        return Math.round(capital / 10000) * 10000;
    }
}

// ─────────────────────────────────────────────
// UPDATE RECOMMENDATION
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

    let optInfo, delta = 0.20;
    if (strikeRule === 'CUSTOM_OTM') {
        const customOtmPct = parseFloat(customOtmValueInput.value) || 0;
        optInfo = getCustomOtmOption(row, optionType, optionCycle, customOtmPct);
        delta = optInfo.delta;
    } else {
        optInfo = row.options[optionType][optionCycle][strikeRule];
        delta = estimateDelta(strikeRule);
    }

    adviceStrike.textContent = `${optInfo.strike} (${optionType === 'taiex' ? '台指' : '台積電'}) [${optionCycle === 'weekly' ? '周選' : '月選'}] (賣出 ${optionContracts} 口)`;
    advicePremium.textContent = `${optInfo.premium} 點 (~${Math.round(optInfo.premium * multiplier * optionContracts).toLocaleString()} TWD)`;

    // Build weight fracs
    let assetInfos = [];
    if (portfolioMode === 'delta-neutral') {
        const targetExposure = optionContracts * (1.0 + delta) * multiplier * S_underlying;
        assetInfos = selectedAssets.map(asset => {
            const wFrac = asset.weight / 100.0;
            const value = targetExposure * wFrac;
            return { asset, value, wFrac: value / capital };
        });
    } else {
        assetInfos = selectedAssets.map(asset => {
            const wFrac = asset.weight / 100.0;
            return { asset, value: capital * wFrac, wFrac };
        });
    }

    // Render advice table
    adviceAssetsTbody.innerHTML = '';
    let totalFuturesMargin = 0;
    let totalSpotCost = 0;
    assetInfos.forEach(({ asset, value, wFrac }) => {
        const price = getAssetPrice(asset, row) || (asset.priceField === 'tsmc' ? row.tsmc : row.taiex);
        let qtyText, valText;
        if (asset.type === 'futures') {
            const contractVal = price * asset.contractMultiplier;
            const qty = contractVal > 0 ? Math.max(1, Math.round(value / contractVal)) : 0;
            const margin = qty * contractVal * asset.marginRate;
            totalFuturesMargin += margin;
            qtyText = `${qty} 口`;
            valText = `(計入保證金)`;
        } else {
            const qty = price > 0 ? Math.round(value / price) : 0;
            const cost = Math.round(qty * price);
            totalSpotCost += cost;
            qtyText = `${qty.toLocaleString()} 股`;
            valText = `${cost.toLocaleString()} TWD`;
        }
        const bc = asset.type === 'futures' ? 'futures' : asset.type === 'etf' ? 'etf' : 'stock';
        const bl = asset.type === 'futures' ? '期貨' : asset.type === 'etf' ? 'ETF' : '股票';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${asset.symbol} <span class="asset-badge ${bc}" style="font-size:0.63rem">${bl}</span> ${asset.name.substring(0, 10)}</td>
            <td>${(wFrac * 100).toFixed(1)}%</td>
            <td class="bold-val">${qtyText}</td>
            <td style="color:${asset.type === 'futures' ? 'var(--text-muted)' : 'inherit'}">${valText}</td>`;
        adviceAssetsTbody.appendChild(tr);
    });

    const spotValue = assetInfos.filter(x => x.asset.type !== 'futures').reduce((s, x) => s + x.value, 0);
    const cashValue = Math.max(0, capital - spotValue);
    const optionMaintMargin = optionContracts * multiplier * (optInfo.premium + S_underlying * 0.115);
    const totalMaintMargin = totalFuturesMargin + optionMaintMargin;
    const targetRatio = parseFloat(targetMarginRatioInput.value) || 130;
    const targetMarginAmount = Math.round(totalMaintMargin * targetRatio / 100);



    if (totalMaintMargin > 0) {
        const ratio = (cashValue / totalMaintMargin) * 100;
        adviceMarginRatio.textContent = `${ratio.toFixed(0)}%`;
        adviceMarginRatio.style.color = ratio < 120 ? 'var(--danger)' : ratio < 167 ? 'var(--warning)' : 'var(--success)';
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
    if (elMargin) elMargin.textContent = `${targetMarginAmount.toLocaleString()} TWD`;

    const aqo = document.getElementById('advice-qty-options');
    if (aqo) aqo.textContent = `${optionContracts} 口`;
}

// ─────────────────────────────────────────────
// BACKTEST CORE
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

    const positions = selectedAssets.map(() => ({ qty: 0, entryPrice: 0 }));
    let cash = initialCapital;
    let activeOption = null;
    const strategyEquity = [], taiexEquity = [], tsmcEquity = [], dates = [];
    let marginCalls = 0, liquidations = 0, isBankrupt = false;
    let optionCyclesCount = 0, optionWinsCount = 0, totalPremiumIncome = 0;

    const initialTaiex = rawData[startIdx].taiex;
    const initialTsmc = rawData[startIdx].tsmc;
    const multiplier = optionType === 'taiex' ? 50 : 2000;

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

        // 1. Option expiration
        if (activeOption && (dateStr >= activeOption.expiry_date || i === endIdx)) {
            cash -= 0; // payoff = 0 (simplified)
            const cyclePnL = (activeOption.premium * multiplier * optionContracts);
            if (cyclePnL > 0) optionWinsCount++;
            optionCyclesCount++;
            activeOption = null;
        }

        // 2. Rebalance on roll day
        const isRebalanceDay = (i === startIdx || activeOption === null);
        if (isRebalanceDay && i < endIdx) {
            // Liquidate all
            selectedAssets.forEach((asset, ai) => {
                const pos = positions[ai];
                const price = getAssetPrice(asset, row);
                if (pos.qty > 0 && price !== null) {
                    if (asset.type === 'futures') cash += pos.qty * asset.contractMultiplier * (price - pos.entryPrice);
                    else cash += pos.qty * price;
                }
                pos.qty = 0; pos.entryPrice = 0;
            });

            const totalEquity = cash;

            // Sell option
            let optInfo, currentDelta = 0.20;
            if (strikeRule === 'CUSTOM_OTM') {
                const customOtmPct = parseFloat(customOtmValueInput.value) || 0;
                optInfo = getCustomOtmOption(row, optionType, optionCycle, customOtmPct);
                currentDelta = optInfo.delta;
            } else {
                optInfo = row.options[optionType][optionCycle][strikeRule];
                currentDelta = estimateDelta(strikeRule);
            }
            activeOption = {
                strike: optInfo.strike, premium: optInfo.premium,
                expiry_date: optionCycle === 'weekly' ? getNextWeeklyExpiryDate(dateStr) : getNextMonthlyExpiryDate(dateStr)
            };
            cash += activeOption.premium * multiplier * optionContracts;
            totalPremiumIncome += activeOption.premium * multiplier * optionContracts;

            // Allocate assets
            selectedAssets.forEach((asset, ai) => {
                const price = getAssetPrice(asset, row);
                if (!price) return;
                let wFrac;
                if (portfolioMode === 'delta-neutral') {
                    const targetExposure = optionContracts * (1.0 + currentDelta) * multiplier * currentUnderlyingPrice;
                    wFrac = Math.min((asset.weight / 100.0) * (targetExposure / totalEquity), 0.9);
                } else {
                    wFrac = asset.weight / 100.0;
                }
                const allotment = totalEquity * wFrac;
                if (asset.type === 'futures') {
                    const contractVal = price * asset.contractMultiplier;
                    positions[ai].qty = contractVal > 0 ? Math.max(1, Math.round(allotment / contractVal)) : 0;
                    positions[ai].entryPrice = price;
                } else {
                    positions[ai].qty = Math.floor(allotment / price);
                    cash -= positions[ai].qty * price;
                    positions[ai].entryPrice = price;
                }
            });
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
            if (currentUnderlyingPrice > activeOption.strike) {
                const intrinsic = (currentUnderlyingPrice - activeOption.strike) * multiplier * optionContracts;
                optionLiability = Math.max(0, optionLiability - intrinsic);
            }
        }

        const dailyEquity = cash + dailyAssetValue - optionLiability;
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

        // 4. Margin call
        const optionMargin = activeOption ? (optionLiability + optionContracts * multiplier * currentUnderlyingPrice * 0.115) : 0;
        const totalReqMargin = totalFuturesMarginReq + optionMargin;
        const freeCash = cash + (dailyAssetValue - selectedAssets.reduce((s, a, ai) => {
            if (a.type !== 'futures') { const p = getAssetPrice(a, row) || 0; return s + positions[ai].qty * p; }
            return s;
        }, 0));

        if (freeCash < totalReqMargin) {
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

    const returnSpan = document.getElementById('metric-total-return');
    returnSpan.textContent = `${totalReturnVal >= 0 ? '+' : ''}${(totalReturnVal * 100).toFixed(2)}%`;
    returnSpan.className = `metric-value ${totalReturnVal >= 0 ? 'positive' : 'negative'}`;
    document.getElementById('metric-total-pnl').textContent = `TWD ${Math.round(finalEquity - initialCapital).toLocaleString()} | 大盤對比: ${taiexReturnVal >= 0 ? '+' : ''}${(taiexReturnVal * 100).toFixed(2)}%`;

    const winRate = optionCyclesCount > 0 ? (optionWinsCount / optionCyclesCount) * 100 : 0;
    document.getElementById('metric-total-premium').textContent = `TWD ${Math.round(totalPremiumIncome).toLocaleString()}`;
    document.getElementById('metric-premium-yield').textContent = `選擇權勝率: ${winRate.toFixed(0)}% (共轉倉 ${optionCyclesCount} 次)`;
    document.getElementById('metric-sharpe').textContent = sharpeVal.toFixed(2);

    const mddSpan = document.getElementById('metric-mdd');
    mddSpan.textContent = `${(maxDrawdownVal * 100).toFixed(2)}%`;
    mddSpan.className = 'metric-value negative';

    let mcHtml = `追繳: <span style="color: ${marginCalls > 0 ? 'var(--danger)' : 'inherit'}; font-weight:bold">${marginCalls}</span>` +
        ` | 爆倉: <span style="color: ${liquidations > 0 ? 'var(--danger)' : 'inherit'}; font-weight:bold">${liquidations}</span>`;
    if (isBankrupt) mcHtml += ` <span style="color: var(--danger); font-weight:bold; background: rgba(239,68,68,0.2); padding: 2px 6px; border-radius: 4px; margin-left: 4px;">⚠️ 已破產</span>`;
    document.getElementById('metric-margin-calls').innerHTML = mcHtml;

    const portfolioLabel = selectedAssets.map(a => `${a.symbol}(${a.weight}%)`).join(' + ');
    renderChart(dates, strategyEquity, taiexEquity, tsmcEquity, portfolioLabel);
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
