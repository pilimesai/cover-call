// Global State Variables
let rawData = [];
let chartInstance = null;

// DOM Elements
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

// Sliders and Values
const slider981 = document.getElementById('w-981');
const slider991 = document.getElementById('w-991');
const sliderFutures = document.getElementById('w-futures');

const val981 = document.getElementById('val-w-981');
const val991 = document.getElementById('val-w-991');
const valFutures = document.getElementById('val-w-futures');

const manualWeightsContainer = document.getElementById('manual-weights-container');
const autoWeightsContainer = document.getElementById('auto-weights-container');
const weightErrorMsg = document.getElementById('weight-error-msg');
const btnRun = document.getElementById('btn-run');
const dataStatusBadge = document.getElementById('data-status-badge');

// Recommendation Cards
const adviceStrike = document.getElementById('advice-strike');
const advicePremium = document.getElementById('advice-premium');
const adviceW981 = document.getElementById('advice-w-981');
const adviceQty981 = document.getElementById('advice-qty-981');
const adviceVal981 = document.getElementById('advice-val-981');
const adviceW991 = document.getElementById('advice-w-991');
const adviceQty991 = document.getElementById('advice-qty-991');
const adviceVal991 = document.getElementById('advice-val-991');
const adviceWFutures = document.getElementById('advice-w-futures');
const adviceQtyFutures = document.getElementById('advice-qty-futures');
const adviceValFutures = document.getElementById('advice-val-futures');
const adviceWCash = document.getElementById('advice-w-cash');
const adviceMarginRatio = document.getElementById('advice-margin-ratio');
const adviceValCash = document.getElementById('advice-val-cash');

const latestTaiexSpan = document.getElementById('latest-taiex');
const latestTsmcSpan = document.getElementById('latest-tsmc');
const latest981Span = document.getElementById('latest-981');
const latest991Span = document.getElementById('latest-991');

// Initialize App
window.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log("Loading database...");
        const response = await fetch('./data/data.json?v=' + Date.now());
        if (!response.ok) {
            throw new Error(`Failed to load data.json: ${response.statusText}`);
        }
        rawData = await response.json();
        console.log(`Database loaded successfully. Records: ${rawData.length}`);
        
        // Update status badge
        dataStatusBadge.innerHTML = '<span class="dot green"></span> 數據已載入';
        
        // Initialize dropdowns
        populateDropdowns();
        
        // Bind UI events
        setupEventListeners();
        
        // Update recommendation panel initially
        updateRecommendation();
        
        // Run initial backtest
        runBacktest();
    } catch (error) {
        console.error("Initialization error:", error);
        dataStatusBadge.innerHTML = '<span class="dot red"></span> 數據載入失敗';
        alert("載入歷史數據時發生錯誤，請確保已執行 generate_data.py！");
    }
});

