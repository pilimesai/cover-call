import yfinance as yf
import pandas as pd
import numpy as np
import json
import datetime
import math
import os
import requests
import csv
import io

def fetch_taifex_institutional_options(start_date, end_date):
    """
    Fetch TAIFEX options institutional open interest data (外資 / 自營商 Buy/Sell Call/Put).
    Primary: FinMind REST API (works across all cloud runners & GitHub Actions).
    Fallback: TAIFEX official CSV download.
    """
    records = {}
    
    # 1. Primary: FinMind API
    try:
        s_str = start_date.strftime("%Y-%m-%d")
        e_str = end_date.strftime("%Y-%m-%d")
        print(f"Fetching institutional options via FinMind ({s_str} ~ {e_str})...")
        url = f"https://api.finmindtrade.com/api/v4/data?dataset=TaiwanOptionInstitutionalInvestors&data_id=TXO&start_date={s_str}&end_date={e_str}"
        resp = requests.get(url, timeout=20)
        if resp.status_code == 200:
            data = resp.json().get("data", [])
            for row in data:
                d = row.get("date")
                if not d: continue
                if d not in records: records[d] = {}
                inst = row.get("institutional_investors", "")
                cp = row.get("call_put", "")
                
                is_foreign = "\u5916\u8cc7" in inst or "foreign" in inst.lower()
                is_dealer = "\u81ea\u71df" in inst or "dealer" in inst.lower()
                is_trust = "\u6295\u4fe1" in inst or "trust" in inst.lower()
                is_call = "\u8cb7" in cp or "call" in cp.lower()
                is_put = "\u8ce3" in cp or "put" in cp.lower()
                
                prefix = "foreign" if is_foreign else ("dealer" if is_dealer else ("trust" if is_trust else "other"))
                cp_tag = "call" if is_call else ("put" if is_put else "unknown")
                if prefix == "other" or cp_tag == "unknown": continue
                
                records[d][f"{prefix}_{cp_tag}_b_cnt"] = int(row.get("long_open_interest_balance_volume", 0))
                records[d][f"{prefix}_{cp_tag}_b_amt"] = int(row.get("long_open_interest_balance_amount", 0))
                records[d][f"{prefix}_{cp_tag}_s_cnt"] = int(row.get("short_open_interest_balance_volume", 0))
                records[d][f"{prefix}_{cp_tag}_s_amt"] = int(row.get("short_open_interest_balance_amount", 0))
            print(f"Successfully fetched {len(records)} dates from FinMind.")
    except Exception as e:
        print(f"Notice: FinMind fetch error: {e}")

    # 2. Fallback to TAIFEX official CSV if FinMind returned 0 records
    if len(records) == 0:
        print(f"Falling back to TAIFEX official CSV download ({start_date} ~ {end_date})...")
        url = "https://www.taifex.com.tw/cht/3/callsAndPutsDateDown"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Referer": "https://www.taifex.com.tw/cht/3/callsAndPutsDate"
        }
        cur = start_date
        while cur <= end_date:
            nxt = min(cur + datetime.timedelta(days=60), end_date)
            s_str = cur.strftime("%Y/%m/%d")
            e_str = nxt.strftime("%Y/%m/%d")
            try:
                resp = requests.post(url, data={"queryStartDate": s_str, "queryEndDate": e_str}, headers=headers, timeout=15)
                if resp.status_code == 200 and len(resp.content) >= 1000:
                    f = io.StringIO(resp.content.decode("cp950", errors="ignore"))
                    reader = csv.reader(f)
                    next(reader, None)
                    for r in reader:
                        if len(r) > 13 and "\u81fa\u6307\u9078\u64c7\u6b0a" in r[1]:
                            d = r[0].replace("/", "-")
                            cp = r[2].strip().lower() # call or put
                            inst = r[3].strip()
                            if d not in records: records[d] = {}
                            try:
                                b_cnt, b_amt = int(r[10].replace(",", "")), int(r[11].replace(",", ""))
                                s_cnt, s_amt = int(r[12].replace(",", "")), int(r[13].replace(",", ""))
                            except ValueError:
                                continue
                            prefix = "foreign" if "\u5916\u8cc7" in inst else ("dealer" if "\u81ea\u71df" in inst else "trust")
                            tag = f"{prefix}_{cp}"
                            records[d][f"{tag}_b_cnt"] = b_cnt
                            records[d][f"{tag}_b_amt"] = b_amt
                            records[d][f"{tag}_s_cnt"] = s_cnt
                            records[d][f"{tag}_s_amt"] = s_amt
            except Exception as e:
                print(f"Warning: TAIFEX CSV fetch error for {s_str} ~ {e_str}: {e}")
            cur = nxt + datetime.timedelta(days=1)
        print(f"TAIFEX CSV fetched records for {len(records)} dates.")

    return records

