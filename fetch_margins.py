"""抓取期交所 (TAIFEX) 股價指數類保證金一覽表，輸出 data/margins.json。

來源：https://www.taifex.com.tw/cht/5/indexMarging
抓取失敗時保留既有檔案，不影響 data.json 的產生。
"""
import json
import os
import re
import datetime

import requests

URL = "https://www.taifex.com.tw/cht/5/indexMarging"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "margins.json")

# 期交所表格名稱 -> 輸出鍵值
NAME_MAP = {
    "臺股期貨": "TX",
    "小型臺指": "MTX",
    "微型臺指期貨": "TMF",
    "臺指選擇權風險保證金(A)值": "TXO_A",
    "臺指選擇權風險保證金(B)值": "TXO_B",
    "臺指選擇權風險保證金(C)值": "TXO_C",
}


def _to_int(s):
    return int(s.replace(",", "").strip())


def fetch():
    resp = requests.get(URL, timeout=20, headers={"User-Agent": "Mozilla/5.0"})
    resp.raise_for_status()
    html = resp.text
    text = re.sub(r"<[^>]+>", " ", html)
    text = text.replace("&nbsp;", " ")
    text = re.sub(r"\s+", " ", text)

    result = {}
    for name, key in NAME_MAP.items():
        # 名稱後面依序為：結算保證金 維持保證金 原始保證金
        m = re.search(re.escape(name) + r"\s+([\d,]+)\s+([\d,]+)\s+([\d,]+)", text)
        if m:
            result[key] = {
                "clearing": _to_int(m.group(1)),
                "maintenance": _to_int(m.group(2)),
                "initial": _to_int(m.group(3)),
            }

    upd = re.search(r"更新日期[:：]\s*(\d{4}/\d{2}/\d{2})", text)
    required = {"MTX", "TXO_A", "TXO_B"}
    if not required.issubset(result.keys()):
        raise RuntimeError(f"解析失敗，只取得 {list(result.keys())}")

    return {
        "source": URL,
        "taifex_updated": upd.group(1) if upd else None,
        "fetched_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "margins": result,
    }


def main():
    try:
        data = fetch()
    except Exception as e:  # noqa: BLE001
        print(f"[margins] 抓取期交所保證金失敗，保留舊檔：{e}")
        return
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[margins] 已更新 {OUT}（期交所公告日 {data['taifex_updated']}）")


if __name__ == "__main__":
    main()