// Populate dropdowns with date ranges
function populateDropdowns() {
    startSelect.innerHTML = '';
    endSelect.innerHTML = '';
    
    // Find index of 2025-12-09, which is when 00991A starts having data
    let defaultStartIndex = 0;
    for (let i = 0; i < rawData.length; i++) {
        if (rawData[i].etf_991 !== null) {
            defaultStartIndex = i;
            break;
        }
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

// Bind events to inputs
function setupEventListeners() {
    // Capital mode listener
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
    
    targetMarginRatioInput.addEventListener('input', () => {
        updateRecommendation();
    });
    targetMarginRatioInput.addEventListener('change', () => {
        runBacktest();
    });

    // Dropdown dates validation
    startSelect.addEventListener('change', () => {
        if (parseInt(startSelect.value) >= parseInt(endSelect.value)) {
            endSelect.value = Math.min(parseInt(startSelect.value) + 1, rawData.length - 1);
        }
        updateRecommendation();
        runBacktest();
    });
    
    endSelect.addEventListener('change', () => {
        if (parseInt(endSelect.value) <= parseInt(startSelect.value)) {
            startSelect.value = Math.max(parseInt(endSelect.value) - 1, 0);
        }
        updateRecommendation();
        runBacktest();
    });

    // Sliders
    const sliders = [slider981, slider991, sliderFutures];
    sliders.forEach(slider => {
        slider.addEventListener('input', () => {
            handleWeightSliders();
            updateRecommendation();
        });
        slider.addEventListener('change', () => {
            if (!btnRun.disabled) {
                runBacktest();
            }
        });
    });
    
    portfolioModeSelect.addEventListener('change', () => {
        const isAuto = portfolioModeSelect.value === 'delta-neutral';
        if (isAuto) {
            manualWeightsContainer.classList.add('hidden');
            autoWeightsContainer.classList.remove('hidden');
        } else {
            manualWeightsContainer.classList.remove('hidden');
            autoWeightsContainer.classList.add('hidden');
        }
        updateRecommendation();
        runBacktest();
    });
    
    optionTypeSelect.addEventListener('change', () => {
        updateRecommendation();
        runBacktest();
    });
    
    optionCycleSelect.addEventListener('change', () => {
        updateRecommendation();
        runBacktest();
    });
    
    strikeRuleSelect.addEventListener('change', () => {
        if (strikeRuleSelect.value === 'CUSTOM_OTM') {
            customOtmRow.classList.remove('hidden');
        } else {
            customOtmRow.classList.add('hidden');
        }
        updateRecommendation();
        runBacktest();
    });
    
    customOtmValueInput.addEventListener('input', () => {
        updateRecommendation();
    });
    customOtmValueInput.addEventListener('change', () => {
        runBacktest();
    });
    
    optionContractsInput.addEventListener('input', () => {
        updateRecommendation();
    });
    optionContractsInput.addEventListener('change', () => {
        runBacktest();
    });
    
    btnRun.addEventListener('click', () => {
        runBacktest();
    });
}

// Handle Slider logic to ensure total weight equals exactly 100%
function handleWeightSliders() {
    const w981 = parseInt(slider981.value);
    const w991 = parseInt(slider991.value);
    const wFutures = parseInt(sliderFutures.value);
    
    val981.textContent = `${w981}%`;
    val991.textContent = `${w991}%`;
    valFutures.textContent = `${wFutures}%`;
    
    const sum = w981 + w991 + wFutures;
    
    if (sum !== 100) {
        weightErrorMsg.textContent = `⚠️ 總權重加總必須等於 100%（目前為 ${sum}%）！`;
        weightErrorMsg.style.color = 'var(--danger)';
        btnRun.disabled = true;
    } else {
        weightErrorMsg.textContent = `✅ 總權重加總等於 100%！`;
        weightErrorMsg.style.color = 'var(--success)';
        btnRun.disabled = false;
    }
}

// Estimate Delta based on strike rule name (since exact BS Delta is tied to strike)
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

// Solve required starting capital to cover N Sell Calls based on target Margin Maintenance Ratio
function solveRequiredCapital(row, optionType, optionCycle, strikeRule, portfolioMode) {
    const multiplier = optionType === 'taiex' ? 50 : 2000;
    const S_underlying = optionType === 'taiex' ? row.taiex : row.tsmc;
    const optionContracts = Math.max(1, parseInt(optionContractsInput.value) || 1);
    const targetRatio = parseFloat(targetMarginRatioInput.value) || 130;
    const ratioMultiplier = targetRatio / 100.0;
    
    let optInfo;
    let delta = 0.20;
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
        const beta981 = optionType === 'taiex' ? row.betas['981_taiex'] : row.betas['981_tsmc'];
        const beta991 = optionType === 'taiex' ? row.betas['991_taiex'] : row.betas['991_tsmc'];
        
        const val981 = (targetExposure * 0.40) / Math.max(beta981, 0.1);
        const val991 = (targetExposure * 0.40) / Math.max(beta991, 0.1);
        const valFutures = targetExposure * 0.20;
        
        // Calculate Maintenance Margins (11.5%)
        const maintMarginFutures = valFutures * 0.115;
        const optionMaintMargin = optionContracts * multiplier * (optInfo.premium + S_underlying * 0.115);
        
        // Cash buffer needed is target maintenance ratio * total maintenance margins
        const requiredCashBuffer = ratioMultiplier * (maintMarginFutures + optionMaintMargin);
        
        const totalRequired = val981 + val991 + requiredCashBuffer;
        return Math.round(totalRequired / 10000) * 10000;
    } else {
        // Manual mode solver
        const w981 = parseInt(slider981.value) / 100;
        const w991 = parseInt(slider991.value) / 100;
        const wFutures = parseInt(sliderFutures.value) / 100;
        const sumWeights = w981 + w991 + wFutures;
        const wCash = 1.0 - w981 - w991;
        
        if (sumWeights <= 0) return 1000000;
        
        // Option maintenance margin
        const optionMaintMargin = optionContracts * multiplier * (optInfo.premium + S_underlying * 0.115);
        
        // Solve capital such that capital * wCash = ratioMultiplier * (capital * wFutures * 11.5% + optionMaintMargin)
        const denom = wCash - ratioMultiplier * wFutures * 0.115;
        const resolvedCapital = denom > 0 ? (ratioMultiplier * optionMaintMargin) / denom : (optionContracts * multiplier * S_underlying) / sumWeights;
        
        return Math.round(resolvedCapital / 10000) * 10000;
    }
}

// Update Today's Build Position Recommendation Card
function updateRecommendation() {
    if (rawData.length === 0) return;
    
    // Use the last record
    const latestIdx = rawData.length - 1;
    const row = rawData[latestIdx];
    
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
        // Calculate today's recommended capital (based on latest market price)
        const todayCapital = solveRequiredCapital(row, optionType, optionCycle, strikeRule, portfolioMode);
        capital = todayCapital;
        // Show a hint under the capital input - do NOT overwrite it (backtest uses start-date price)
        const todayHint = document.getElementById('today-capital-hint');
        if (todayHint) {
            todayHint.textContent = `📅 今日建倉建議資金：${todayCapital.toLocaleString()} TWD（回測資金以開始日市價計算，可能不同）`;
            todayHint.style.display = 'block';
        }
    } else {
        const todayHint = document.getElementById('today-capital-hint');
        if (todayHint) todayHint.style.display = 'none';
    }
    
    // Set prices
    latestTaiexSpan.textContent = Math.round(row.taiex).toLocaleString();
    latestTsmcSpan.textContent = row.tsmc.toFixed(1);
    latest981Span.textContent = row.etf_981 ? row.etf_981.toFixed(2) : 'N/A';
    latest991Span.textContent = row.etf_991 ? row.etf_991.toFixed(2) : 'N/A';
    
    // Call info
    let optInfo;
    let delta = 0.20;
    if (strikeRule === 'CUSTOM_OTM') {
        const customOtmPct = parseFloat(customOtmValueInput.value) || 0;
        optInfo = getCustomOtmOption(row, optionType, optionCycle, customOtmPct);
        delta = optInfo.delta;
    } else {
        optInfo = row.options[optionType][optionCycle][strikeRule];
        delta = estimateDelta(strikeRule);
    }
    adviceStrike.textContent = `${optInfo.strike} (${optionType === 'taiex' ? '台指' : '台積電'}) [${optionCycle === 'weekly' ? '周選' : '月選'}] (賣出 ${optionContracts} 口)`;
    advicePremium.textContent = `${optInfo.premium} 點 (~${Math.round(optInfo.premium * (optionType === 'taiex' ? 50 : 2000) * optionContracts).toLocaleString()} TWD)`;
    
    let w981, w991, wFutures, wCash;
    
    if (portfolioMode === 'manual') {
        w981 = parseInt(slider981.value) / 100;
        w991 = parseInt(slider991.value) / 100;
        wFutures = parseInt(sliderFutures.value) / 100;
        wCash = Math.max(0, 1.0 - w981 - w991);
    } else {
        const targetExposure = optionContracts * (1.0 + delta) * multiplier * S_underlying; // target +1.0 Net Delta per contract (fully covered + premium harvesting)
        
        // Weights allocated: 40% 00981A, 40% 00991A, 20% TSMC Futures
        // Beta adjustments
        const beta981 = optionType === 'taiex' ? row.betas['981_taiex'] : row.betas['981_tsmc'];
        const beta991 = optionType === 'taiex' ? row.betas['991_taiex'] : row.betas['991_tsmc'];
        
        // Required Value = (targetExposure * Weight) / Beta
        const val981 = (targetExposure * 0.40) / Math.max(beta981, 0.1);
        const val991 = (targetExposure * 0.40) / Math.max(beta991, 0.1);
        
        // TSMC futures contract: covers 20% of target value exposure
        const valFutures = targetExposure * 0.20;
        
        // Convert to weights relative to starting capital
        w981 = Math.min(val981 / capital, 0.8);
        w991 = Math.min(val991 / capital, 0.8);
        wFutures = Math.min(valFutures / capital, 0.8);
        wCash = 1.0 - w981 - w991; // Cash accounts for spot buying. Futures requires margin (~15%).
        if (wCash < 0) {
            wCash = 0;
        }
    }
    
    // Update display weights
    adviceW981.textContent = `${(w981 * 100).toFixed(1)}%`;
    adviceW991.textContent = `${(w991 * 100).toFixed(1)}%`;
    adviceWCash.textContent = `${(wCash * 100).toFixed(1)}%`;
    
    // Qty Calculations
    const cash981 = capital * w981;
    const cash991 = capital * w991;
    const cashFuturesValue = capital * wFutures; // Exposure size
    const cashCash = capital * wCash;
    
    const qty981 = row.etf_981 ? Math.round(cash981 / row.etf_981) : 0;
    const qty991 = row.etf_991 ? Math.round(cash991 / row.etf_991) : 0;
    
    // Futures contract size (Mini TSMC Futures): 100 * price_tsmc
    const contractSize = 100 * row.tsmc;
    const qtyFutures = wFutures > 0 ? Math.max(1, Math.round(cashFuturesValue / contractSize)) : 0;
    // Futures maintenance margin is 11.5% of contract value
    const maintMarginFutures = qtyFutures * contractSize * 0.115;
    
    adviceQty981.textContent = row.etf_981 ? `${qty981.toLocaleString()} 股` : '未上市';
    adviceVal981.textContent = row.etf_981 ? `${Math.round(qty981 * row.etf_981).toLocaleString()} TWD` : '0 TWD';
    
    adviceQty991.textContent = row.etf_991 ? `${qty991.toLocaleString()} 股` : '未上市';
    adviceVal991.textContent = row.etf_991 ? `${Math.round(qty991 * row.etf_991).toLocaleString()} TWD` : '0 TWD';
    
    adviceQtyFutures.textContent = `${qtyFutures} 口`;
    
    const adviceQtyOptions = document.getElementById('advice-qty-options');
    if (adviceQtyOptions) {
        adviceQtyOptions.textContent = `${optionContracts} 口`;
    }
    
    // Calculate Margin Maintenance Ratio (整體保證金維持率)
    // Option maintenance margin is premium + 11.5% of underlying value
    const optionMaintMargin = optionContracts * multiplier * (optInfo.premium + S_underlying * 0.115);
    const totalMaintMargin = maintMarginFutures + optionMaintMargin;
    
    // Target margin based on configured ratio
    const targetRatio = parseFloat(targetMarginRatioInput.value) || 130;
    const targetMargin = totalMaintMargin * (targetRatio / 100);
    
    // Fill in total margin DOM elements
    const adviceValTotalMargin = document.getElementById('advice-val-total-margin');
    const adviceValTargetMargin = document.getElementById('advice-val-target-margin');
    
    if (adviceValTotalMargin) {
        adviceValTotalMargin.textContent = `${Math.round(totalMaintMargin).toLocaleString()} TWD`;
    }
    if (adviceValTargetMargin) {
        adviceValTargetMargin.textContent = `${Math.round(targetMargin).toLocaleString()} TWD`;
    }
    
    if (totalMaintMargin > 0) {
        const ratio = (cashCash / totalMaintMargin) * 100;
        adviceMarginRatio.textContent = `維持率: ${ratio.toFixed(0)}%`;
        if (ratio < 120) {
            adviceMarginRatio.style.color = 'var(--danger)'; // dangerous leverage
        } else if (ratio < 167) {
            adviceMarginRatio.style.color = 'var(--warning)'; // moderate leverage
        } else {
            adviceMarginRatio.style.color = 'var(--success)'; // safe leverage
        }
    } else {
        adviceMarginRatio.textContent = '維持率: 無部位';
        adviceMarginRatio.style.color = 'var(--text-muted)';
    }
    
    adviceValCash.textContent = `${Math.round(cashCash).toLocaleString()} TWD`;
}

