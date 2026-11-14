# 筆記整理

## 1. 專案目的

建立一個結合高質感極簡風格（Luxury Editorial / Minimalist）的筆記與知識庫整理網站，將課堂筆記（如投資學、資產訂價模型、APT 等）、專案作業與學習心得收納在同一個地方。

* 每篇筆記皆以獨立的 Markdown（`.md`）檔案儲存在 `notes/` 資料夾中。

* 網站會透過前端腳本自動讀取筆記並以卡片網格呈現，支援即時搜尋、分類篩選、狀態標籤與閱讀面板。

## 2. 網頁設計風格

* **設計美學**：高質感極簡風（Editorial Minimalist），採用柔和的奶油白背景（`#fcfbfa`）、精緻細膩的邊框、大量的留白，以及經典優雅的襯線標題字型（如 Playfair Display）。

* **色彩系統**：低彩度、沉穩且高雅的中性色調（柔和黑、暖灰、極細分隔線）。避免刺眼的霓虹色或多餘的裝飾性符號。

* **排版結構**：三欄式極簡佈局（左側分類與標籤篩選、中間卡片網格列表、右側即時文章閱讀與寫作面板）。

## 3. 頁面結構與檔案地圖

專案採用純前端架構（HTML, CSS, JavaScript），無須複雜框架：

```
note-sorting/
├── AGENTS.md            ← AI 協作規範說明文件
├── README.md            ← 專案介紹與部署說明
├── index.html           ← 網站主頁面（三欄式佈局）
├── assets/
│   ├── style.css        ← 奢華極簡風樣式與色彩變數
│   ├── app.js           ← 搜尋、分類篩選、Markdown 解析渲染邏輯
│   └── notes-data.js    ← 自動產生的筆記資料檔（請勿手動修改）
├── notes/               ← 所有筆記的 Markdown 原始檔（一篇一個 .md 檔）
│   ├── note-sorting-overview.md
│   ├── apt.md
│   ├── capm.md
│   ├── index-replication.md
│   └── ai-homework-checklist.md
└── scripts/
    └── build_index.py   ← 驗證 notes/*.md 並自動編譯產生 notes-data.js


```

## 4. 內容格式規範

每篇筆記必須是一個獨立的 `.md` 檔案，開頭包含標準的 **Frontmatter YAML** 資料區塊，內文須符合乾淨的 Markdown 語法。

### 筆記範本：

```
---
title: 筆記標題 (例如: Multifactor Models and APT)
category: study
tags: [finance, asset-pricing]
status: staging
author: ai
created: 2026-11-14
updated: 2026-11-14
summary: 一句話摘要說明這篇筆記的核心內容（不超過 140 字元）。
source: 課程投影片 / 課本理論 (to verify)
related: [capm]
---

# 筆記標題

## Key points
- 重點摘要一
- 重點摘要二

## Details
詳細的理論推導、公式或筆記內容。支援 LaTeX 數學符號與程式碼區塊。

## Related
與 [[capm]] 相關聯。


```

### Frontmatter 欄位說明：

* **`title`**：筆記標題。

* **`category`**：必須為以下三者之一：`study`（課堂筆記）、`project`（專案/作業）、`note`（其他）。

* **`tags`**：1 到 5 個小寫英文單字組成的陣列（例如 `[finance, asset-pricing]`）。

* **`status`**：必須為 `staging`（待審查/草稿）、`active`（已確認）或 `archived`（已歸檔）。**AI 新增的筆記一律設為 `staging`**。

* **`author`**：`user`（使用者）或 `ai`（AI 產生）。

* **`created` / `updated`**：日期格式為 `YYYY-MM-DD`。

* **`summary`**：不超過 140 字元的一句話摘要。

* **`related`**：相關筆記的 slug 清單（對應 `.md` 檔名，不含副檔名）。

## 5. 檔案命名與放置規則

* **命名規則**：全部使用小寫英文字母，單字之間以連字號 `-` 連接（例如 `apt.md`、`index-replication.md`）。絕對不能有空格、大寫字母或中文字。

* **放置位置**：所有筆記 `.md` 檔案統一放在 **`notes/`** 資料夾根目錄下，不可建立子資料夾。

* **編譯指令**：每次新增或修改筆記後，請在終端機執行以下指令來驗證並重新產生前端資料檔：

  ```
  python3 scripts/build_index.py
  
  
  ```

## 6. AI 修改或新增內容時需要遵守的規則

1. **保留原文原則**：絕對不要刪除或擅自竄改使用者（`author: user`）所寫的文字。若發現錯字或需補充，只能在檔案末端加上 `## AI additions (staging)` 段落並註明日期與來源。

2. **狀態限制**：AI 建立的新筆記一律必須設為 `status: staging` 與 `author: ai`。只有人類使用者有權限將筆記狀態改為 `active`。

3. **編譯驗證**：每次新增或修改筆記後，必須確保執行 `python3 scripts/build_index.py` 成功且無任何錯誤。

4. **回報機制**：在回覆使用者的對話中，必須清楚列出修改了哪些檔案、新增了哪些內容，以及任何需要使用者進一步確認的 `(to verify)` 項目。
