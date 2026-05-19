#!/usr/bin/env python3
"""Parse display names into product / bey / combo (+ optional extra) per language."""

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOPS_PATH = ROOT / "data" / "tops.json"
META_PATH = ROOT / "data" / "tops-meta.json"

PRODUCT_RE = re.compile(r"^((?:[A-Z]{2,4}(?:[GHC])?)(?:-\d+)+)")
COMBO_RE = re.compile(r"([S]?\d+-\d+[A-Za-z]+)")


def normalize(text):
    return unicodedata.normalize("NFKC", text or "").strip()


def preprocess(text):
    s = normalize(text)
    s = re.sub(
        r"(?<=[\u3040-\u9fff\u4e00-\u9fffA-Za-z])(?=[S]?\d+-\d+[A-Za-z])",
        " ",
        s,
    )
    return s


def parse_name(full_name):
    s = preprocess(full_name)
    if not s:
        return {"product": "", "bey": "", "combo": "", "extra": ""}

    product = ""
    rest = s
    match = PRODUCT_RE.match(s)
    if match:
        product = match.group(1)
        rest = s[match.end() :].strip()

    combo = ""
    combo_span = None
    for found in COMBO_RE.finditer(rest):
        combo_span = found

    if combo_span:
        combo = combo_span.group(1)
        bey = rest[: combo_span.start()].strip()
        extra = rest[combo_span.end() :].strip()
    else:
        bey = rest.strip()
        extra = ""

    return {
        "product": product,
        "bey": bey,
        "combo": combo,
        "extra": extra,
    }


def parts_for_top(top):
    names = top.get("names") or {}
    parts = {}
    for lang in ("en", "ja", "zh"):
        full = names.get(lang) or top.get("name") or ""
        parts[lang] = parse_name(full)
    return parts


def patch_file(path):
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    for top in data.get("tops", []):
        top["parts"] = parts_for_top(top)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return len(data.get("tops", []))


def main():
    count = patch_file(TOPS_PATH)
    if META_PATH.exists():
        patch_file(META_PATH)
    print("Patched name parts for", count, "tops")

    with TOPS_PATH.open(encoding="utf-8") as f:
        data = json.load(f)
    sample = next(t for t in data["tops"] if t["id"] == "sr-prd-910404-00")
    print("Sample zh parts:", json.dumps(sample["parts"]["zh"], ensure_ascii=False))


if __name__ == "__main__":
    main()
