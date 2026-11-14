(function () {
  "use strict";

  var NOTES = Array.isArray(window.NOTES) ? window.NOTES.slice() : [];
  var CATEGORY_LABELS = { study: "Study", project: "Projects", note: "Notes" };
  var CHIP_LABELS = { study: "Study", project: "Project", note: "Note" };
  var STATUS_LABELS = { active: "Active", staging: "Staging", archived: "Archived" };

  var state = { category: "all", status: "all", tag: "", query: "", sort: "updated" };
  var selected = "";
  var bySlug = {};
  NOTES.forEach(function (n) { bySlug[n.slug] = n; });

  function $(id) { return document.getElementById(id); }

  var el = {
    categories: $("categories"),
    statuses: $("statuses"),
    tags: $("tags"),
    grid: $("grid"),
    empty: $("empty"),
    count: $("count"),
    q: $("q"),
    sort: $("sort"),
    reset: $("reset"),
    reader: $("reader"),
    readerBody: $("reader-body"),
    feed: $("feed")
  };

  /* ---------- Text helpers ---------- */

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function safeUrl(u) {
    return /^(https?:\/\/|\/|\.\/|\.\.\/|#|mailto:)/i.test(u) ? u : "#";
  }

  /* ---------- Minimal Markdown renderer ---------- */

  function inline(raw) {
    var codes = [];
    var s = raw.replace(/`([^`]+)`/g, function (_, c) {
      codes.push(c);
      return "\u0000" + (codes.length - 1) + "\u0000";
    });
    s = esc(s);
    s = s.replace(/\[\[([a-z0-9-]+)\]\]/g, function (_, slug) {
      var n = bySlug[slug];
      return n
        ? '<a class="wikilink" href="#' + slug + '">' + esc(n.title) + "</a>"
        : '<span class="wikilink missing">' + slug + "</span>";
    });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, text, url) {
      var href = safeUrl(url);
      var external = /^https?:\/\//i.test(href);
      return '<a href="' + href + '"' + (external ? ' target="_blank" rel="noopener"' : "") + ">" + text + "</a>";
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
    s = s.replace(/(^|[\s(])_([^_]+)_(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>");
    s = s.replace(/\u0000(\d+)\u0000/g, function (_, i) {
      return "<code>" + esc(codes[Number(i)]) + "</code>";
    });
    return s;
  }

  var BLOCK_START = /^(#{1,3}\s|```|>\s?|---+\s*$|\s*[-*]\s+|\s*\d+\.\s+)/;

  function renderMarkdown(md) {
    md = md.replace(/<!--[\s\S]*?-->/g, "").replace(/\r\n/g, "\n");
    var lines = md.split("\n");
    var out = [];
    var i = 0;
    while (i < lines.length) {
      var line = lines[i];
      var m;

      if (/^```/.test(line)) {
        var code = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) { code.push(lines[i]); i++; }
        i++;
        out.push("<pre><code>" + esc(code.join("\n")) + "</code></pre>");
        continue;
      }
      if ((m = /^(#{1,3})\s+(.*)$/.exec(line))) {
        var level = m[1].length;
        out.push("<h" + level + ">" + inline(m[2]) + "</h" + level + ">");
        i++;
        continue;
      }
      if (/^---+\s*$/.test(line)) { out.push("<hr>"); i++; continue; }
      if (/^>\s?/.test(line)) {
        var quote = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { quote.push(lines[i].replace(/^>\s?/, "")); i++; }
        out.push("<blockquote>" + inline(quote.join(" ")) + "</blockquote>");
        continue;
      }
      if (/^\s*[-*]\s+/.test(line)) {
        var ul = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
          ul.push("<li>" + inline(lines[i].replace(/^\s*[-*]\s+/, "")) + "</li>");
          i++;
        }
        out.push("<ul>" + ul.join("") + "</ul>");
        continue;
      }
      if (/^\s*\d+\.\s+/.test(line)) {
        var ol = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          ol.push("<li>" + inline(lines[i].replace(/^\s*\d+\.\s+/, "")) + "</li>");
          i++;
        }
        out.push("<ol>" + ol.join("") + "</ol>");
        continue;
      }
      if (/^\s*$/.test(line)) { i++; continue; }

      var para = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !BLOCK_START.test(lines[i])) {
        para.push(lines[i]);
        i++;
      }
      if (!para.length) { para.push(lines[i]); i++; }
      out.push("<p>" + inline(para.join(" ")) + "</p>");
    }
    return out.join("\n");
  }

  /* ---------- Filtering and sorting ---------- */

  function matches(n) {
    if (state.category !== "all" && n.category !== state.category) return false;
    if (state.status !== "all" && n.status !== state.status) return false;
    if (state.tag && n.tags.indexOf(state.tag) === -1) return false;
    if (state.query) {
      var hay = (n.title + " " + n.summary + " " + n.tags.join(" ") + " " + n.body).toLowerCase();
      var terms = state.query.toLowerCase().split(/\s+/).filter(Boolean);
      for (var t = 0; t < terms.length; t++) {
        if (hay.indexOf(terms[t]) === -1) return false;
      }
    }
    return true;
  }

  function sorted(list) {
    var copy = list.slice();
    if (state.sort === "title") {
      copy.sort(function (a, b) { return a.title.localeCompare(b.title); });
    } else {
      var key = state.sort === "created" ? "created" : "updated";
      copy.sort(function (a, b) {
        return a[key] < b[key] ? 1 : a[key] > b[key] ? -1 : a.title.localeCompare(b.title);
      });
    }
    return copy;
  }

  /* ---------- Rendering ---------- */

  function countBy(fn) {
    var counts = {};
    NOTES.forEach(function (n) {
      var k = fn(n);
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }

  function filterButton(kind, value, label, n) {
    var pressed = state[kind] === value;
    return '<button type="button" class="filter-btn" data-kind="' + kind + '" data-value="' + esc(value) +
      '" aria-pressed="' + pressed + '"><span>' + esc(label) + '</span><span class="n">' + n + "</span></button>";
  }

  function renderSidebar() {
    var cats = countBy(function (n) { return n.category; });
    var stats = countBy(function (n) { return n.status; });

    var catHtml = filterButton("category", "all", "All notes", NOTES.length);
    Object.keys(CATEGORY_LABELS).forEach(function (c) {
      if (cats[c]) catHtml += filterButton("category", c, CATEGORY_LABELS[c], cats[c]);
    });
    el.categories.innerHTML = catHtml;

    var statHtml = filterButton("status", "all", "Any status", NOTES.length);
    Object.keys(STATUS_LABELS).forEach(function (s) {
      if (stats[s]) statHtml += filterButton("status", s, STATUS_LABELS[s], stats[s]);
    });
    el.statuses.innerHTML = statHtml;

    var tagCounts = {};
    NOTES.forEach(function (n) {
      n.tags.forEach(function (t) { tagCounts[t] = (tagCounts[t] || 0) + 1; });
    });
    var tagNames = Object.keys(tagCounts).sort(function (a, b) {
      return tagCounts[b] - tagCounts[a] || a.localeCompare(b);
    });
    el.tags.innerHTML = tagNames.map(function (t) {
      return '<button type="button" class="tag-btn" data-kind="tag" data-value="' + esc(t) +
        '" aria-pressed="' + (state.tag === t) + '">' + esc(t) + "</button>";
    }).join("");
  }

  function cardHtml(n) {
    var cls = "card" + (n.status === "staging" ? " is-staging" : "") + (n.slug === selected ? " is-selected" : "");
    var badge = n.status !== "active"
      ? '<span class="badge badge-' + esc(n.status) + '">' + esc(STATUS_LABELS[n.status] || n.status) + "</span>"
      : "";
    var tags = n.tags.map(function (t) { return "<span>#" + esc(t) + "</span>"; }).join("");
    return '<a class="' + cls + '" href="#' + esc(n.slug) + '" data-slug="' + esc(n.slug) + '">' +
      '<div class="card-top"><span class="chip chip-' + esc(n.category) + '">' +
      esc(CHIP_LABELS[n.category] || n.category) + "</span>" + badge + "</div>" +
      "<h3>" + esc(n.title) + "</h3><p>" + esc(n.summary) + "</p>" +
      '<div class="card-foot"><span class="tags">' + tags + "</span><time>" + esc(n.updated) + "</time></div></a>";
  }

  function renderFeed() {
    var list = sorted(NOTES.filter(matches));
    el.grid.innerHTML = list.map(cardHtml).join("");
    el.empty.hidden = list.length > 0;
    el.empty.textContent = NOTES.length ? "No notes match these filters." : "No notes yet. Add a Markdown file in notes/ and run scripts/build_index.py.";
    el.count.textContent = list.length + (list.length === 1 ? " note" : " notes");
  }

  function renderReader() {
    var n = bySlug[selected];
    if (!n) {
      el.reader.classList.remove("open");
      el.readerBody.innerHTML = '<p class="reader-empty">Select a note to read it here.</p>';
      return;
    }
    var body = n.body.replace(/^\s*#\s+.*\n?/, "");
    var badge = n.status !== "active"
      ? '<span class="badge badge-' + esc(n.status) + '">' + esc(STATUS_LABELS[n.status] || n.status) + "</span>"
      : "";
    var meta = '<div class="meta"><span class="chip chip-' + esc(n.category) + '">' +
      esc(CHIP_LABELS[n.category] || n.category) + "</span>" + badge +
      "<span>Updated " + esc(n.updated) + "</span><span>Author: " + esc(n.author) + "</span>" +
      (n.source ? "<span>Source: " + esc(n.source) + "</span>" : "") + "</div>";
    var tags = n.tags.length
      ? '<div class="reader-tags">' + n.tags.map(function (t) { return "<span>#" + esc(t) + "</span>"; }).join("") + "</div>"
      : "";
    var related = "";
    var rel = (n.related || []).filter(function (s) { return bySlug[s]; });
    if (rel.length) {
      related = '<section class="related"><h2>Related notes</h2><ul>' + rel.map(function (s) {
        return '<li><a href="#' + esc(s) + '">' + esc(bySlug[s].title) + "</a></li>";
      }).join("") + "</ul></section>";
    }
    el.readerBody.innerHTML =
      '<button class="close" id="close" type="button">Close</button>' +
      meta + "<h1>" + esc(n.title) + "</h1>" + tags + renderMarkdown(body) + related;
    el.reader.classList.add("open");
    el.reader.scrollTop = 0;
  }

  function markSelected() {
    var cards = el.grid.querySelectorAll(".card");
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.toggle("is-selected", cards[i].getAttribute("data-slug") === selected);
    }
  }

  function renderAll() {
    renderSidebar();
    renderFeed();
  }

  /* ---------- Events ---------- */

  function onFilterClick(e) {
    var btn = e.target.closest("[data-kind]");
    if (!btn) return;
    var kind = btn.getAttribute("data-kind");
    var value = btn.getAttribute("data-value");
    if (kind === "tag") {
      state.tag = state.tag === value ? "" : value;
    } else {
      state[kind] = value;
    }
    renderAll();
  }

  el.categories.addEventListener("click", onFilterClick);
  el.statuses.addEventListener("click", onFilterClick);
  el.tags.addEventListener("click", onFilterClick);

  el.q.addEventListener("input", function () {
    state.query = el.q.value.trim();
    renderFeed();
  });

  el.sort.addEventListener("change", function () {
    state.sort = el.sort.value;
    renderFeed();
  });

  el.reset.addEventListener("click", function () {
    state.category = "all";
    state.status = "all";
    state.tag = "";
    state.query = "";
    el.q.value = "";
    renderAll();
  });

  el.readerBody.addEventListener("click", function (e) {
    if (e.target && e.target.id === "close") {
      history.pushState("", document.title, window.location.pathname + window.location.search);
      onHashChange();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && selected) {
      history.pushState("", document.title, window.location.pathname + window.location.search);
      onHashChange();
    }
  });

  function onHashChange() {
    var slug = "";
    try { slug = decodeURIComponent(window.location.hash.slice(1)); } catch (err) { slug = ""; }
    selected = bySlug[slug] ? slug : "";
    markSelected();
    renderReader();
  }

  window.addEventListener("hashchange", onHashChange);

  /* ---------- Start ---------- */

  renderAll();
  onHashChange();
})();
