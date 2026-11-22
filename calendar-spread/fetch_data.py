"""
抓取盤後公開資料，產生 data/market.json 供網頁（GitHub Pages）讀取。
由 GitHub Actions 每個交易日盤後自動執行，也可在本機手動執行：python fetch_data.py

資料來源：
- 期交所 OpenAPI：台指期（TX）各月份結算價 → 近／遠月價差
- 期交所歷史下載（futDataDown）：近 10 個交易日近遠月價差 → MA10
- 期交所 OpenAPI：三大法人台指期未平倉 → 投信淨多單、外資淨空單
- 期交所歷史下載（futContractsDateDown）：投信淨多單近 20 個交易日增減趨勢
- 銀行公會 TAIBOR：1 個月期定盤利率 → 無風險短期年利率
- 證交所：每日盤後統計（FMTQIK）→ 加權指數收盤與近 5 日漲跌幅
- 證交所：除權除息預告表（TWT48U）＋ 上市發行股數（t187ap03_L）＋ 每日收盤（STOCK_DAY_ALL）→ 自動計算區間成份股蒸發點數
"""

from __future__ import annotations

import csv
import io
import json
import re
import sys
import urllib.parse
import urllib.request
import zipfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

TPE = timezone(timedelta(hours=8))
OUT = Path(__file__).resolve().parent / "data" / "market.json"
UA = {"User-Agent": "Mozilla/5.0 (tx-calendar-spread-tool)", "Accept": "application/json"}

TAIFEX_FUT = "https://openapi.taifex.com.tw/v1/DailyMarketReportFut"
TAIFEX_INST = "https://openapi.taifex.com.tw/v1/MarketDataOfMajorInstitutionalTradersDetailsOfFuturesContractsBytheDate"
TAIFEX_INST_CSV = "https://www.taifex.com.tw/cht/3/futContractsDateDown"
TAIFEX_FUT_CSV = "https://www.taifex.com.tw/cht/3/futDataDown"
TAIBOR_DAILY_INDEX = "https://www.ba.org.tw/taiborDaily/index"
TAIBOR_DOWNLOAD_BASE = "https://www.ba.org.tw/taiborDaily/DownloadAll?id="
TWSE_EXDIV = "https://www.twse.com.tw/rwd/zh/exRight/TWT48U?response=json"
TWSE_FMTQIK = "https://www.twse.com.tw/rwd/zh/afterTrading/FMTQIK?date={ym}01&response=json"
TWSE_COMPANIES = "https://openapi.twse.com.tw/v1/opendata/t187ap03_L"
TWSE_STOCK_DAY_ALL = "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL"
TWSE_MI_INDEX_IND = "https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX?type=IND&response=json"


def get_json(url: str):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8-sig"))


def to_num(s):
    try:
        return float(str(s).replace(",", "").strip())
    except (TypeError, ValueError):
        return None


def fetch_tx() -> dict:
    rows = get_json(TAIFEX_FUT)
    tx = [
        r for r in rows
        if r.get("Contract") == "TX"
        and r.get("TradingSession") == "一般"
        and re.fullmatch(r"\d{6}", str(r.get("ContractMonth(Week)", "")))
    ]
    tx.sort(key=lambda r: r["ContractMonth(Week)"])
    if len(tx) < 2:
        raise RuntimeError("期交所資料中找不到兩個以上的台指期月份合約")

    def price(r):
        return to_num(r.get("SettlementPrice")) or to_num(r.get("Last"))

    near, far = tx[0], tx[1]
    near_p, far_p = price(near), price(far)
    return {
        "date": near.get("Date"),
        "near_month": near["ContractMonth(Week)"],
        "far_month": far["ContractMonth(Week)"],
        "near_price": near_p,
        "far_price": far_p,
        "spread": round(far_p - near_p, 2) if near_p and far_p else None,
    }