// Backtesting Core Logic
function runBacktest() {
    if (rawData.length === 0) return;
    
    const startIdx = parseInt(startSelect.value);
    const endIdx = parseInt(endSelect.value);
    
    if (startIdx >= endIdx) {
        alert("開始日期必須早於結束日期！");
        return;
    }
    
    const optionType = optionTypeSelect.value;
    const optionCycle = optionCycleSelect.value;
    const strikeRule = strikeRuleSelect.value;
    const portfolioMode = portfolioModeSelect.value;
    const capitalMode = capitalModeSelect.value;
    
    // Setup manual weights
    const w981_pct = parseInt(slider981.value) / 100;
    const w991_pct = parseInt(slider991.value) / 100;
    const wFutures_pct = parseInt(sliderFutures.value) / 100;
    const wCash_pct = 1.0 - w981_pct - w991_pct - wFutures_pct;
    
    // Solve initial capital if auto-solve is enabled
    let initialCapital = parseFloat(capitalInput.value) || 1000000;
    if (capitalMode === 'auto-solve') {
        const startRow = rawData[startIdx];
        initialCapital = solveRequiredCapital(startRow, optionType, optionCycle, strikeRule, portfolioMode);
        capitalInput.value = initialCapital;
    }
    const optionContracts = Math.max(1, parseInt(optionContractsInput.value) || 1);
    
    // Simulation state
    let cash = initialCapital;
    let qty981 = 0;
    let qty991 = 0;
    let qtyFutures = 0;
    let entryTsmcPrice = 0;
    let activeOption = null; // { strike, premium, expiry_date }
    
    // Performance arrays
    const strategyEquity = [];
    const taiexEquity = [];
    const tsmcEquity = [];
    const dates = [];
    
    let marginCalls = 0;
    let optionCyclesCount = 0;
    let optionWinsCount = 0;
    let totalPremiumIncome = 0;
    
    // Benchmark baselines
    const initialTaiex = rawData[startIdx].taiex;
    const initialTsmc = rawData[startIdx].tsmc;
    
    const multiplier = optionType === 'taiex' ? 50 : 2000;
    
    // Daily Loop
    for (let i = startIdx; i <= endIdx; i++) {
        const row = rawData[i];
        const dateStr = row.date;
        dates.push(dateStr);
        
        const price_taiex = row.taiex;
        const price_tsmc = row.tsmc;
        const price_981 = row.etf_981;
        const price_991 = row.etf_991;
        
        const currentUnderlyingPrice = optionType === 'taiex' ? price_taiex : price_tsmc;
        
        // 1. Handle Expiration & Settlement (use >= to handle cases where expiry day is a holiday/missing record)
        if (activeOption && (dateStr >= activeOption.expiry_date || i === endIdx)) {
            const payoff = Math.max(0, currentUnderlyingPrice - activeOption.strike) * multiplier * optionContracts;
            cash -= payoff; // Pay option payoff
            
            const cyclePnL = (activeOption.premium * multiplier * optionContracts) - payoff;
            if (cyclePnL > 0) {
                optionWinsCount++;
            }
            optionCyclesCount++;
            activeOption = null; // Option settles and is cleared
        }
        
        // 2. Roll Option & Rebalance Portfolio on Roll Day
        const isRebalanceDay = (i === startIdx || activeOption === null);
        
        if (isRebalanceDay && i < endIdx) {
            // Liquidate current assets into cash
            if (qty981 > 0 && price_981) {
                cash += qty981 * price_981;
                qty981 = 0;
            }
            if (qty991 > 0 && price_991) {
                cash += qty991 * price_991;
                qty991 = 0;
            }
            if (qtyFutures > 0) {
                const futPnL = qtyFutures * 100 * (price_tsmc - entryTsmcPrice);
                cash += futPnL;
                qtyFutures = 0;
            }
            
            // Total account equity is now fully in cash
            const totalEquity = cash;
            
            // Sell new option
            let optInfo;
            let currentDelta = 0.20;
            if (strikeRule === 'CUSTOM_OTM') {
                const customOtmPct = parseFloat(customOtmValueInput.value) || 0;
                optInfo = getCustomOtmOption(row, optionType, optionCycle, customOtmPct);
                currentDelta = optInfo.delta;
            } else {
                optInfo = row.options[optionType][optionCycle][strikeRule];
                currentDelta = estimateDelta(strikeRule);
            }
            activeOption = {
                strike: optInfo.strike,
                premium: optInfo.premium,
                expiry_date: optionCycle === 'weekly' ? getNextWeeklyExpiryDate(dateStr) : getNextMonthlyExpiryDate(dateStr)
            };
            
            // Add premium received to cash
            cash += activeOption.premium * multiplier * optionContracts;
            totalPremiumIncome += activeOption.premium * multiplier * optionContracts;
            
            // Allocate weights based on pre-premium totalEquity
            let w981 = w981_pct;
            let w991 = w991_pct;
            let wFutures = wFutures_pct;
            
            if (portfolioMode === 'delta-neutral') {
                const delta = currentDelta;
                const targetExposure = optionContracts * (1.0 + delta) * multiplier * currentUnderlyingPrice;
                
                const beta981 = optionType === 'taiex' ? row.betas['981_taiex'] : row.betas['981_tsmc'];
                const beta991 = optionType === 'taiex' ? row.betas['991_taiex'] : row.betas['991_tsmc'];
                
                const val981 = (targetExposure * 0.40) / Math.max(beta981, 0.1);
                const val991 = (targetExposure * 0.40) / Math.max(beta991, 0.1);
                const valFutures = targetExposure * 0.20;
                
                w981 = Math.min(val981 / totalEquity, 0.8);
                w991 = Math.min(val991 / totalEquity, 0.8);
                wFutures = Math.min(valFutures / totalEquity, 0.8);
            }
            
            // Buy ETFs (deducting cash)
            qty981 = price_981 ? Math.floor((totalEquity * w981) / price_981) : 0;
            cash -= qty981 * (price_981 || 0);
            
            qty991 = price_991 ? Math.floor((totalEquity * w991) / price_991) : 0;
            cash -= qty991 * (price_991 || 0);
            
            // TSMC Futures (does not deduct cash directly, only margin is locked)
            const contractVal = 100 * price_tsmc;
            qtyFutures = wFutures > 0 ? Math.max(1, Math.round((totalEquity * wFutures) / contractVal)) : 0;
            entryTsmcPrice = price_tsmc;
        }
        
        // 3. Daily Mark-to-Market Valuation
        const etfValue981 = (qty981 > 0 && price_981) ? qty981 * price_981 : 0;
        const etfValue991 = (qty991 > 0 && price_991) ? qty991 * price_991 : 0;
        const futuresPnL = qtyFutures > 0 ? qtyFutures * 100 * (price_tsmc - entryTsmcPrice) : 0;
        
        let optionLiability = 0;
        if (activeOption) {
            // Calculate time to expiry in years
            const todayDate = new Date(dateStr);
            const expiryDate = new Date(activeOption.expiry_date);
            const daysToExpiry = Math.max(0, (expiryDate - todayDate) / (1000 * 60 * 60 * 24));
            const T = daysToExpiry / 365.0;
            
            const vol = optionType === 'taiex' ? row.taiex_vol : row.tsmc_vol;
            const r = 0.015;
            
            // Value the actual option we are holding (fixed strike activeOption.strike) using BS model
            const currentPremium = blackScholesCall(currentUnderlyingPrice, activeOption.strike, T, r, vol);
            optionLiability = currentPremium * multiplier * optionContracts;
        }
        
        const dailyEquity = cash + etfValue981 + etfValue991 + futuresPnL - optionLiability;
        strategyEquity.push(dailyEquity);
        
        // Benchmarks
        taiexEquity.push(initialCapital * (price_taiex / initialTaiex));
        tsmcEquity.push(initialCapital * (price_tsmc / initialTsmc));
        
        // 4. Margin Call check (using Maintenance Margin 11.5% to check for margin calls)
        const futuresMargin = qtyFutures * 100 * price_tsmc * 0.115;
        const optionMargin = activeOption ? (optionLiability + optionContracts * multiplier * currentUnderlyingPrice * 0.115) : 0;
        const totalRequiredMargin = futuresMargin + optionMargin;
        const freeCash = cash + futuresPnL;
        
        if (freeCash < totalRequiredMargin) {
            marginCalls++;
        }
    }
    
    // Performance Summary Calculations
    const finalEquity = strategyEquity[strategyEquity.length - 1];
    const totalReturnVal = (finalEquity - initialCapital) / initialCapital;
    
    // Calculate returns
    const dayCount = strategyEquity.length;
    const annualizedReturnVal = Math.pow(finalEquity / initialCapital, 365 / (dayCount * (365/252))) - 1; // trading day adjusted
    
    // Benchmark returns
    const finalTaiex = taiexEquity[taiexEquity.length - 1];
    const taiexReturnVal = (finalTaiex - initialCapital) / initialCapital;
    
    // Max Drawdown
    let maxDrawdownVal = 0;
    let peak = 0;
    strategyEquity.forEach(val => {
        if (val > peak) peak = val;
        const dd = (val - peak) / peak;
        if (dd < maxDrawdownVal) maxDrawdownVal = dd;
    });
    
    // Daily volatility & Sharpe
    const dailyReturns = [];
    for (let k = 1; k < strategyEquity.length; k++) {
        dailyReturns.push((strategyEquity[k] - strategyEquity[k-1]) / strategyEquity[k-1]);
    }
    
    const meanReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((sum, val) => sum + Math.pow(val - meanReturn, 2), 0) / dailyReturns.length;
    const dailyVol = Math.sqrt(variance);
    const annVol = dailyVol * Math.sqrt(252);
    
    // Sharpe (using risk-free rate 1.5%)
    const rf = 0.015;
    const sharpeVal = annVol > 0 ? (annualizedReturnVal - rf) / annVol : 0;
    
    // Update Metrics in DOM
    const returnSpan = document.getElementById('metric-total-return');
    returnSpan.textContent = `${totalReturnVal >= 0 ? '+' : ''}${(totalReturnVal * 100).toFixed(2)}%`;
    returnSpan.className = `metric-value ${totalReturnVal >= 0 ? 'positive' : 'negative'}`;
    
    const winRate = optionCyclesCount > 0 ? (optionWinsCount / optionCyclesCount) * 100 : 0;
    
    document.getElementById('metric-total-pnl').textContent = `TWD ${Math.round(finalEquity - initialCapital).toLocaleString()} | 大盤對比: ${taiexReturnVal >= 0 ? '+' : ''}${(taiexReturnVal * 100).toFixed(2)}%`;
    
    // Premium Metrics Update
    document.getElementById('metric-total-premium').textContent = `TWD ${Math.round(totalPremiumIncome).toLocaleString()}`;
    document.getElementById('metric-premium-yield').textContent = `選擇權勝率: ${winRate.toFixed(0)}% (共轉倉 ${optionCyclesCount} 次)`;
    
    document.getElementById('metric-sharpe').textContent = sharpeVal.toFixed(2);
    
    const mddSpan = document.getElementById('metric-mdd');
    mddSpan.textContent = `${(maxDrawdownVal * 100).toFixed(2)}%`;
    mddSpan.className = `metric-value negative`;
    
    // Margin Calls
    document.getElementById('metric-margin-calls').innerHTML = `保證金追繳次數: <span style="color: ${marginCalls > 0 ? 'var(--danger)' : 'inherit'}; font-weight:bold">${marginCalls}</span>`;
    
    // Render Chart
    renderChart(dates, strategyEquity, taiexEquity, tsmcEquity);
}

