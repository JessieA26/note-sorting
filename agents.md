# 筆記整理站

## 1. 這個專案的目的

一個小型網站，把筆記、學習資料和專案放在同一個地方，方便整理並分類。

- 每一篇筆記都是 `notes/` 資料夾裡的一個 Markdown（`.md`）檔。
- 網站會讀取這些筆記，並用卡片顯示。你可以搜尋、排序和篩選。
- 這份文件的目標：AI 讀完之後，可以用同樣的方式繼續新增筆記和頁面，而且不會弄壞專案。

## 2. 網頁的整體風格

- 現代、極簡、乾淨，視覺動線清楚，由上到下、由左到右。
- 筆記以格狀卡片呈現。
- 留白充足、只用一種強調色、邊框柔和。不放裝飾用 emoji，不做誇張動畫。
- 淺色與深色會跟著電腦設定切換。所有顏色都在 `assets/style.css` 最上面的 `:root`，要改顏色就改那裡。
- 只用純 HTML、CSS 和 JavaScript。不用框架、不用 CDN 連結、不用外部字型。

## 3. 頁面結構

網站只有一個頁面（`index.html`），採用三欄版面：

| 區塊 | 內容 |
| --- | --- |
| 上方（固定，永遠看得到） | 網站名稱、搜尋框、排序選單、筆記數量 |
| 左側欄 | 篩選：分類、狀態、標籤，以及「Clear filters」按鈕 |
| 中間列表（可捲動） | 以格狀排列的筆記卡片 |
| 右側閱讀面板 | 選到的筆記內容 |

- 每張卡片顯示：分類、狀態標籤（`active` 不顯示）、標題、摘要、標籤和更新日期。
- Staging 筆記是虛線邊框，並有琥珀色的「Staging」標籤。
- 選到的筆記會記錄在網址裡（`#筆記檔名`），所以每篇筆記都有自己的連結。
- 螢幕較窄（小於 1100 px）時，閱讀面板會從右邊滑進來蓋住頁面。手機（小於 720 px）時，全部變成單欄。

## 4. 新增內容時要遵守的格式

每篇筆記都是一個 `.md` 檔，最上面有一段 front matter（資料區塊），下面是乾淨的內文。

範本（直接複製）：

```
---
title: My Topic
category: study
tags: [finance, exam]
status: staging
author: ai
created: 2026-11-14
updated: 2026-11-14
summary: 用一句話說明這篇筆記。
related: [other-note]
---

# My Topic

## Key points
- 重點一
- 重點二

## Details
在這裡寫詳細說明。

## Related
[[other-note]]
```

每個欄位的意思

| 欄位 | 要寫什麼 |
| --- | --- |
| `title` | 筆記標題 |
| `category` | `study`（課堂筆記）、`project`（專案或作業）、`note`（其他） |
| `tags` | 1 到 5 個簡短的小寫英文單字。盡量使用已經有的標籤 |
| `status` | `staging`（等待檢查）、`active`（使用者確認過）、`archived`（舊的） |
| `author` | `user`（使用者寫的）或 `ai`（AI 寫的） |
| `created`、`updated` | 日期，例如 `2026-11-14` |
| `summary` | 一句話，最多 140 個字元 |
| `related` | 選填。填已存在筆記的檔名（不含 `.md`） |

內文規則

- 內文第一行是 `# ` 加上和 `title` 一樣的標題。每篇筆記只能有一個 `#` 標題。
- 用 `##` 分段。課堂筆記用 `## Key points`、`## Details`、`## Related`。專案筆記用 `## Goal`、`## Status`、`## Next steps`。
- 一篇筆記不要超過 150 行。
- 筆記裡不要用表格、圖片或 HTML，網站無法顯示它們。

寫作風格

- 使用短句和簡單的詞。使用和使用者相同的語言。
- 不要編造資料、數字、引言或來源。如果不確定，在筆記裡寫 `(to verify)`，並告訴使用者。
- 資料來源寫在 `source` 欄位。

## 5. 檔案應該如何命名與放置

資料夾地圖

```
note-sorting/
├── agents.md            ← 這份規則（英文版）
├── agents.zh-TW.md      ← 同樣的規則（中文版）
├── README.md            ← 簡短介紹
├── index.html           ← 網站頁面
├── assets/
│   ├── style.css        ← 顏色與版面
│   ├── app.js           ← 搜尋、篩選、排序
│   └── notes-data.js    ← 程式產生，不要手動改
├── notes/               ← 所有筆記都放這裡（一篇一個 .md 檔）
└── scripts/
    └── build_index.py   ← 檢查筆記並產生 notes-data.js
```

命名與放置規則

- 每篇筆記都放在 `notes/`，一篇一個檔案：`notes/my-topic.md`。
- 使用小寫英文單字，中間用連字號。檔名不要有空格、大寫字母或中文字。
- 檔名（不含 `.md`）就是這篇筆記永久的 ID。之後不要改檔名，因為連結和 `related` 都靠它。
- 不要在 `notes/` 裡再建子資料夾。筆記用分類和標籤整理，不用資料夾。
- 不要手動修改 `assets/notes-data.js`。請執行 `python3 scripts/build_index.py` 來產生它。

預覽與發佈

- 預覽：直接雙擊 `index.html`，或執行 `python3 -m http.server` 後開啟 `http://localhost:8000`。
- 發佈：GitHub Pages，分支 `main`，資料夾 `/ (root)`。
- Repository：https://github.com/JessieA26/note-sorting

## 6. AI 修改或新增內容時需要遵守的規則

最重要的 3 條規則

1. 保留原文。 絕對不要刪除或改寫使用者寫的內容。
2. AI 新增的筆記一定要用 `status: staging`（還要加 `author: ai`）。只有使用者可以把筆記改成 `active`。
3. 新增或修改筆記後，要執行 `python3 scripts/build_index.py`。

各種情況該怎麼做

- 使用者寫的筆記（`author: user`），或任何 `active` / `archived` 的筆記：不要改動舊文字。只能在檔案最後加一個 `## AI additions (staging)` 段落，第一行寫 `_Added 2026-11-14 by AI._`。也可以新增標籤或 `related` 項目，並更新 `updated`。
- 發現使用者文字有錯字：不要修改，在回覆裡告訴使用者。
- 你自己寫的筆記（`author: ai`），而且還是 `staging`：可以修改。
- 建立新筆記：使用 `status: staging` 和 `author: ai`。
- 刪除或重新命名筆記：除非使用者明確要求，否則絕對不要做。
- 把狀態改成 `active`：絕對不要，只有使用者可以改。

如果使用者提供文字要做成新筆記，請把他們的原話原封不動放在 `## Details` 底下。你可以自己加上 `## Key points` 和 `## Related`。

怎麼新增一篇筆記（步驟）

1. 打開 `assets/notes-data.js`，看看已經有哪些筆記，避免重複。如果主題已經存在，就在那篇筆記的最後加上 `## AI additions (staging)`，不要另建新檔。
2. 依照第 4 節的範本建立 `notes/your-topic.md`。
3. 執行 `python3 scripts/build_index.py`。如果出現錯誤，修正後再執行一次。
4. 告訴使用者你改了哪些檔案，並列出所有不確定的地方。

完成前的檢查清單

- [ ] `python3 scripts/build_index.py` 執行後沒有錯誤。
- [ ] 使用者寫的舊文字沒有被改動。
- [ ] 新筆記使用 `status: staging` 和 `author: ai`。
- [ ] 回覆裡列出了修改的檔案和所有 `(to verify)` 項目。
