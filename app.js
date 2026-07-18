/* ==========================================================================
   Shiori Demo & Incident Library — Vanilla JS Controller
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // State Store
    let indexData = { columns: [], histories: [] };
    let currentFilterType = "all";
    let currentSearchQuery = "";
    
    // DOM Elements
    const searchInput = document.getElementById("search-input");
    const searchClear = document.getElementById("search-clear");
    const itemsGrid = document.getElementById("items-grid");
    const itemDetail = document.getElementById("item-detail");
    const aboutContent = document.getElementById("about-content");
    const heroSec = document.getElementById("hero-sec");
    const sidebarSec = document.getElementById("sidebar-sec");
    
    // Counts
    const countAll = document.getElementById("count-all");
    const countColumn = document.getElementById("count-column");
    const countHistory = document.getElementById("count-history");
    
    // Navigation Buttons
    const btnHome = document.getElementById("btn-home");
    const navLibrary = document.getElementById("nav-library");
    const navAbout = document.getElementById("nav-about");
    const btnBackGrid = document.getElementById("btn-back-grid");
    
    // Detail Elements
    const markdownContent = document.getElementById("markdown-content");
    const detailTypeBadge = document.getElementById("detail-type-badge");
    const detailIdTag = document.getElementById("detail-id-tag");
    const detailGithubRefs = document.getElementById("detail-github-refs");
    const githubRefsGrid = document.getElementById("github-refs-grid");
    const featuredIncidentsList = document.getElementById("featured-incidents-list");

    // Initialize Markdown and Mermaid Options
    const repoMap = {
        "shiori": "masuda-masuo/shiori",
        "sunaba": "masuda-masuo/sunaba",
        "opencode-plugin-cc": "masuda-masuo/opencode-plugin-cc",
        "opencode": "anomalyco/opencode",
        "claude-code": "anthropics/claude-code",
        "onyx": "onyx-dot-app/onyx"
    };

    const customRenderer = {
        text(text) {
            // 1. フルリポジトリ形式: owner/repo#num
            text = text.replace(/([a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_]+)#(\d+)/g, (match, repo, num) => {
                return `<a href="https://github.com/${repo}/issues/${num}" target="_blank" class="autolink">${match}</a>`;
            });

            // 2. ショートリポジトリ形式: (shiori|sunaba|...)#num
            const keys = Object.keys(repoMap).join("|");
            const regex = new RegExp(`\\b(${keys})#(\\d+)`, "g");
            text = text.replace(regex, (match, name, num) => {
                const repo = repoMap[name];
                return `<a href="https://github.com/${repo}/issues/${num}" target="_blank" class="autolink">${match}</a>`;
            });

            // 3. 単発形式: #num (直後に </a> がないプレーンなハッシュに限定)
            text = text.replace(/(^|\s)#(\d+)\b(?!<\/a>)/g, (match, space, num) => {
                const detailIdElement = document.getElementById("detail-id-tag");
                const currentId = detailIdElement ? detailIdElement.textContent : "";
                
                // コラム43番や、その他履歴（History）の時はデフォルトを sunaba にする
                let defaultRepo = "masuda-masuo/shiori";
                if (currentId.includes("43") || currentId.includes("649") || currentId.includes("history")) {
                    defaultRepo = "masuda-masuo/sunaba";
                }
                return `${space}<a href="https://github.com/${defaultRepo}/issues/${num}" target="_blank" class="autolink">#${num}</a>`;
            });

            return text;
        }
    };

    marked.use({ renderer: customRenderer });

    marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true,
        mangle: false
    });
    
    mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "loose"
    });

    // --------------------------------------------------------------------------
    // 1. Data Fetching & Core Initialization
    // --------------------------------------------------------------------------
    async function init() {
        try {
            const response = await fetch("content/index.json");
            if (!response.ok) throw new Error("Index data failed to load.");
            indexData = await response.json();
            
            // Set Badge Counts
            countAll.textContent = indexData.columns.length + indexData.histories.length;
            countColumn.textContent = indexData.columns.length;
            countHistory.textContent = indexData.histories.length;
            
            // Render UI
            renderLibrary();
            renderFeaturedList();
            
        } catch (error) {
            console.error("Initialization error:", error);
            itemsGrid.innerHTML = `<div class="error-msg">データの読み込みに失敗しました。サーバーが起動しているか確認してください。</div>`;
        }
    }

    // --------------------------------------------------------------------------
    // 2. Rendering Grid & Sidebar
    // --------------------------------------------------------------------------
    function renderLibrary() {
        itemsGrid.innerHTML = "";
        
        // Combine and filter items
        let allItems = [...indexData.histories, ...indexData.columns];
        
        // Filter by Type
        if (currentFilterType !== "all") {
            allItems = allItems.filter(item => item.type === currentFilterType);
        }
        
        // Filter by Search Query
        if (currentSearchQuery.trim() !== "") {
            const query = currentSearchQuery.toLowerCase();
            allItems = allItems.filter(item => {
                return (
                    item.title.toLowerCase().includes(query) ||
                    item.summary.toLowerCase().includes(query) ||
                    item.filename.toLowerCase().includes(query) ||
                    item.links.some(link => link.toLowerCase().includes(query))
                );
            });
        }
        
        if (allItems.length === 0) {
            itemsGrid.innerHTML = `<div class="no-results-msg">該当するコラムまたは履歴が見つかりませんでした。</div>`;
            return;
        }

        // Render Cards
        allItems.forEach(item => {
            const card = document.createElement("div");
            card.className = "incident-card";
            card.innerHTML = `
                <div class="card-top">
                    <span class="card-badge badge-${item.type}">${item.type === "column" ? "Column" : "History"}</span>
                    <span class="card-id">#${item.id}</span>
                </div>
                <div class="card-title">${item.title}</div>
                <div class="card-summary">${item.summary}</div>
                <div class="card-footer">
                    <span class="card-references">${item.links.length} references</span>
                    <span class="card-action">Read details <i class="fa-solid fa-chevron-right"></i></span>
                </div>
            `;
            card.addEventListener("click", () => showDetail(item));
            itemsGrid.appendChild(card);
        });
    }

    function renderFeaturedList() {
        featuredIncidentsList.innerHTML = "";
        // Show top 5 columns as featured
        const featured = indexData.columns.slice(0, 5);
        featured.forEach(item => {
            const link = document.createElement("a");
            link.href = "#";
            link.className = "featured-link";
            link.textContent = `#${item.id} ${item.title}`;
            link.addEventListener("click", (e) => {
                e.preventDefault();
                showDetail(item);
            });
            featuredIncidentsList.appendChild(link);
        });
    }

    // --------------------------------------------------------------------------
    // 3. Detail View: On-Demand Fetch & Parse
    // --------------------------------------------------------------------------
    async function showDetail(item) {
        // Switch Views
        itemsGrid.style.display = "none";
        itemDetail.style.display = "block";
        aboutContent.style.display = "none";
        contentSection.classList.remove("about-mode");
        
        // Render Detail Metadata
        detailTypeBadge.className = `item-badge badge-${item.type}`;
        detailTypeBadge.textContent = item.type === "column" ? "Column" : "History";
        detailIdTag.textContent = `#${item.id}`;
        
        // Render GitHub Reference Cards (Mock)
        renderGitHubRefs(item.links);
        
        // Fetch Markdown Content (Pointer-then-Fetch)
        markdownContent.innerHTML = `<div class="loading-msg"><i class="fa-solid fa-spinner fa-spin"></i> マークダウンを取得中...</div>`;
        
        try {
            const folder = item.type === "column" ? "columns" : "history";
            const response = await fetch(`content/${folder}/${item.filename}`);
            if (!response.ok) throw new Error("Markdown file not found.");
            let markdown = await response.text();
            
            // Clean title header from content to avoid duplicate H1
            markdown = markdown.replace(/^#\s+.+$/m, "");
            
            // Parse Markdown
            markdownContent.innerHTML = marked.parse(markdown);
            
            // Re-Highlight Syntax code
            Prism.highlightAllUnder(markdownContent);
            
            // Re-Render Mermaid Diagrams dynamically
            const mermaidBlocks = markdownContent.querySelectorAll(".language-mermaid");
            mermaidBlocks.forEach(async (block, index) => {
                const code = block.textContent;
                const preElement = block.parentNode;
                const wrapper = document.createElement("div");
                wrapper.className = "mermaid-wrapper";
                preElement.parentNode.replaceChild(wrapper, preElement);
                
                try {
                    const { svg } = await mermaid.render(`mermaid-svg-${index}`, code, wrapper);
                    wrapper.innerHTML = svg;
                } catch (e) {
                    console.error("Mermaid parsing error:", e);
                    wrapper.innerHTML = `<div class="error-msg">Mermaid図の描画に失敗しました。</div>`;
                }
            });
            
            // Scroll to top of content
            window.scrollTo({ top: 380, behavior: "smooth" });
            
        } catch (error) {
            console.error("Fetch markdown error:", error);
            markdownContent.innerHTML = `<div class="error-msg">コンテンツの取得に失敗しました。</div>`;
        }
    }

    function renderGitHubRefs(links) {
        githubRefsGrid.innerHTML = "";
        if (!links || links.length === 0) {
            detailGithubRefs.style.display = "none";
            return;
        }
        
        detailGithubRefs.style.display = "block";
        const templateHtml = document.getElementById("github-card-template").innerHTML;
        
        links.forEach(link => {
            // Extract repo, number and mock title/state
            const regex = /https:\/\/github\.com\/([a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_]+)\/(issues|pull)\/(\d+)/;
            const match = link.match(regex);
            
            if (match) {
                const repo = match[1];
                const type = match[2];
                const number = match[3];
                
                // Mock metadata based on issues
                let title = `Fix recursive loops and stack overflows in ${type}`;
                let state = "merged";
                let stateClass = "gh-state-merged";
                
                if (number % 3 === 0) {
                    state = "open";
                    stateClass = "gh-state-open";
                    title = `Investigate timezone anomalies and clock skew inside container`;
                } else if (number % 7 === 0) {
                    state = "closed";
                    stateClass = "gh-state-closed";
                    title = `RAG context pruning limit exceeded during nested symlink walks`;
                }
                
                const cardHtml = templateHtml
                    .replace("{url}", link)
                    .replace("{repo}", repo)
                    .replace("{state}", state)
                    .replace("{state_class}", stateClass)
                    .replace("{title}", title)
                    .replace("{number}", number)
                    .replace("{date}", "2026-07");
                
                const wrapper = document.createElement("div");
                wrapper.innerHTML = cardHtml.trim();
                githubRefsGrid.appendChild(wrapper.firstChild);
            }
        });
    }

    // --------------------------------------------------------------------------
    // 4. Navigation & Views Control
    // --------------------------------------------------------------------------
    const contentSection = document.querySelector(".content-section");

    function showGridView() {
        itemsGrid.style.display = "grid";
        itemDetail.style.display = "none";
        aboutContent.style.display = "none";
        heroSec.style.display = "block";
        sidebarSec.style.display = "block";
        contentSection.classList.remove("about-mode");
        
        navLibrary.classList.add("active");
        navAbout.classList.remove("active");
    }
    
    function showAboutView() {
        itemsGrid.style.display = "none";
        itemDetail.style.display = "none";
        aboutContent.style.display = "block";
        heroSec.style.display = "none";
        sidebarSec.style.display = "none";
        contentSection.classList.add("about-mode");
        
        // Render About contents only after it is visible so Mermaid can measure widths
        setupAboutContent();
        
        navLibrary.classList.remove("active");
        navAbout.classList.add("active");
    }

    navLibrary.addEventListener("click", (e) => {
        e.preventDefault();
        showGridView();
    });
    
    navAbout.addEventListener("click", (e) => {
        e.preventDefault();
        showAboutView();
    });
    
    btnHome.addEventListener("click", showGridView);
    btnBackGrid.addEventListener("click", showGridView);

    // --------------------------------------------------------------------------
    // 5. Live Search & Category Filtering
    // --------------------------------------------------------------------------
    searchInput.addEventListener("input", (e) => {
        currentSearchQuery = e.target.value;
        searchClear.style.display = currentSearchQuery ? "block" : "none";
        renderLibrary();
    });
    
    searchClear.addEventListener("click", () => {
        searchInput.value = "";
        currentSearchQuery = "";
        searchClear.style.display = "none";
        renderLibrary();
    });

    // Tag triggers search
    document.querySelectorAll(".tag-keyword").forEach(tag => {
        tag.addEventListener("click", () => {
            const keyword = tag.textContent;
            searchInput.value = keyword;
            currentSearchQuery = keyword;
            searchClear.style.display = "block";
            renderLibrary();
        });
    });

    // Category Filter triggers
    document.querySelectorAll(".cat-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilterType = btn.getAttribute("data-type");
            renderLibrary();
        });
    });

    // --------------------------------------------------------------------------
    // 6. About Page Setup (Markdowns inside JS)
    // --------------------------------------------------------------------------
    function setupAboutContent() {
        const aboutMarkdown = `
# About Shiori

AIエージェントに「一次ソースコードとIssue」のクロスリンク情報を提供する、超軽量・高精度なナレッジベース。

---

### このサイトと Shiori の関係

**Shiori（栞）自体は、ドキュメントやコラムを自動生成するシステムではありません。**  
Shiori は、AIエージェントに対してプロジェクトの「一次ソースコード」「ADR（意思決定）」「関連Issue/PR」を一本の糸で繋いだ高精度なポインタを返す **「検索・ナビゲーションMCPサーバー（裏方）」** です。

本サイトに掲載されている43本の「AI失敗学」コラムは、**Shiori のポインタ検索能力をフル活用したAIエージェント（Gemini）が、ハルシネーションを完全に排除して自律的に執筆・合成した「成果物の実例（デモギャラリー）」**です。

> **「AIに嘘を吐かせたくなければ、真実へのポインタだけを渡せ」**  
> —— Shiori が掲げる「Pointer-then-Fetch」の基本哲学

---

### AIエージェントと Shiori の連携フロー

開発者がAIに指示を出した際、エージェントはShioriをRAGのインフラとして活用し、以下のシーケンスで情報探索とコード変更を行います。

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User as 開発者 (人間)
    participant Agent as AIエージェント
    participant Shiori as Shiori (検索MCP)
    participant GitHub as GitHub (Clones/API)

    User->>Agent: 「Issue 649のテスト失敗の原因と修正案を教えて」
    
    Note over Agent: 1. Shioriのハイブリッド検索を呼び出す
    Agent->>Shiori: shiori_search(query="container.py 649 test fail")
    
    Note over Shiori: pgvector(意味) + pgroonga(全文) で横断検索
    Shiori-->>Agent: Pointers only: [tools/container.py:111-130, issue 649]
    
    Note over Agent: 2. ポインタを評価し、必要なコードだけを取得 (Pointer-then-Fetch)
    Agent->>Shiori: shiori_read_file(path="tools/container.py", lines="111-130")
    Shiori-->>Agent: 【コード実体】 ec, out = container.exec_run(...)
    
    Agent->>GitHub: shiori_read_issue(number=649)
    GitHub-->>Agent: 【Issueコメント】 "expected 2 values to unpack..."
    
    Note over Agent: 3. 最小のコンテキストで正確に原因を特定
    Agent-->>User: 原因特定：「モックのパッチパスがズレて実コードが走り、アンパックエラーが発生しています。修正箇所は...」
\`\`\`

#### 🛠️ 実際のMCPツール連携イメージ (JSON)

AIエージェントは、Shioriが提供するMCPツールを以下のようにJSONプロトコル経由で呼び出し、必要な事実（ポインタ）だけをすくい取ります。

\`\`\`json
// 1. まず「意味（コンセプト）」と「キーワード」で横断検索する
// Tool Call: shiori_search
{
  "query": "generator.throw database operational error",
  "repo": "masuda-masuo/sunaba"
}

// Response from Shiori (必要な情報への「ポインタ」だけを返す)
{
  "hits": [
    {
      "type": "code",
      "path": "tools/vcs.py",
      "lines": "1269-1285",
      "snippet": "def publish(repo_name, branch_name): ..."
    },
    {
      "type": "issue",
      "url": "https://github.com/masuda-masuo/sunaba/issues/42",
      "title": "Fix database lock leak on exception throw in vcs.py"
    }
  ]
}
\`\`\`

---

### Shiori のコアバリュー

*   **ハイブリッド検索 (Hybrid Search)**: 単一の PostgreSQL 上で pgvector による多言語意味検索と、pgroonga による日本語検索を結合。軽量かつ高精度。
*   **クロス・リファレンス**: Issue → PR → Diff → Code の行番号に至るまで、開発プロセスの全ライフサイクルを1本に束ねて検索可能。
*   **AIファースト設計**: FastMCP 規格に準拠した13の精密なMCPツールを提供。

---

### インストール ＆ セットアップ（Coming Soon）

現在、Shiori はプライベートベータ版として開発・実走テストが行われています。  
AIエージェントの安全なオーケストレーション基盤との連携を含む「Public Release版（OSS公開）」のローンチに伴い、Docker Compose を用いた簡単なセットアップ手順をここに公開予定です。

<div style="text-align: center; margin-top: 1.5rem;">
  <div style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--accent-blue); background: rgba(0, 242, 254, 0.05); border: 1px solid var(--border-hover); padding: 0.5rem 1rem; border-radius: 30px;">
      <i class="fa-solid fa-code-fork"></i> Public Release Roadmap under construction
  </div>
</div>
        `;

        // Parse Markdown and Render
        aboutContent.innerHTML = marked.parse(aboutMarkdown);
        
        // Highlight Code
        Prism.highlightAllUnder(aboutContent);
        
        // Render Mermaid
        const mermaidBlocks = aboutContent.querySelectorAll(".language-mermaid");
        mermaidBlocks.forEach(async (block, index) => {
            const code = block.textContent;
            const preElement = block.parentNode;
            const wrapper = document.createElement("div");
            wrapper.className = "mermaid-wrapper";
            preElement.parentNode.replaceChild(wrapper, preElement);
            
            try {
                const { svg } = await mermaid.render(`about-mermaid-svg-${index}`, code, wrapper);
                wrapper.innerHTML = svg;
            } catch (e) {
                console.error("About Mermaid parsing error:", e);
                wrapper.innerHTML = `<div class="error-msg">Mermaid図の描画に失敗しました。</div>`;
            }
        });
    }

    // Run Initializer
    init();
});