// Chart.js rendering
function renderChart(labels, strategyData, taiexData, tsmcData) {
    const ctx = document.getElementById('pnlChart').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    // Convert absolute equity to return percentage for better visualization
    const initialVal = strategyData[0];
    const strategyReturn = strategyData.map(v => ((v - initialVal) / initialVal) * 100);
    const taiexReturn = taiexData.map(v => ((v - initialVal) / initialVal) * 100);
    const tsmcReturn = tsmcData.map(v => ((v - initialVal) / initialVal) * 100);
    
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '本覆蓋權證策略 (Covered Call Portfolio)',
                    data: strategyReturn,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    borderWidth: 2.5,
                    pointRadius: 0,
                    tension: 0.1,
                    fill: true
                },
                {
                    label: '對比大盤基準 (TAIEX Index)',
                    data: taiexReturn,
                    borderColor: '#94a3b8',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    tension: 0.1,
                    fill: false
                },
                {
                    label: '對比台積電個股 (TSMC Stock)',
                    data: tsmcReturn,
                    borderColor: '#f59e0b',
                    borderWidth: 1.5,
                    pointRadius: 0,
                    tension: 0.1,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#cbd5e1',
                        font: {
                            family: 'Inter',
                            size: 11
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += (context.parsed.y >= 0 ? '+' : '') + context.parsed.y.toFixed(2) + '%';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.03)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        maxTicksLimit: 12,
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.03)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return (value >= 0 ? '+' : '') + value + '%';
                        },
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// normal distribution cumulative distribution function (approximate)
function normCdf(x) {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = (x < 0) ? -1 : 1;
    const absX = Math.abs(x) / Math.sqrt(2.0);

    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

    return 0.5 * (1.0 + sign * y);
}