def fetch_recent_spreads(near_month: str, far_month: str) -> dict:
    """抓取近 25 日台指期日資料，計算近 10 個交易日的近遠月平均價差 (MA10)。"""
    end_d = datetime.now(TPE).date()
    start_d = end_d - timedelta(days=25)
    body = urllib.parse.urlencode(
        {
            "down_type": "1",
            "commodity_id": "TX",
            "queryStartDate": start_d.strftime("%Y/%m/%d"),
            "queryEndDate": end_d.strftime("%Y/%m/%d"),
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        TAIFEX_FUT_CSV,
        data=body,
        headers={"User-Agent": "Mozilla/5.0 (tx-calendar-spread-tool)"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        txt = resp.read().decode("big5", errors="ignore")

    by_date: dict[str, dict[str, float]] = {}
    for row in csv.reader(io.StringIO(txt)):
        if len(row) < 18:
            continue
        if row[1].strip() != "TX" or row[17].strip() != "一般":
            continue
        ym = row[2].strip()
        if ym not in (near_month, far_month):
            continue
        dt = row[0].strip().replace("/", "-")
        p_settle = to_num(row[10])
        p_close = to_num(row[6])
        p = p_settle if (p_settle is not None and p_settle > 0) else p_close
        if p is not None and p > 0:
            by_date.setdefault(dt, {})[ym] = p

    recent = []
    for dt in sorted(by_date):
        quotes = by_date[dt]
        if near_month in quotes and far_month in quotes:
            recent.append(
                {
                    "date": dt,
                    "spread": round(quotes[far_month] - quotes[near_month], 2),
                }
            )

    recent = recent[-10:]
    if not recent:
        raise RuntimeError("無法取得近 10 日台指期價差歷史資料")

    ma10 = round(sum(item["spread"] for item in recent) / len(recent), 2)
    return {
        "ma10_spread": ma10,
        "ma10_days": len(recent),
        "recent_spreads": recent,
    }


def fetch_institutional() -> tuple[dict, dict]:
    """同時取得外資淨空單與投信淨多單（台指期未平倉）。"""
    rows = get_json(TAIFEX_INST)
    foreign = None
    trust = None
    for r in rows:
        if r.get("ContractCode") != "臺股期貨":
            continue
        item = r.get("Item")
        net = int(to_num(r.get("OpenInterest(Net)")) or 0)
        if item == "外資及陸資":
            foreign = {"date": r.get("Date"), "oi_net": net, "net_short": max(0, -net)}
        elif item == "投信":
            trust = {"date": r.get("Date"), "oi_net": net, "net_long": max(0, net)}

    if foreign is None or trust is None:
        raise RuntimeError("期交所資料中找不到完整的外資或投信台指期未平倉")
    return foreign, trust


def fetch_trust_trend(latest_date_str: str | None = None, latest_net_long: int | None = None) -> dict:
    """抓取期交所近 50 個日曆日三大法人台指期歷史資料，計算投信淨多單近 20 個交易日增減趨勢。"""
    if latest_date_str and re.fullmatch(r"\d{8}", str(latest_date_str).strip()):
        end_d = datetime.strptime(str(latest_date_str).strip(), "%Y%m%d").date()
    else:
        end_d = datetime.now(TPE).date()
    start_d = end_d - timedelta(days=50)
    body = urllib.parse.urlencode(
        {
            "queryStartDate": start_d.strftime("%Y/%m/%d"),
            "queryEndDate": end_d.strftime("%Y/%m/%d"),
            "commodityId": "TXF",
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        TAIFEX_INST_CSV,
        data=body,
        headers={"User-Agent": UA["User-Agent"]},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        txt = resp.read().decode("big5", errors="ignore")

    if "<html" in txt.lower():
        raise RuntimeError("期交所投信歷史資料回傳非 CSV 格式")

    by_date: dict[str, int] = {}
    for row in csv.reader(io.StringIO(txt)):
        if len(row) < 14:
            continue
        if row[1].strip() != "臺股期貨" or row[2].strip() != "投信":
            continue
        raw_dt = row[0].strip().replace("/", "-")
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", raw_dt):
            continue
        oi_val = to_num(row[13])
        if oi_val is not None:
            by_date[raw_dt] = max(0, int(oi_val))

    series = [{"date": d, "net_long": by_date[d]} for d in sorted(by_date)]
    if latest_date_str and re.fullmatch(r"\d{8}", str(latest_date_str).strip()) and latest_net_long is not None:
        latest_iso = f"{latest_date_str[:4]}-{latest_date_str[4:6]}-{latest_date_str[6:8]}"
        if not series or latest_iso > series[-1]["date"]:
            series.append({"date": latest_iso, "net_long": max(0, int(latest_net_long))})

    if len(series) < 10:
        raise RuntimeError("投信台指期歷史資料日數不足")

    prev_idx = max(0, len(series) - 21)
    cur_item = series[-1]
    base_item = series[prev_idx]
    trend_days = len(series) - 1 - prev_idx
    change_20d = cur_item["net_long"] - base_item["net_long"]
    change_20d_pct = round((change_20d / base_item["net_long"]) * 100, 2) if base_item["net_long"] > 0 else None
    return {
        "prev_20d_date": base_item["date"],
        "prev_20d_net_long": base_item["net_long"],
        "change_20d": change_20d,
        "change_20d_pct": change_20d_pct,
        "trend_days": trend_days,
    }


def parse_taibor_zip(raw_bytes: bytes) -> dict:
    """從銀行公會 TAIBOR ZIP 檔內解析最新一筆 1 個月期定盤利率。"""
    with zipfile.ZipFile(io.BytesIO(raw_bytes)) as zf:
        for name in zf.namelist():
            raw = zf.read(name)
            txt = None
            for enc in ("big5", "utf-8-sig"):
                try:
                    txt = raw.decode(enc)
                    break
                except UnicodeDecodeError:
                    continue
            if txt is None:
                txt = raw.decode("big5", errors="ignore")

            rows = list(csv.reader(io.StringIO(txt)))
            header_idx = None
            date_col = None
            m1_col = None
            for idx, row in enumerate(rows):
                cells = [c.strip() for c in row]
                if "日期" in cells and "一個月" in cells:
                    header_idx = idx
                    date_col = cells.index("日期")
                    m1_col = cells.index("一個月")
                    break

            if header_idx is None:
                continue

            for row in rows[header_idx + 1:]:
                if len(row) <= max(date_col, m1_col):
                    continue
                date_str = row[date_col].strip()
                rate_val = to_num(row[m1_col])
                if not re.fullmatch(r"\d{2}[A-Za-z]{3}\d{2}", date_str) or rate_val is None:
                    continue
                dt_iso = datetime.strptime(date_str, "%d%b%y").strftime("%Y-%m-%d")
                m1_rate = round(rate_val, 3)
                return {
                    "date": dt_iso,
                    "source": "銀行公會 TAIBOR 1個月期",
                    "taibor_1m": m1_rate,
                    "annual_rate_pct": m1_rate,
                }

    raise RuntimeError("無法從銀行公會 TAIBOR 檔案解析一個月期利率")


def fetch_taibor_1m() -> dict:
    """抓取銀行公會最新交易日 TAIBOR 1 個月期公開短期利率。"""
    req = urllib.request.Request(
        TAIBOR_DAILY_INDEX,
        headers={"User-Agent": UA["User-Agent"], "Accept": "text/html,application/xhtml+xml"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        html = resp.read().decode("utf-8", errors="ignore")

    m = re.search(r"/taiborDaily/DownloadAll\?id=(\d+)", html)
    if not m:
        raise RuntimeError("銀行公會網頁找不到最新 TAIBOR 下載連結")

    dl_req = urllib.request.Request(
        TAIBOR_DOWNLOAD_BASE + m.group(1),
        headers={"User-Agent": UA["User-Agent"]},
    )
    with urllib.request.urlopen(dl_req, timeout=30) as resp:
        raw_bytes = resp.read()
    return parse_taibor_zip(raw_bytes)


def roc_to_iso(s: str) -> str | None:
    m = re.match(r"(\d+)[年/](\d+)[月/](\d+)日?", (s or "").strip())
    if not m:
        return None
    y, mo, d = (int(x) for x in m.groups())
    return f"{y + 1911:04d}-{mo:02d}-{d:02d}"


def fetch_taiex_5d() -> dict:
    """抓取證交所加權指數當月與前月日收盤，計算近 5 個交易日漲跌幅。"""
    now = datetime.now(TPE).date()
    first_of_month = now.replace(day=1)
    prev_month = first_of_month - timedelta(days=1)
    yms = [prev_month.strftime("%Y%m"), first_of_month.strftime("%Y%m")]

    by_date: dict[str, float] = {}
    for ym in yms:
        payload = get_json(TWSE_FMTQIK.format(ym=ym))
        if payload.get("stat") != "OK":
            continue
        for row in payload.get("data", []) or []:
            if len(row) < 5:
                continue
            date_iso = roc_to_iso(row[0])
            close_val = to_num(row[4])
            if date_iso and close_val is not None:
                by_date[date_iso] = close_val

    items = sorted(by_date.items())
    if len(items) < 6:
        raise RuntimeError("證交所加權指數歷史日數不足 6 個交易日")

    latest_date, latest_close = items[-1]
    base_date, base_close = items[-6]
    change_5d_pct = round((latest_close / base_close - 1) * 100, 2)
    recent_5d_changes = []
    start_idx = max(5, len(items) - 5)
    for idx in range(start_idx, len(items)):
        d_cur, c_cur = items[idx]
        _, c_base = items[idx - 5]
        recent_5d_changes.append({
            "date": d_cur,
            "change_5d_pct": round((c_cur / c_base - 1) * 100, 2),
        })
    return {
        "date": latest_date,
        "close": round(latest_close, 2),
        "base_date": base_date,
        "base_close": round(base_close, 2),
        "change_5d_pct": change_5d_pct,
        "recent_5d_changes": recent_5d_changes,
    }


def fetch_taiex_divisor(taiex_close: float | None) -> tuple[dict[str, float], float, dict]:
    """依上市普通股發行股數與收盤價估算加權指數總市值與指數基值（每點對應市值）。"""
    if taiex_close is None or taiex_close <= 0:
        mi_payload = get_json(TWSE_MI_INDEX_IND)
        for table in mi_payload.get("tables", []) or []:
            for row in table.get("data", []) or []:
                if row and str(row[0]).strip() == "發行量加權股價指數":
                    taiex_close = to_num(row[1])
                    break
            if taiex_close:
                break
    if not taiex_close or taiex_close <= 0:
        raise RuntimeError("無法取得發行量加權股價指數收盤值")

    companies = get_json(TWSE_COMPANIES)
    shares_map: dict[str, float] = {}
    for row in companies or []:
        code = str(row.get("公司代號") or "").strip()
        sh = to_num(row.get("已發行普通股數或TDR原股發行股數"))
        if code and sh and sh > 0:
            shares_map[code] = sh

    daily_all = get_json(TWSE_STOCK_DAY_ALL)
    closes_map: dict[str, float] = {}
    for row in daily_all or []:
        code = str(row.get("Code") or "").strip()
        c = to_num(row.get("ClosingPrice"))
        if code and c and c > 0:
            closes_map[code] = c

    matched = [c for c in shares_map if c in closes_map]
    total_mcap = sum(shares_map[c] * closes_map[c] for c in matched)
    if total_mcap <= 0:
        raise RuntimeError("無法匹配上市普通股市值以推算指數基值")

    divisor = total_mcap / taiex_close
    meta = {
        "taiex_close": round(taiex_close, 2),
        "total_market_cap_t": round(total_mcap / 1e12, 3),
        "divisor_b": round(divisor / 1e9, 4),
        "constituent_count": len(matched),
    }
    return shares_map, divisor, meta


def fetch_exdiv(shares_map: dict[str, float] | None = None, divisor: float | None = None) -> list[dict]:
    payload = get_json(TWSE_EXDIV)
    out = []
    for row in payload.get("data", []) or []:
        date_iso = roc_to_iso(row[0])
        if not date_iso:
            continue
        code = str(row[1]).strip()
        cash = to_num(row[7])
        is_constituent = bool(shares_map and code in shares_map)
        if not is_constituent:
            impact_points = 0.0
        elif cash is None:
            impact_points = None
        elif cash > 0 and divisor and divisor > 0:
            impact_points = round(shares_map[code] * cash / divisor, 3)
        else:
            impact_points = 0.0
        out.append({
            "date": date_iso,
            "code": code,
            "name": row[2],
            "type": row[3],
            "cash_dividend": cash,  # None 代表「待公告」
            "is_constituent": is_constituent,
            "impact_points": impact_points,
        })
    out.sort(key=lambda r: (r["date"], r["code"]))
    return out


def main() -> int:
    old = {}
    if OUT.exists():
        try:
            old = json.loads(OUT.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            old = {}

    result: dict = {"generated_at": datetime.now(TPE).isoformat(timespec="seconds"), "errors": []}

    try:
        tx_data = fetch_tx()
        try:
            ma_info = fetch_recent_spreads(tx_data["near_month"], tx_data["far_month"])
            tx_data.update(ma_info)
        except Exception as exc:
            result["errors"].append(f"tx_ma10: {exc}")
            old_tx = old.get("tx") or {}
            for k in ("ma10_spread", "ma10_days", "recent_spreads"):
                if k in old_tx:
                    tx_data[k] = old_tx[k]
        result["tx"] = tx_data
    except Exception as exc:
        result["errors"].append(f"tx: {exc}")
        if "tx" in old:
            result["tx"] = old["tx"]

    try:
        foreign_data, trust_data = fetch_institutional()
        try:
            trust_trend = fetch_trust_trend(trust_data.get("date"), trust_data.get("net_long"))
            trust_data.update(trust_trend)
        except Exception as exc:
            result["errors"].append(f"trust_trend: {exc}")
            old_trust = old.get("trust") or {}
            for k in ("prev_20d_date", "prev_20d_net_long", "change_20d", "change_20d_pct", "trend_days"):
                if k in old_trust:
                    trust_data[k] = old_trust[k]
        result["foreign"] = foreign_data
        result["trust"] = trust_data
    except Exception as exc:
        result["errors"].append(f"institutional: {exc}")
        if "foreign" in old:
            result["foreign"] = old["foreign"]
        if "trust" in old:
            result["trust"] = old["trust"]

    try:
        result["rate"] = fetch_taibor_1m()
    except Exception as exc:
        result["errors"].append(f"rate: {exc}")
        if "rate" in old:
            result["rate"] = old["rate"]

    try:
        result["taiex"] = fetch_taiex_5d()
    except Exception as exc:
        result["errors"].append(f"taiex: {exc}")
        if "taiex" in old:
            result["taiex"] = old["taiex"]

    try:
        shares_map, divisor, exdiv_meta = fetch_taiex_divisor(result.get("taiex", {}).get("close"))
        result["exdiv_meta"] = exdiv_meta
        result["exdiv"] = fetch_exdiv(shares_map, divisor)
    except Exception as exc:
        result["errors"].append(f"exdiv: {exc}")
        if "exdiv" in old:
            result["exdiv"] = old["exdiv"]
        if "exdiv_meta" in old:
            result["exdiv_meta"] = old["exdiv_meta"]

    if (
        OUT.exists()
        and len(result["errors"]) < 5
        and all(result.get(k) == old.get(k) for k in ("tx", "foreign", "trust", "rate", "taiex", "exdiv_meta", "exdiv"))
    ):
        print("Data unchanged, skipping write")
        return 0

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps({k: v for k, v in result.items() if k != "exdiv"}, ensure_ascii=False, indent=1))
    print(f"exdiv rows: {len(result.get('exdiv', []))}")
    return 0 if len(result["errors"]) < 5 else 1


if __name__ == "__main__":
    sys.exit(main())
