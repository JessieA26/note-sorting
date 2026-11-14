# Note Sorting

A minimalist website that keeps notes, study materials and projects in one place. Every item is a Markdown file in `notes/`; the site shows them as cards you can search, sort and filter.

- Layout: sticky top header, left sidebar filters, middle scrollable note feed, right reader panel.
- Rules for AI helpers: [agents.md](agents.md) (English) or [agents.zh-TW.md](agents.zh-TW.md) (中文). Short version: keep the original text, and new AI notes start as `status: staging`.

## Add or change notes

1. Add `notes/<name>.md` (see the template in `agents.md`, section 4).
2. Run `python3 scripts/build_index.py`. It checks the notes and updates `assets/notes-data.js`.
3. Open `index.html`.

## Preview

Open `index.html` directly, or run `python3 -m http.server` and visit `http://localhost:8000`.

## Publish

GitHub Pages: Settings, Pages, Source `main` branch, `/ (root)`.
