#!/usr/bin/env python3
"""Add en / ja / zh names to tops.json from cached main.json (no image re-download)."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_TAG_RE = re.compile(r"<[^>]+>")
LANG_KEYS = ("en-US", "ja-JP", "zh-TW")
OUT_KEYS = ("en", "ja", "zh")


def clean(text):
    if not text:
        return ""
    text = HTML_TAG_RE.sub("", text).strip()
    return text if text and text != "■" else ""


def names_from_obj(name_obj):
    result = {}
    for src, dst in zip(LANG_KEYS, OUT_KEYS):
        result[dst] = clean((name_obj or {}).get(src))
    for dst in OUT_KEYS:
        if not result[dst]:
            for other in OUT_KEYS:
                if result[other]:
                    result[dst] = result[other]
                    break
    return result


def main():
    main_path = ROOT / "scripts" / "main.json"
    tops_path = ROOT / "data" / "tops.json"
    meta_path = ROOT / "data" / "tops-meta.json"

    with main_path.open(encoding="utf-8") as f:
        master = json.load(f)
    hard_path = ROOT / "scripts" / "hardcoded.json"
    if hard_path.exists():
        with hard_path.open(encoding="utf-8") as f:
            hard = json.load(f)
        for key, items in hard.get("data", {}).items():
            master.setdefault("data", {}).setdefault(key, {})
            for item_id, entry in items.items():
                if item_id not in master["data"][key]:
                    master["data"][key][item_id] = entry

    series_map = master["data"].get("BeybladeSeries", {})
    id_to_names = {}
    for series_id, item in series_map.items():
        slug = series_id.lower().replace("_", "-")
        id_to_names[slug] = names_from_obj(item.get("name"))

    with tops_path.open(encoding="utf-8") as f:
        data = json.load(f)

    for top in data.get("tops", []):
        names = id_to_names.get(top["id"])
        if names:
            top["names"] = names
            top["name"] = names["en"]

    tops_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    if meta_path.exists():
        with meta_path.open(encoding="utf-8") as f:
            meta = json.load(f)
        for top in meta.get("tops", []):
            names = id_to_names.get(top["id"])
            if names:
                top["names"] = names
        meta_path.write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print("Patched", len(data.get("tops", [])), "tops with en/ja/zh names")

    import patch_name_parts

    patch_name_parts.patch_file(tops_path)
    if meta_path.exists():
        patch_name_parts.patch_file(meta_path)
    print("Refreshed name parts (product / bey / combo)")


if __name__ == "__main__":
    main()