// Black-Scholes call option pricing model
function blackScholesCall(S, K, T, r, sigma) {
    if (T <= 0) {
        return Math.max(0.0, S - K);
    }
    if (sigma <= 0) {
        return Math.max(0.0, S - K * Math.exp(-r * T));
    }
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    return S * normCdf(d1) - K * Math.exp(-r * T) * normCdf(d2);
}

// Helper to get next Wednesday expiry (in YYYY-MM-DD format)
function getNextWeeklyExpiryDate(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 3 is Wednesday, ..., 6 is Saturday
    let daysAhead = (3 - day + 7) % 7;
    if (daysAhead === 0) daysAhead = 7; // If today is Wednesday, roll to next Wednesday
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
}

// Helper to get third Wednesday of a month
function getThirdWednesday(year, month) {
    const d = new Date(year, month, 1);
    let day = d.getDay();
    let firstWed = (3 - day + 7) % 7 + 1;
    let thirdWed = firstWed + 14;
    return new Date(year, month, thirdWed);
}

// Helper to get next monthly expiry date (in YYYY-MM-DD format)
function getNextMonthlyExpiryDate(dateStr) {
    const d = new Date(dateStr);
    const currentThirdWed = getThirdWednesday(d.getFullYear(), d.getMonth());
    const currentThirdWedStr = currentThirdWed.toISOString().split('T')[0];
    
    if (dateStr >= currentThirdWedStr) {
        // Roll to next month's third Wednesday
        let nextMonth = d.getMonth() + 1;
        let year = d.getFullYear();
        if (nextMonth > 11) {
            nextMonth = 0;
            year += 1;
        }
        const nextThirdWed = getThirdWednesday(year, nextMonth);
        return nextThirdWed.toISOString().split('T')[0];
    } else {
        return currentThirdWedStr;
    }
}

