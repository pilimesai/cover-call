# 期交所即時報價 Cloudflare Worker 部署指南

這個小程式負責替 GitHub Pages 靜態網頁轉發期交所 `mis.taifex.com.tw` 的盤中即時報價，並加上 CORS 標頭，讓手機與桌面瀏覽器能每 15 秒取得**跨月價差複式單**與**五檔買賣價差**。

Cloudflare Workers 免費版每天提供 **100,000 次請求**，個人看盤使用綽綽有餘。

---

## 方法一：Cloudflare 網頁版貼上部署（免裝任何工具，約 2 分鐘）

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)（沒有帳號可免費註冊）。
2. 左側選單點 **Compute (Workers)** → **Workers & Pages** → **Create** → **Create Worker**（或 **Start with Hello World!**）。
3. 名稱填入 `tx-spread-live-proxy` → 點 **Deploy**。
4. 點 **Edit code**，把編輯器內預設程式碼**全部清空**，貼上本資料夾 [taifex-proxy.js](taifex-proxy.js) 的完整內容。
5. 點右上角 **Deploy** 儲存部署，畫面上方會顯示您的專屬網址，例如：
   ```
   https://tx-spread-live-proxy.你的帳號.workers.dev
   ```

---

## 方法二：使用 Wrangler CLI 部署（適合習慣終端機）

在 `worker/` 目錄執行：

```bash
npx wrangler login
npx wrangler deploy
```

部署成功後終端機就會印出 `https://tx-spread-live-proxy.<你的帳號>.workers.dev`。

---

## 連接到決策網頁

1. 打開手機或電腦上的決策網頁。
2. 在「⚡ 盤中即時報價」卡片點 **⚙️ 設定 API**。
3. 貼入剛剛取得的 Worker 網址並按 **儲存並抓取**，網址會自動儲存在瀏覽器中（也可直接打開 `你的網頁網址?api=https://tx-spread-live-proxy.xxx.workers.dev` 加書籤）。
4. 勾選 **⚡ 盤中即時 (15s)**，盤中就會自動更新跨月價差、台指點位與五檔價差。