def norm_cdf(x):
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))

def norm_ppf(p):
    low, high = -8.0, 8.0
    for _ in range(50):
        mid = (low + high) / 2.0
        val = norm_cdf(mid)
        if val < p:
            low = mid
        else:
            high = mid
    return (low + high) / 2.0

# Black-Scholes formula
def black_scholes_call(S, K, T, r, sigma):
    if T <= 0:
        return max(0.0, S - K)
    if sigma <= 0:
        return max(0.0, S - K * math.exp(-r * T))
    
    d1 = (math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    
    price = S * norm_cdf(d1) - K * math.exp(-r * T) * norm_cdf(d2)
    return price

# Get strike price for a specific delta
def strike_for_delta(S, delta, T, r, sigma):
    if T <= 0 or sigma <= 0:
        return S
    d1 = norm_ppf(delta)
    K = S * math.exp((r + 0.5 * sigma ** 2) * T - d1 * sigma * math.sqrt(T))
    return K

# Expiration helper (Monthly: Third Wednesday)
def get_third_wednesday(year, month):
    first_day = datetime.date(year, month, 1)
    first_weekday = first_day.weekday() # Monday is 0, Sunday is 6
    first_wed_day = (2 - first_weekday) % 7 + 1
    third_wed_day = first_wed_day + 14
    return datetime.date(year, month, third_wed_day)

def get_next_expiration(current_date):
    expiry = get_third_wednesday(current_date.year, current_date.month)
    if current_date > expiry:
        next_month = current_date.month + 1
        next_year = current_date.year
        if next_month > 12:
            next_month = 1
            next_year += 1
        expiry = get_third_wednesday(next_year, next_month)
    return expiry

# Expiration helper (Weekly: Next Wednesday)
def get_weekly_expiration(current_date):
    days_ahead = (2 - current_date.weekday()) % 7
    return current_date + datetime.timedelta(days=days_ahead)

def main():
    # Load existing data.json to preserve historical data
    existing_inst_map = {}
    if os.path.exists("data/data.json"):
        try:
            with open("data/data.json", "r", encoding="utf-8") as f:
                old_records = json.load(f)
                for item in old_records:
                    if item.get("institutional_options"):
                        existing_inst_map[item["date"]] = item["institutional_options"]
            print(f"Loaded {len(existing_inst_map)} existing institutional_options records for preservation.")
        except Exception as e:
            print(f"Notice: Could not load existing data.json: {e}")

    print("Starting data generation pipeline...")
    
    # 1. Fetching historical data
    tickers = {
        "taiex": "^TWII",
        "tsmc": "2330.TW",
        "etf_0050": "0050.TW",
        "etf_981": "00981A.TW",
        "etf_991": "00991A.TW"
    }
    
    start_date = "2025-05-01"
    end_date = (datetime.date.today() + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    
    dfs = {}
    for name, ticker in tickers.items():
        print(f"Downloading {ticker}...")
        df = yf.download(ticker, start=start_date, end=end_date, auto_adjust=False)
        if df.empty:
            raise ValueError(f"Failed to download data for {ticker}")
        
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
        
        # When Yahoo Finance hasn't finalized today's Close yet, fall back to Open price
        if "Close" in df.columns and "Open" in df.columns:
            df["Close"] = df["Close"].combine_first(df["Open"])
        if "Adj Close" in df.columns and "Open" in df.columns:
            df["Adj Close"] = df["Adj Close"].combine_first(df["Open"])
            
        if name == "taiex":
            dfs[name] = df["Close"] # Option strikes are based on the standard Price Index
        else:
            dfs[name] = df["Adj Close"] # Spot assets (TSMC, ETFs) include all dividends (還原收盤價)

    df_aligned = pd.DataFrame(dfs)
    df_aligned = df_aligned.dropna(subset=["taiex", "tsmc"])
    df_aligned = df_aligned.sort_index()
    
    df_aligned["etf_0050"] = df_aligned["etf_0050"].ffill()
    df_aligned["etf_981"] = df_aligned["etf_981"].ffill()
    df_aligned["etf_991"] = df_aligned["etf_991"].ffill()
    
    returns = df_aligned.pct_change()
    
    # 2. Volatilities (20-day rolling annualized standard deviation)
    df_aligned["taiex_vol"] = returns["taiex"].rolling(20).std() * math.sqrt(252)
    df_aligned["tsmc_vol"] = returns["tsmc"].rolling(20).std() * math.sqrt(252)
    
    df_aligned["taiex_vol"] = df_aligned["taiex_vol"].bfill()
    df_aligned["tsmc_vol"] = df_aligned["tsmc_vol"].bfill()
    
    # 3. Rolling 30-day Betas
    rolling_window = 30
    
    def calculate_rolling_beta(asset_ret, market_ret, window):
        cov = asset_ret.rolling(window).cov(market_ret)
        var = market_ret.rolling(window).var()
        beta = cov / var
        return beta.bfill()
    
    df_aligned["beta_0050_taiex"] = calculate_rolling_beta(returns["etf_0050"], returns["taiex"], rolling_window)
    df_aligned["beta_981_taiex"] = calculate_rolling_beta(returns["etf_981"], returns["taiex"], rolling_window)
    df_aligned["beta_991_taiex"] = calculate_rolling_beta(returns["etf_991"], returns["taiex"], rolling_window)
    df_aligned["beta_0050_tsmc"] = calculate_rolling_beta(returns["etf_0050"], returns["tsmc"], rolling_window)
    df_aligned["beta_981_tsmc"] = calculate_rolling_beta(returns["etf_981"], returns["tsmc"], rolling_window)
    df_aligned["beta_991_tsmc"] = calculate_rolling_beta(returns["etf_991"], returns["tsmc"], rolling_window)
    
    df_aligned["beta_0050_taiex"] = df_aligned["beta_0050_taiex"].fillna(1.0)
    df_aligned["beta_981_taiex"] = df_aligned["beta_981_taiex"].fillna(1.0)
    df_aligned["beta_991_taiex"] = df_aligned["beta_991_taiex"].fillna(1.0)
    df_aligned["beta_0050_tsmc"] = df_aligned["beta_0050_tsmc"].fillna(1.0)
    df_aligned["beta_981_tsmc"] = df_aligned["beta_981_tsmc"].fillna(1.0)
    df_aligned["beta_991_tsmc"] = df_aligned["beta_991_tsmc"].fillna(1.0)
    
    # 4. Generate options chains
    r = 0.015
    output_records = []
    
    for idx, row in df_aligned.iterrows():
        date_str = idx.strftime("%Y-%m-%d")
        current_date = idx.date()
        
        # Calculate expirations (ensuring that options sold on settlement day expire next period)
        days_ahead = (2 - current_date.weekday()) % 7
        if days_ahead == 0:
            days_ahead = 7
        expiry_date_weekly = current_date + datetime.timedelta(days=days_ahead)
        
        expiry_monthly = get_third_wednesday(current_date.year, current_date.month)
        if current_date >= expiry_monthly:
            next_month = current_date.month + 1
            next_year = current_date.year
            if next_month > 12:
                next_month = 1
                next_year += 1
            expiry_monthly = get_third_wednesday(next_year, next_month)
        expiry_date_monthly = expiry_monthly
        
        days_to_expiry_monthly = (expiry_date_monthly - current_date).days
        days_to_expiry_weekly = (expiry_date_weekly - current_date).days
        
        T_m = max(days_to_expiry_monthly, 0.1) / 365.0
        T_w = max(days_to_expiry_weekly, 0.1) / 365.0
        
        options_data = {
            "taiex": {"weekly": {}, "monthly": {}},
            "tsmc": {"weekly": {}, "monthly": {}}
        }
        
        # TAIEX Underlyings
        S_taiex = float(row["taiex"])
        vol_taiex = float(row["taiex_vol"])
        
        # TSMC Underlyings
        S_tsmc = float(row["tsmc"])
        vol_tsmc = float(row["tsmc_vol"])
        
        # Generate Option prices for TAIEX (Monthly & Weekly)
        for term, T_term in [("weekly", T_w), ("monthly", T_m)]:
            taiex_strikes = {
                "ATM": S_taiex,
                "OTM_2": S_taiex * 1.02,
                "OTM_5": S_taiex * 1.05,
                "OTM_10": S_taiex * 1.10,
                "DELTA_3": strike_for_delta(S_taiex, 0.3, T_term, r, vol_taiex),
                "DELTA_2": strike_for_delta(S_taiex, 0.2, T_term, r, vol_taiex),
                "DELTA_1": strike_for_delta(S_taiex, 0.1, T_term, r, vol_taiex)
            }
            for name, K in taiex_strikes.items():
                K_rounded = round(K / 100) * 100
                premium = black_scholes_call(S_taiex, K_rounded, T_term, r, vol_taiex)
                # Enforce a realistic minimum floor for far OTM options
                min_floor = 0.5 if term == "weekly" else 1.0
                premium = max(premium, min_floor)
                options_data["taiex"][term][name] = {
                    "strike": int(K_rounded),
                    "premium": round(premium, 2)
                }
                
        # Generate Option prices for TSMC (Monthly & Weekly)
        for term, T_term in [("weekly", T_w), ("monthly", T_m)]:
            tsmc_strikes = {
                "ATM": S_tsmc,
                "OTM_2": S_tsmc * 1.02,
                "OTM_5": S_tsmc * 1.05,
                "OTM_10": S_tsmc * 1.10,
                "DELTA_3": strike_for_delta(S_tsmc, 0.3, T_term, r, vol_tsmc),
                "DELTA_2": strike_for_delta(S_tsmc, 0.2, T_term, r, vol_tsmc),
                "DELTA_1": strike_for_delta(S_tsmc, 0.1, T_term, r, vol_tsmc)
            }
            for name, K in tsmc_strikes.items():
                K_rounded = round(K / 10) * 10
                premium = black_scholes_call(S_tsmc, K_rounded, T_term, r, vol_tsmc)
                # Enforce a realistic minimum floor for far OTM options
                min_floor = 0.5 if term == "weekly" else 1.0
                premium = max(premium, min_floor)
                options_data["tsmc"][term][name] = {
                    "strike": int(K_rounded),
                    "premium": round(premium, 2)
                }
                
        record = {
            "date": date_str,
            "taiex": S_taiex,
            "tsmc": S_tsmc,
            "etf_0050": None if pd.isna(row["etf_0050"]) else float(row["etf_0050"]),
            "etf_981": None if pd.isna(row["etf_981"]) else float(row["etf_981"]),
            "etf_991": None if pd.isna(row["etf_991"]) else float(row["etf_991"]),
            "taiex_vol": vol_taiex,
            "tsmc_vol": vol_tsmc,
            "expiry_date_monthly": expiry_date_monthly.strftime("%Y-%m-%d"),
            "expiry_date_weekly": expiry_date_weekly.strftime("%Y-%m-%d"),
            "days_to_expiry_monthly": days_to_expiry_monthly,
            "days_to_expiry_weekly": days_to_expiry_weekly,
            "betas": {
                "0050_taiex": float(row["beta_0050_taiex"]),
                "981_taiex": float(row["beta_981_taiex"]),
                "991_taiex": float(row["beta_991_taiex"]),
                "0050_tsmc": float(row["beta_0050_tsmc"]),
                "981_tsmc": float(row["beta_981_tsmc"]),
                "991_tsmc": float(row["beta_991_tsmc"])
            },
            "options": options_data
        }
        output_records.append(record)
        
    # Fetch TAIFEX institutional options data
    try:
        start_d = datetime.date(2025, 5, 1)
        end_d = datetime.date.today()
        taifex_records = fetch_taifex_institutional_options(start_d, end_d)
        
        # Sort output_records by date and calculate daily deltas
        output_records.sort(key=lambda x: x["date"])
        prev_taifex = None
        for r in output_records:
            d_str = r["date"]
            t_data = taifex_records.get(d_str, {})
            # If fresh data was fetched for this date
            if t_data:
                f_bp_amt = t_data.get("foreign_put_b_amt", 0)
                f_sp_cnt = t_data.get("foreign_put_s_cnt", 0)
                f_sp_amt = t_data.get("foreign_put_s_amt", 0)
                
                f_bc_cnt = t_data.get("foreign_call_b_cnt", 0)
                f_bc_amt = t_data.get("foreign_call_b_amt", 0)
                f_sc_cnt = t_data.get("foreign_call_s_cnt", 0)
                f_sc_amt = t_data.get("foreign_call_s_amt", 0)
                
                d_bp_amt = t_data.get("dealer_put_b_amt", 0)
                d_sp_amt = t_data.get("dealer_put_s_amt", 0)
                d_bc_amt = t_data.get("dealer_call_b_amt", 0)
                d_sc_amt = t_data.get("dealer_call_s_amt", 0)
                
                if prev_taifex:
                    sp_diff = f_sp_amt - prev_taifex.get("foreign_put_s_amt", 0)
                    bp_diff = f_bp_amt - prev_taifex.get("foreign_put_b_amt", 0)
                    foreign_sp_bp_diff = sp_diff - bp_diff
                    
                    bc_diff = f_bc_amt - prev_taifex.get("foreign_call_b_amt", 0)
                    sc_diff = f_sc_amt - prev_taifex.get("foreign_call_s_amt", 0)
                    foreign_bc_sc_diff = bc_diff - sc_diff
                else:
                    foreign_sp_bp_diff = 0
                    foreign_bc_sc_diff = 0
                
                r["institutional_options"] = {
                    "foreign_bp_amt": f_bp_amt,
                    "foreign_sp_cnt": f_sp_cnt,
                    "foreign_sp_amt": f_sp_amt,
                    "foreign_sp_bp_diff": foreign_sp_bp_diff,
                    "foreign_bc_cnt": f_bc_cnt,
                    "foreign_bc_amt": f_bc_amt,
                    "foreign_sc_cnt": f_sc_cnt,
                    "foreign_sc_amt": f_sc_amt,
                    "foreign_bc_sc_diff": foreign_bc_sc_diff,
                    "dealer_bp_amt": d_bp_amt,
                    "dealer_sp_amt": d_sp_amt,
                    "dealer_bc_amt": d_bc_amt,
                    "dealer_sc_amt": d_sc_amt
                }
                prev_taifex = t_data
            elif d_str in existing_inst_map:
                # PRESERVE existing valid institutional_options! Never overwrite with None!
                r["institutional_options"] = existing_inst_map[d_str]
                prev_taifex = {
                    "foreign_put_b_amt": existing_inst_map[d_str].get("foreign_bp_amt", 0),
                    "foreign_put_s_cnt": existing_inst_map[d_str].get("foreign_sp_cnt", 0),
                    "foreign_put_s_amt": existing_inst_map[d_str].get("foreign_sp_amt", 0),
                    "foreign_call_b_cnt": existing_inst_map[d_str].get("foreign_bc_cnt", 0),
                    "foreign_call_b_amt": existing_inst_map[d_str].get("foreign_bc_amt", 0),
                    "foreign_call_s_cnt": existing_inst_map[d_str].get("foreign_sc_cnt", 0),
                    "foreign_call_s_amt": existing_inst_map[d_str].get("foreign_sc_amt", 0)
                }
            else:
                r["institutional_options"] = None
    except Exception as e:
        print(f"Warning: Failed to process TAIFEX options data: {e}")

    os.makedirs("data", exist_ok=True)
    with open("data/data.json", "w", encoding="utf-8") as f:
        json.dump(output_records, f, indent=2, ensure_ascii=False)
        
    print(f"Data generation complete! Written {len(output_records)} records to data/data.json.")

if __name__ == "__main__":
    main()
