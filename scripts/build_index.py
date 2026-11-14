#!/usr/bin/env python3
"""Validate notes/*.md and generate assets/notes-data.js.

Usage (from the repository root):
    python3 scripts/build_index.py

Exits with status 1 and writes nothing if any note has an error.
Python standard library only.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NOTES_DIR = ROOT / "notes"
OUT_FILE = ROOT / "assets" / "notes-data.js"

CATEGORIES = {"study", "project", "note"}
STATUSES = {"staging", "active", "archived"}
AUTHORS = {"user", "ai"}
REQUIRED = ["title", "category", "status", "author", "created", "updated", "summary"]
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
WIKILINK_RE = re.compile(r"\[\[([a-z0-9-]+)\]\]")
MAX_LINES = 150
MAX_SUMMARY = 140


def parse_value(raw):
    value = raw.strip()
    if value.startswith("[") and value.endswith("]"):
        inner = value[1:-1]
        return [x.strip().strip("\"'") for x in inner.split(",") if x.strip()]
    return value.strip("\"'")


def split_frontmatter(text):
    if not text.startswith("---\n"):
        return None, text
    end = text.find("\n---", 4)
    if end == -1:
        return None, text
    block = text[4:end]
    body = text[end + 4:].lstrip("\n")
    meta = {}
    for line in block.split("\n"):
        if not line.strip():
            continue
        if ":" not in line:
            continue
        key, _, raw = line.partition(":")
        meta[key.strip()] = parse_value(raw)
    return meta, body


def check_note(path, meta, body, errors, warnings):
    name = path.name
    slug = path.stem

    if not SLUG_RE.match(slug):
        errors.append(f"{name}: file name must be lowercase words joined by hyphens")
    if meta is None:
        errors.append(f"{name}: missing frontmatter block (--- ... ---)")
        return
    for key in REQUIRED:
        if not meta.get(key):
            errors.append(f"{name}: missing required field '{key}'")
    if meta.get("category") and meta["category"] not in CATEGORIES:
        errors.append(f"{name}: category must be one of {sorted(CATEGORIES)}")
    if meta.get("status") and meta["status"] not in STATUSES:
        errors.append(f"{name}: status must be one of {sorted(STATUSES)}")
    if meta.get("author") and meta["author"] not in AUTHORS:
        errors.append(f"{name}: author must be one of {sorted(AUTHORS)}")
    if meta.get("author") == "ai" and meta.get("status") not in (None, "staging"):
        warnings.append(f"{name}: author is ai but status is '{meta.get('status')}' (only a human may promote)")
    for key in ("created", "updated"):
        if meta.get(key) and not DATE_RE.match(meta[key]):
            errors.append(f"{name}: {key} must look like YYYY-MM-DD")
    if meta.get("summary") and len(meta["summary"]) > MAX_SUMMARY:
        errors.append(f"{name}: summary is longer than {MAX_SUMMARY} characters")
    for key in ("tags", "related"):
        if key in meta and not isinstance(meta[key], list):
            errors.append(f"{name}: {key} must be a list like [a, b]")

    # Body structure
    lines = [ln for ln in body.split("\n")]
    nonempty = [ln for ln in lines if ln.strip()]
    if not nonempty or nonempty[0].strip() != f"# {meta.get('title', '')}":
        errors.append(f"{name}: body must start with '# {meta.get('title', '')}'")
    in_code = False
    previous_level = 0
    h1_count = 0
    for ln in lines:
        if ln.startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        m = re.match(r"^(#{1,6})\s+\S", ln)
        if m:
            level = len(m.group(1))
            if level == 1:
                h1_count += 1
            if previous_level and level > previous_level + 1:
                errors.append(f"{name}: heading level jumps from H{previous_level} to H{level}")
            previous_level = level
    if h1_count != 1:
        errors.append(f"{name}: body must have exactly one H1 (found {h1_count})")
    if len(lines) > MAX_LINES:
        warnings.append(f"{name}: {len(lines)} lines, consider splitting (limit {MAX_LINES})")


def main():
    errors, warnings = [], []
    notes = []
    paths = sorted(p for p in NOTES_DIR.glob("*.md") if not p.name.startswith("_"))
    slugs = {p.stem for p in paths}

    for path in paths:
        text = path.read_text(encoding="utf-8")
        meta, body = split_frontmatter(text)
        check_note(path, meta, body, errors, warnings)
        if meta is None:
            continue
        for rel in meta.get("related", []) if isinstance(meta.get("related"), list) else []:
            if rel not in slugs:
                errors.append(f"{path.name}: related slug '{rel}' does not exist")
        for link in WIKILINK_RE.findall(body):
            if link not in slugs:
                warnings.append(f"{path.name}: [[{link}]] points to a note that does not exist yet")
        notes.append({
            "slug": path.stem,
            "title": meta.get("title", ""),
            "category": meta.get("category", ""),
            "tags": meta.get("tags", []) if isinstance(meta.get("tags"), list) else [],
            "status": meta.get("status", ""),
            "author": meta.get("author", ""),
            "created": meta.get("created", ""),
            "updated": meta.get("updated", ""),
            "summary": meta.get("summary", ""),
            "source": meta.get("source", ""),
            "related": meta.get("related", []) if isinstance(meta.get("related"), list) else [],
            "body": body.rstrip() + "\n",
        })

    for w in warnings:
        print(f"warning: {w}")
    if errors:
        for e in errors:
            print(f"error: {e}")
        print(f"\n{len(errors)} error(s). Nothing was written.")
        return 1

    notes.sort(key=lambda n: (n["updated"], n["title"].lower()), reverse=True)
    header = "// GENERATED by scripts/build_index.py. Do not edit by hand.\n"
    payload = json.dumps(notes, ensure_ascii=False, indent=2)
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(f"{header}window.NOTES = {payload};\n", encoding="utf-8")
    print(f"OK: {len(notes)} note(s) written to {OUT_FILE.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
