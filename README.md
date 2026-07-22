# Covered Call Portfolio Optimizer

台股主動型 ETF 搭配個股期貨之 Covered Call 策略回測系統

## 功能簡介

- **策略回測**：回測台股 Covered Call 策略，涵蓋 00981A（統一台股增長）、00991A（復華未來50）及小型台積電期貨（QFF）
- **自動 Delta 對沖模式**：依賣出選擇權的 Delta 自動調整現貨與期貨部位，維持淨多頭 Delta = +1.0
- **多種策略參數**：支援台指選擇權／台積電選擇權、周選／月選、ATM/OTM/Delta 等多種履約價規則
- **今日建倉建議**：根據最新市價，即時計算建議的部位大小與保證金需求
- **保證金追繳監控**：以 11.5%（期交所維持保證金標準）模擬保證金追繳次數

## 使用方式

1. 執行 `generate_data.py` 以抓取並產生 `data/data.json`
2. 啟動本地伺服器（例如：`python -m http.server 8000`）
3. 開啟瀏覽器前往 `http://localhost:8000`

## 資料來源

- 大盤（TAIEX）及台積電（2330.TW）股價：Yahoo Finance
- 00981A（0981.TW）、00991A（00991A.TW）：Yahoo Finance
- 選擇權資料：依 Black-Scholes 理論模型生成
- Beta 值：以歷史股價對大盤回歸計算

## 技術架構

- **前端**：純 HTML + Vanilla CSS + JavaScript
- **圖表**：Chart.js
- **定價模型**：Black-Scholes Call Option Pricing Model
- **字型**：Google Fonts（Inter, Noto Sans TC）

## 免責聲明

本系統僅供教育與研究用途，回測表現不代表未來收益。投資有風險，操作前請審慎評估。
