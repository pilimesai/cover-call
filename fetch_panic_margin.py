"""Fetch TWSE daily margin trading and closing prices to compute Ex-ETF Margin Maintenance Ratio."""
import json
import os
import time
import urllib.request
from datetime import datetime, timedelta

DATA_PATH = os.path.join("data", "panic_margin.json")
HEADERS = {"User-Agent": "Mozilla/5.0"}


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def parse_num(val: str) -> float:
    s = str(val).replace(",", "").strip()
    if not s or s in ("--", "---", "X"):
        return 0.0
    try:
        return float(s)
    except ValueError:
        return 0.0


def fetch_day_data(date_str: str):
    """Fetch MI_MARGN and MI_INDEX for YYYYMMDD. Returns None if market closed."""
    m_url = f"https://www.twse.com.tw/rwd/zh/marginTrading/MI_MARGN?date={date_str}&selectType=ALL&response=json"
    i_url = f"https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX?date={date_str}&type=ALLBUT0999&response=json"

    m_json = fetch_json(m_url)
    if m_json.get("stat") != "OK":
        return None
    tables_m = m_json.get("tables", [])
    if len(tables_m) < 2:
        return None

    i_json = fetch_json(i_url)
    if i_json.get("stat") != "OK":
        return None

    closes = {}
    prev_closes = {}
    taiex_close = None
    for t in i_json.get("tables", []):
        title = t.get("title", "")
        if "價格指數" in title or "大盤統計" in title:
            for row in t.get("data", []):
                if row and "發行量加權股價指數" in str(row[0]):
                    taiex_close = parse_num(row[1])
        if "每日收盤行情" in title:
            for row in t.get("data", []):
                if len(row) >= 11:
                    code = str(row[0]).strip()
                    c = parse_num(row[8])
                    sign = -1.0 if "-" in str(row[9]) else 1.0
                    diff = parse_num(row[10]) * sign
                    if c > 0:
                        closes[code] = c
                        prev_closes[code] = max(0.01, c - diff)

    # Summary table (total market including ETFs)
    total_lots_prev = 0.0
    total_lots_today = 0.0
    for row in tables_m[0].get("data", []):
        if row and "融資(交易單位)" in str(row[0]):
            total_lots_prev = parse_num(row[4])
            total_lots_today = parse_num(row[5])

    stocks = {}
    for row in tables_m[1].get("data", []):
        if len(row) < 7:
            continue
        code = str(row[0]).strip()
        if code.startswith("00"):  # Exclude ETFs / ETNs
            continue
        buy_lots = parse_num(row[2])
        sell_lots = parse_num(row[3])
        repay_lots = parse_num(row[4])
        prev_lots = parse_num(row[5])
        today_lots = parse_num(row[6])
        if today_lots <= 0 and prev_lots <= 0:
            continue
        stocks[code] = {
            "buy": buy_lots,
            "sell": sell_lots,
            "repay": repay_lots,
            "prev": prev_lots,
            "today": today_lots,
        }

    return {
        "date": f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:]}",
        "taiex": taiex_close,
        "total_lots_prev": total_lots_prev,
        "total_lots_today": total_lots_today,
        "closes": closes,
        "prev_closes": prev_closes,
        "stocks": stocks,
    }


def main():
    os.makedirs("data", exist_ok=True)
    existing = {"history": [], "stock_debts": {}}
    if os.path.exists(DATA_PATH):
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                existing = json.load(f)
        except Exception:
            pass

    history = existing.get("history", [])
    stock_debts = existing.get("stock_debts", {})
    seen_dates = {row["date"] for row in history}

    if history:
        last_dt = datetime.strptime(history[-1]["date"], "%Y-%m-%d")
        start_dt = last_dt + timedelta(days=1)
    else:
        # Bootstrap ~45 calendar days (~32 trading days)
        start_dt = datetime.now() - timedelta(days=50)

    end_dt = datetime.now()
    cur = start_dt
    added = 0
    while cur <= end_dt:
        if cur.weekday() < 5:
            ds = cur.strftime("%Y-%m-%d")
            if ds not in seen_dates:
                try:
                    day = fetch_day_data(cur.strftime("%Y%m%d"))
                    if day:
                        total_mv_ex_etf = 0.0
                        total_debt_ex_etf = 0.0
                        ex_etf_lots_today = 0.0
                        ex_etf_lots_prev = 0.0
                        panic_cut_count = 0
                        below_130_count = 0

                        for code, st in day["stocks"].items():
                            c = day["closes"].get(code, 0.0)
                            if c <= 0:
                                continue
                            prev_c = day["prev_closes"].get(code, c)
                            prev_lots = st["prev"]
                            today_lots = st["today"]
                            ex_etf_lots_today += today_lots
                            ex_etf_lots_prev += prev_lots

                            prev_debt = stock_debts.get(code)
                            if prev_debt is None:
                                prev_debt = prev_lots * 1000.0 * prev_c * 0.60

                            if prev_lots > 0:
                                rem_ratio = max(0.0, (prev_lots - st["sell"] - st["repay"]) / prev_lots)
                            else:
                                rem_ratio = 0.0
                            new_debt = prev_debt * rem_ratio + st["buy"] * 1000.0 * c * 0.60

                            if today_lots <= 0:
                                stock_debts.pop(code, None)
                                continue

                            stock_debts[code] = new_debt
                            mv = today_lots * 1000.0 * c
                            total_mv_ex_etf += mv
                            total_debt_ex_etf += new_debt

                            if new_debt > 0:
                                ratio = (mv / new_debt) * 100.0
                                if ratio < 130.0:
                                    below_130_count += 1
                            if prev_lots >= 100 and (today_lots - prev_lots) / prev_lots <= -0.05 and c < prev_c * 0.97:
                                panic_cut_count += 1

                        maint_ratio = round((total_mv_ex_etf / total_debt_ex_etf) * 100.0, 2) if total_debt_ex_etf > 0 else None
                        lots_chg = round(ex_etf_lots_today - ex_etf_lots_prev)
                        lots_chg_pct = round(((ex_etf_lots_today - ex_etf_lots_prev) / ex_etf_lots_prev) * 100.0, 2) if ex_etf_lots_prev > 0 else 0.0

                        history.append({
                            "date": day["date"],
                            "taiex": day["taiex"],
                            "ex_etf_maint_ratio": maint_ratio,
                            "ex_etf_lots": round(ex_etf_lots_today),
                            "ex_etf_lots_chg": lots_chg,
                            "ex_etf_lots_chg_pct": lots_chg_pct,
                            "total_lots": round(day["total_lots_today"]),
                            "total_lots_chg": round(day["total_lots_today"] - day["total_lots_prev"]),
                            "below_130_stocks": below_130_count,
                            "panic_cut_stocks": panic_cut_count,
                        })
                        seen_dates.add(ds)
                        added += 1
                        print(f"[{day['date']}] Ex-ETF Maint={maint_ratio}% | Ex-ETF Lots Chg={lots_chg:+,} ({lots_chg_pct:+.2f}%) | <130% stocks={below_130_count} | PanicCut={panic_cut_count}")
                    time.sleep(0.35)
                except Exception as e:
                    print(f"Skip {ds}: {e}")
        cur += timedelta(days=1)

    history = history[-90:]
    out = {
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "latest": history[-1] if history else None,
        "history": history,
        "stock_debts": stock_debts,
    }
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(history)} days (added {added}) to {DATA_PATH}")


if __name__ == "__main__":
    main()
