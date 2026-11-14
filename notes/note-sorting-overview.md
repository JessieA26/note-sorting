---
title: Note Sorting Overview
category: project
tags: [note-sorting, website, knowledge-base]
status: active
author: user
created: 2026-11-14
updated: 2026-11-14
summary: Purpose, style and structure of the site that keeps notes, study materials and projects in one place.
source: Project brief
related: [ai-homework-checklist]
---

# Note Sorting Overview

## Goal

Build a note sorting website that helps organise and categorise notes, study materials and projects in one place. The LLM Wiki gist is the reference for how the knowledge base is organised.

## Status

The first version is in place: a card grid of notes with search, sorting, category, status and tag filters, and a reader panel.

- Style: modern, minimalist, a clear visual flow, card grid.
- Structure: three columns with a sticky top utility header, a left sidebar and a middle scrollable note feed.
- Format: each note is saved as a `.md` file with a clean body structure.
- Rules for AI: preserve original text, and give new notes the staging status. See `agents.md`.

## Next steps

1. Review the staging study notes and promote the ones that are correct.
2. Add more notes for courses and projects.
3. Publish the site with GitHub Pages.