// Helper to get custom OTM option strikes, premium, and BS delta dynamically
function getCustomOtmOption(row, optionType, optionCycle, customOtmPct) {
    const multiplier = optionType === 'taiex' ? 50 : 2000;
    const S = optionType === 'taiex' ? row.taiex : row.tsmc;
    const vol = optionType === 'taiex' ? row.taiex_vol : row.tsmc_vol;
    const r = 0.015;
    
    // Target expiry date
    const dateStr = row.date;
    const expiryDateStr = optionCycle === 'weekly' ? getNextWeeklyExpiryDate(dateStr) : getNextMonthlyExpiryDate(dateStr);
    
    // Calculate remaining days
    const dStart = new Date(dateStr);
    const dEnd = new Date(expiryDateStr);
    const days = Math.max((dEnd - dStart) / (1000 * 60 * 60 * 24), 0.1);
    const T = days / 365.0;
    
    // Strike Price K
    const K = S * (1.0 + customOtmPct / 100);
    const K_rounded = optionType === 'taiex' ? Math.round(K / 100) * 100 : Math.round(K / 10) * 10;
    
    // Calculate premium using Black-Scholes
    let premium = blackScholesCall(S, K_rounded, T, r, vol);
    
    // Enforce the minimum floors
    const minFloor = optionCycle === 'weekly' ? 0.5 : 1.0;
    premium = Math.max(premium, minFloor);
    
    // Estimate delta using exact BS formula: Delta = N(d1)
    let d1 = 0;
    if (vol > 0 && T > 0) {
        d1 = (Math.log(S / K_rounded) + (r + 0.5 * vol * vol) * T) / (vol * Math.sqrt(T));
    }
    const delta = normCdf(d1);
    
    return {
        strike: K_rounded,
        premium: Math.round(premium * 100) / 100,
        delta: delta
    };
}
