#!/usr/bin/env python3
"""Import Beyblade X battle tops (Series) from beyblade.phstudy.org into the quiz app."""

import json
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import patch_name_parts

BASE_URL = "https://beyblade.phstudy.org"
ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
IMAGE_DIR = ROOT / "assets" / "images" / "tops"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Referer": f"{BASE_URL}/",
    "Accept": "*/*",
}

HTML_TAG_RE = re.compile(r"<[^>]+>")


def fetch_json(path: str) -> dict:
    url = f"{BASE_URL}/{path.lstrip('/')}"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def merge_masterdata(target: dict, source: dict) -> None:
    if not source or "data" not in source:
        return
    for key, items in source.get("data", {}).items():
        target.setdefault("data", {}).setdefault(key, {})
        for item_id, entry in items.items():
            if item_id not in target["data"][key]:
                target["data"][key][item_id] = entry


LANG_KEYS = ("en-US", "ja-JP", "zh-TW")
OUT_KEYS = ("en", "ja", "zh")


def clean_name_text(text):
    if not text:
        return ""
    text = HTML_TAG_RE.sub("", text).strip()
    return text if text and text != "■" else ""


def names_from_obj(name_obj):
    result = {}
    for src, dst in zip(LANG_KEYS, OUT_KEYS):
        result[dst] = clean_name_text((name_obj or {}).get(src))
    for dst in OUT_KEYS:
        if not result[dst]:
            for other in OUT_KEYS:
                if result[other]:
                    result[dst] = result[other]
                    break
    return result


def localized_name(name_obj, lang="en-US"):
    names = names_from_obj(name_obj)
    short = {"en-US": "en", "ja-JP": "ja", "zh-TW": "zh"}.get(lang, "en")
    return names.get(short) or names.get("en") or ""


def slugify(series_id: str) -> str:
    return series_id.lower().replace("_", "-")


def image_candidates(blade_id):
    return [
        f"{BASE_URL}/images/site/Blade/{blade_id}.png",
        f"{BASE_URL}/images/site/Blade/{blade_id}.jpg",
        f"{BASE_URL}/images/app/Set/{blade_id}.png",
        f"{BASE_URL}/images/app/Blade/{blade_id}.png",
    ]


def download_image(blade_id: str, dest: Path) -> bool:
    if dest.exists() and dest.stat().st_size > 0:
        return True
    for url in image_candidates(blade_id):
        try:
            req = urllib.request.Request(url, headers={**HEADERS, "Accept": "image/*,*/*;q=0.8"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = resp.read()
                if len(data) < 200:
                    continue
                dest.write_bytes(data)
                return True
        except urllib.error.HTTPError:
            continue
        except urllib.error.URLError:
            continue
    return False


def build_series_entries(masterdata, lang="en-US"):
    series_map = masterdata.get("data", {}).get("BeybladeSeries", {})
    entries = []
    for series_id, item in series_map.items():
        if not series_id.startswith("SR-"):
            continue
        visible = item.get("collection_visible") or {}
        if not any(visible.values()):
            continue
        blade_id = item.get("blade_id") or series_id.replace("SR-", "BL-", 1)
        if blade_id.endswith("R"):
            continue
        names = names_from_obj(item.get("name") or {})
        if not names.get("en"):
            continue
        entries.append(
            {
                "id": slugify(series_id),
                "seriesId": series_id,
                "bladeId": blade_id,
                "name": names["en"],
                "names": names,
                "releaseAt": item.get("release_at"),
                "tags": item.get("tags") or [],
                "ratchetId": item.get("ratchet_id"),
                "bitId": item.get("bit_id"),
            }
        )
    entries.sort(key=lambda e: (e.get("releaseAt") or "", e.get("name") or ""))
    return entries


def main() -> int:
    lang = "en-US"
    if len(sys.argv) > 1:
        lang = sys.argv[1]

    print("Downloading master data…")
    masterdata = fetch_json("data/main.json")
    try:
        hardcoded = fetch_json("data/hardcoded.json")
        merge_masterdata(masterdata, hardcoded)
    except urllib.error.URLError as err:
        print(f"Warning: hardcoded.json not loaded ({err})")

    entries = build_series_entries(masterdata, lang)
    print(f"Found {len(entries)} visible battle tops (Series).")

    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    tops = []
    meta = []
    failed = []

    def process(entry):
        blade_id = entry["bladeId"]
        ext = ".png"
        rel_image = f"assets/images/tops/{entry['id']}{ext}"
        dest = ROOT / rel_image
        ok = download_image(blade_id, dest)
        if not ok:
            return None, entry, False
        quiz_top = {
            "id": entry["id"],
            "name": entry["name"],
            "names": entry["names"],
            "parts": patch_name_parts.parts_for_top(
                {"names": entry["names"], "name": entry["name"]}
            ),
            "image": rel_image.replace("\\", "/"),
        }
        full_meta = {**entry, "image": rel_image.replace("\\", "/"), "source": BASE_URL}
        return quiz_top, full_meta, True

    workers = 8
    done = 0
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(process, e): e for e in entries}
        for future in as_completed(futures):
            done += 1
            quiz_top, entry, ok = future.result()
            if ok and quiz_top:
                tops.append(quiz_top)
                meta.append(entry)
            else:
                failed.append(entry["seriesId"])
            if done % 25 == 0 or done == len(entries):
                print(f"  Images: {done}/{len(entries)} ({len(tops)} ok, {len(failed)} failed)")

    tops_path = DATA_DIR / "tops.json"
    meta_path = DATA_DIR / "tops-meta.json"
    tops_path.write_text(json.dumps({"tops": tops}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    meta_path.write_text(json.dumps({"tops": meta, "importedFrom": BASE_URL}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"\nWrote {len(tops)} tops to {tops_path}")
    print(f"Wrote metadata to {meta_path}")
    if failed:
        print(f"Failed downloads ({len(failed)}): {', '.join(failed[:10])}{'…' if len(failed) > 10 else ''}")
    return 0 if tops else 1


if __name__ == "__main__":
    raise SystemExit(main())
