/* Ecology method atlas — client rendering */
(function () {
  "use strict";

  const DATA = window.CONTENT;
  const CH = DATA.chapters;
  const ALL = [];
  CH.forEach((c, ci) => {
    c.num = (c.title.match(/第\s*(\d+)\s*章/) || [, String(ci + 1)])[1];
    c.name = c.title.replace(/^第\s*\d+\s*章\s*/, "");
    c.entries.forEach((e) => {
      e.chapter = c;
      ALL.push(e);
    });
  });

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const mdInline = (s) => esc(s)
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

  const tree = $("#tree");
  const main = $("#main");
  const search = $("#search");
  const sidebar = $("#sidebar");

  /* ---------------- sidebar ---------------- */
  const QUICK = [
    ["4.2", "PCoA 主坐标分析"],
    ["4.6", "RDA 冗余分析"],
    ["4.3", "NMDS 非度量标定"],
    ["4.1", "PCA 主成分分析"],
    ["6.1", "PERMANOVA"],
    ["2.4", "Shannon 多样性"]
  ];

  function quickBlock() {
    const items = QUICK.map(([id, label]) =>
      `<a class="entry-link quick" data-id="${id}" href="#/e/${id}"><b>${esc(id)}</b> ${esc(label)}</a>`
    ).join("");
    return `<div class="quick-wrap"><div class="quick-title">常用方法</div>${items}</div>`;
  }

  function buildTree() {
    tree.innerHTML = quickBlock() + CH.map((c) => {
      const items = c.entries.map((e) =>
        `<a class="entry-link" data-id="${e.id}" href="#/e/${e.id}">${esc(e.title)}</a>`
      ).join("");
      return `<div class="chapter" data-ch="${c.num}">
        <button class="chapter-btn" aria-expanded="false" data-ch="${c.num}">
          <span class="num">${esc(c.num)}</span>
          <span class="label">${esc(c.name)}</span>
          <span class="badge">${c.entries.length}</span>
          <span class="chev">▶</span>
        </button>
        <div class="entries" hidden>${items}</div>
      </div>`;
    }).join("");
    $("#count").innerHTML = `${ALL.length} 个方法 · <button id="expandAll" class="mini">展开</button><button id="collapseAll" class="mini">收起</button>`;
  }

  function toggleChapter(num, force) {
    const btn = tree.querySelector(`.chapter-btn[data-ch="${num}"]`);
    const box = tree.querySelector(`.chapter[data-ch="${num}"] .entries`);
    if (!btn || !box) return;
    const open = force !== undefined ? force : box.hasAttribute("hidden");
    box.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
  }

  function expandTo(id) {
    const e = ALL.find((x) => x.id === id);
    if (e) toggleChapter(e.chapter.num, true);
  }

  function markActive(id) {
    tree.querySelectorAll(".entry-link").forEach((a) =>
      a.classList.toggle("active", a.dataset.id === id));
    tree.querySelectorAll(".chapter-btn").forEach((b) => b.classList.remove("active"));
    const e = ALL.find((x) => x.id === id);
    if (e) {
      const btn = tree.querySelector(`.chapter-btn[data-ch="${e.chapter.num}"]`);
      if (btn) btn.classList.add("active");
    }
  }

  /* ---------------- views ---------------- */
  function home() {
    const figs = ALL.filter((e) => e.fig).length;
    const chapters = CH.map((c) => `
      <a class="chapter-card" href="#/c/${c.num}">
        <span class="n">${esc(c.num)}</span>
        <span class="t">${esc(c.name)}</span>
        <span class="b">${c.entries.length} 条</span>
      </a>`).join("");

    main.innerHTML = `<article>
      <div class="crumb">生态学方法实例库 · 交互版</div>
      <h1 class="title">拿真实数据，学会每一个经典方法</h1>
      <p class="subtitle">${ALL.length} 个方法条目 · ${CH.length} 章 · ${figs} 张结果图（真实数据或可复现模拟） · 每条都附原始文献与公开数据集</p>

      <div class="chips">
        <span class="chip"><b>${ALL.length}</b> 方法</span>
        <span class="chip"><b>${figs}</b> 结果图</span>
        <span class="chip"><b>${ALL.reduce((n, e) => n + e.lit.length, 0)}</b> 篇原始文献</span>
        <span class="chip"><b>6</b> 个公开数据集</span>
      </div>

      <section class="block">
        <h2 class="sec"><span class="idx">01</span>怎么用</h2>
        <div class="prose">
          <p>左侧是章节目录：<strong>默认只显示 17 个大章</strong>，点击章节展开该章的方法条目；点击条目进入正文。</p>
          <p>每个方法页依次给出：<strong>原始文献（外链可查）→ 公开数据（外链可下载）→ 真实计算结果或图 → 怎么读 → 论文里怎么写 → 常见误用</strong>。代码默认折叠，因为学习时先看结果，复现时再展开。</p>
        </div>
      </section>

      <section class="block">
        <h2 class="sec"><span class="idx">02</span>数据集</h2>
        <div class="data-grid">
          ${Object.entries(window.DATASET_INFO || {}).map(([k, v]) => `
            <div class="data-card"><div class="k">${esc(k)}</div>
            <div class="v">${esc(v.text)}<br><a href="${v.url}" target="_blank" rel="noopener">查看数据说明 ↗</a></div></div>`).join("")}
        </div>
      </section>

      <section class="block">
        <h2 class="sec"><span class="idx">03</span>最常用的方法</h2>
        <div class="quick-grid">
          ${[["4.2","PCoA","主坐标分析"],["4.6","RDA","冗余分析"],["4.3","NMDS","非度量多维标定"],
             ["4.1","PCA","主成分分析"],["4.7","CCA","典范对应分析"],["6.1","PERMANOVA","多元方差分析"],
             ["2.4","Shannon","多样性指数"],["7.1","方差分解","环境 vs 空间"]].map(([id,en,cn])=>`
            <a class="quick-card" href="#/e/${id}">
              <span class="en">${en}</span>
              <span class="cn">${cn}</span>
              <span class="no">${id}</span>
            </a>`).join("")}
        </div>
      </section>

      <section class="block">
        <h2 class="sec"><span class="idx">04</span>全部章节</h2>
        <div class="chapter-grid">${chapters}</div>
      </section>
    </article>`;
  }

  function chapterView(num) {
    const c = CH.find((x) => x.num === num);
    if (!c) return home();
    const list = c.entries.map((e) => `
      <li><a href="#/e/${e.id}">
        <span class="n">${esc(e.id)}</span>
        <span class="t">${esc(e.title.replace(/^\d+\.\d+\s*/, ""))}</span>
        <span class="d">${esc((e.what || "").slice(0, 36))}</span>
      </a></li>`).join("");
    main.innerHTML = `<article>
      <div class="crumb"><a href="#/">首页</a><span class="sep">/</span>第 ${esc(c.num)} 章</div>
      <div class="chapter-hero">
        <div class="kicker">Chapter ${esc(c.num)}</div>
        <h1>${esc(c.name)}</h1>
        <p>${esc(c.intro || "本章的方法条目如下。每条都配有原始文献、公开数据与真实计算结果。")}</p>
      </div>
      <section class="block">
        <h2 class="sec"><span class="idx">目录</span>本章方法</h2>
        <ul class="toc-list">${list}</ul>
      </section>
    </article>`;
  }

  function entryView(id) {
    const e = ALL.find((x) => x.id === id);
    if (!e) return home();
    const idx = ALL.indexOf(e);
    const prev = ALL[idx - 1], next = ALL[idx + 1];
    const c = e.chapter;

    const refs = e.lit.length ? e.lit.map((r) =>
      `<li><a href="${r.url}" target="_blank" rel="noopener">${mdInline(r.text)}</a>
       <div class="doi">点击在 Crossref 中检索该文献 ↗</div></li>`).join("")
      : `<li>见正文。</li>`;

    const datas = e.data.map((d) => `
      <div class="data-card">
        <div class="k">Data</div>
        <div class="v">${d.url ? `<a href="${d.url}" target="_blank" rel="noopener">${esc(d.text)} ↗</a>` : esc(d.text)}</div>
      </div>`).join("");

    const result = e.fig
      ? `<figure class="fig">
           <a href="figs/${e.fig}" target="_blank" rel="noopener" title="打开原始 SVG">
             <img src="figs/${e.fig}" alt="${esc(e.title)} 的结果图" loading="lazy">
           </a>
           <figcaption>${esc(e.figCaption || "")}</figcaption>
           <span class="zoom">点击图片可查看原始 SVG ↗</span>
         </figure>
         ${e.resultText ? `<div class="result-panel" style="margin-top:12px"><span class="tag">${esc(e.resultKind)}</span>${esc(e.resultText)}</div>` : ""}`
      : `<div class="result-panel"><span class="tag">${esc(e.resultKind)}</span>${esc(e.resultText || "运行代码后得到下表所述结果。")}</div>`;

    const pitfalls = (e.pitfalls || []).length
      ? `<ul class="pit">${e.pitfalls.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`
      : "";

    const sibs = c.entries.filter((x) => x.id !== e.id).slice(0, 6);
    const related = sibs.map((x) => `<a href="#/e/${x.id}">${esc(x.title)}</a>`).join("");

    const pkg = (e.packages || []).map((p) =>
      `<a class="chip" href="https://cran.r-project.org/package=${encodeURIComponent(p)}" target="_blank" rel="noopener">R 包 ${esc(p)} ↗</a>`).join("");

    main.innerHTML = `<article>
      <div class="crumb"><a href="#/">首页</a><span class="sep">/</span>
        <a href="#/c/${c.num}">第 ${esc(c.num)} 章 ${esc(c.name)}</a><span class="sep">/</span>${esc(e.id)}</div>
      <h1 class="title">${esc(e.title.replace(/^\d+\.\d+\s*/, ""))}</h1>
      <p class="subtitle">${esc(c.name)} · 条目 ${esc(e.id)}</p>
      <div class="chips">
        <span class="chip">数据 <b>${esc((e.data[0] || {}).text ? (e.data[0].text.split("：")[0] || "").slice(0, 18) : "示例")}</b></span>
        <span class="chip"><b>${e.fig ? "含结果图" : "结果面板"}</b></span>
      </div>

      <section class="method-lead">
        <div class="lead-kicker">它是什么</div>
        <p class="what">${esc(e.what || "")}</p>
        <div class="why"><span class="why-k">为什么用它</span>${esc(e.why || "")}</div>
      </section>

      <section class="block">
        <h2 class="sec"><span class="idx">01</span>原始文献</h2>
        <ul class="refs">${refs}</ul>
      </section>

      <section class="block">
        <h2 class="sec"><span class="idx">02</span>数据</h2>
        <div class="data-grid">${datas}</div>
        <div class="data-struct">
          <div class="ds-title">数据结构</div>
          <p class="ds-shape">${esc(e.dataProfile.shape)}</p>
          <ul class="ds-vars">${(e.dataProfile.vars || []).map((v) => `<li>${esc(v)}</li>`).join("")}</ul>
          <p class="ds-quirk">${esc(e.dataProfile.quirks)}</p>
        </div>
        <div class="fit-note">
          <span class="fn-k">为什么这份数据配这个方法</span>${esc(e.fitReason)}
        </div>
      </section>

      <section class="block">
        <h2 class="sec"><span class="idx">03</span>${e.fig ? "结果图" : "结果"}</h2>
        ${result}
      </section>

      ${(e.figNotes || []).length ? `<section class="block">
        <h2 class="sec"><span class="idx">04</span>看图要点</h2>
        <ul class="pit">${e.figNotes.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
      </section>` : ""}

      <section class="block">
        <h2 class="sec"><span class="idx">05</span>前提与假设</h2>
        <ul class="pit">${(e.assumptions || []).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
        <h3 class="subsec">操作流程</h3>
        <ol class="steps">${(e.steps || []).map((p) => `<li>${esc(p)}</li>`).join("")}</ol>
      </section>

      <section class="block">
        <h2 class="sec"><span class="idx">06</span>怎么读</h2>
        <div class="prose"><p>${esc(e.interpret)}</p></div>
      </section>

      <section class="block">
        <h2 class="sec"><span class="idx">07</span>论文里怎么写</h2>
        <div class="quote">${esc(e.report)}</div>
      </section>

      <section class="block">
        <h2 class="sec"><span class="idx">08</span>常见误用</h2>
        ${pitfalls}
      </section>

      <section class="block">
        <h2 class="sec"><span class="idx">09</span>同章方法</h2>
        <div class="related">${related}</div>
        ${pkg ? `<div class="chips" style="margin-top:12px">${pkg}</div>` : ""}
      </section>

      <details class="code">
        <summary>复现代码（R）——默认折叠，先看结果</summary>
        <pre><code>${esc(e.code)}</code></pre>
      </details>

      <div class="pager">
        ${prev ? `<a href="#/e/${prev.id}"><span class="dir">上一条</span>${esc(prev.title)}</a>` : "<span></span>"}
        ${next ? `<a class="next" href="#/e/${next.id}"><span class="dir">下一条</span>${esc(next.title)}</a>` : "<span></span>"}
      </div>
    </article>`;
  }

  /* ---------------- router ---------------- */
  function route() {
    const h = location.hash.replace(/^#/, "");
    const mE = h.match(/^\/e\/([\d.]+)/);
    const mC = h.match(/^\/c\/(\d+)/);
    window.scrollTo(0, 0);
    if (mE) {
      markActive(mE[1]);
      expandTo(mE[1]);
      entryView(mE[1]);
    } else if (mC) {
      markActive(null);
      toggleChapter(mC[1], true);
      chapterView(mC[1]);
    } else {
      markActive(null);
      home();
    }
    if (window.innerWidth <= 980) sidebar.classList.remove("open");
  }

  /* ---------------- search ---------------- */
  function doSearch(q) {
    q = q.trim().toLowerCase();
    if (!q) { buildTree(); route(); return; }
    const hits = ALL.filter((e) =>
      (e.title + " " + e.interpret + " " + e.lit.map((r) => r.text).join(" ") + " " +
       e.data.map((d) => d.text).join(" ")).toLowerCase().includes(q));
    tree.innerHTML = `<div class="empty" style="padding:10px 12px">${hits.length} 条匹配</div>` +
      hits.map((e) => `<a class="entry-link" href="#/e/${e.id}">${esc(e.title)}</a>`).join("");
    if (hits[0]) entryView(hits[0].id);
  }

  /* ---------------- init ---------------- */
  buildTree();
  window.DATASET_INFO = window.DATASET_INFO || {};
  route();

  tree.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".chapter-btn");
    if (btn) toggleChapter(btn.dataset.ch);
  });

  document.addEventListener("click", (ev) => {
    if (ev.target.id === "expandAll") {
      CH.forEach((c) => toggleChapter(c.num, true));
    }
    if (ev.target.id === "collapseAll") {
      CH.forEach((c) => toggleChapter(c.num, false));
    }
  });

  search.addEventListener("input", (e) => doSearch(e.target.value));
  search.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { search.value = ""; search.blur(); doSearch(""); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== search) { e.preventDefault(); search.focus(); }
  });

  $("#menuBtn").addEventListener("click", () => sidebar.classList.toggle("open"));

  const FIG = ["s", "m", "l"];
  const FIG_LABEL = { s: "小", m: "中", l: "大" };
  const figBtn = $("#figSize");
  let figSize = localStorage.getItem("figSize") || "m";
  if (!FIG.includes(figSize)) figSize = "m";
  function applyFig() {
    document.body.dataset.fig = figSize;
    figBtn.textContent = "图幅 " + FIG_LABEL[figSize];
  }
  applyFig();
  figBtn.addEventListener("click", () => {
    figSize = FIG[(FIG.indexOf(figSize) + 1) % FIG.length];
    localStorage.setItem("figSize", figSize);
    applyFig();
  });
  window.addEventListener("hashchange", route);
})();
