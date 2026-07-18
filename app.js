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
                const currentId = document.getElementById("detail-id-tag").textContent;
                
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
            setupAboutContent();
            
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
            let markdown = await response.readText ? await response.readText() : await response.text();
            
            // Clean title header from content to avoid duplicate H1
            markdown = markdown.replace(/^#\s+.+$/m, "");
            
            // Parse Markdown
            markdownContent.innerHTML = marked.parse(markdown);
            
            // Re-Highlight Syntax code
            Prism.highlightAllUnder(markdownContent);
            
            // Re-Render Mermaid Diagrams dynamically
            const mermaidBlocks = markdownContent.querySelectorAll(".language-mermaid");
            mermaidBlocks.forEach((block, index) => {
                const code = block.textContent;
                const containerId = `mermaid-diag-${index}`;
                const wrapper = document.createElement("div");
                wrapper.className = "mermaid-wrapper";
                wrapper.id = containerId;
                block.parentNode.replaceChild(wrapper, block);
                
                try {
                    mermaid.render(`mermaid-svg-${index}`, code, (svgCode) => {
                        wrapper.innerHTML = svgCode;
                    });
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
        aboutContent.innerHTML = `
            <div class="about-hero">
                <svg viewBox="0 0 100 100" class="about-logo-large">
                    <rect x="25" y="15" width="50" height="70" rx="8" fill="none" stroke="url(#logo-grad-l)" stroke-width="5"/>
                    <path d="M45 15 L45 85" stroke="url(#logo-grad-l)" stroke-width="4" stroke-dasharray="4 4"/>
                    <path d="M60 30 L75 30 M60 45 L75 45 M60 60 L70 60" stroke="url(#logo-grad-l)" stroke-width="4" stroke-linecap="round"/>
                    <rect x="35" y="25" width="6" height="50" rx="3" fill="url(#logo-grad-l)"/>
                    <defs>
                        <linearGradient id="logo-grad-l" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#00f2fe" />
                            <stop offset="100%" stop-color="#4facfe" />
                        </linearGradient>
                    </defs>
                </svg>
                <h2 class="about-title">About Shiori</h2>
                <p class="about-subtitle">AIエージェントに「一次ソースコードとIssue」のクロスリンク情報を提供する、超軽量・高精度なナレッジベース。</p>
            </div>

            <div class="markdown-body">
                <h3>このサイトと Shiori の関係</h3>
                <p>
                    <strong>Shiori（栞）自体は、ドキュメントやコラムを自動生成するシステムではありません。</strong><br>
                    Shiori は、AIエージェントに対してプロジェクトの「一次ソースコード」「ADR（意思決定）」「関連Issue/PR」を一本の糸で繋いだ高精度なポインタを返す **「検索・ナビゲーションMCPサーバー（裏方）」** です。
                </p>
                <p>
                    本サイトに掲載されている43本の「AI失敗学」コラムは、<strong>Shiori のポインタ検索能力をフル活用したAIエージェント（Gemini）が、ハルシネーションを完全に排除して自律的に執筆・合成した「成果物の実例（デモギャラリー）」</strong>です。
                </p>
                
                <blockquote>
                    <strong>「AIに嘘を吐かせたくなければ、真実へのポインタだけを渡せ」</strong>
                    <br>—— Shiori が掲げる「Pointer-then-Fetch」の基本哲学
                </blockquote>
            </div>

            <div class="about-grid">
                <div class="about-feature">
                    <div class="feature-icon-wrapper"><i class="fa-solid fa-bolt feature-icon"></i></div>
                    <h4 class="feature-title">ハイブリッド検索 (Hybrid Search)</h4>
                    <p class="feature-desc">単一の PostgreSQL 上で pgvector による多言語意味検索と、pgroonga による日本語厳密キーワード検索を結合。8GBのメモリ制約下でも超高速・超軽量に動きます。</p>
                </div>

                <div class="about-feature">
                    <div class="feature-icon-wrapper"><i class="fa-solid fa-link feature-icon"></i></div>
                    <h4 class="feature-title">クロス・リファレンス</h4>
                    <p class="feature-desc">Issue → Pull Request → Commit Diff → Code の行番号に至るまで、開発プロセスの全ライフサイクルを1本に束ねて検索可能。AIが文脈を見失うことを防ぎます。</p>
                </div>

                <div class="about-feature">
                    <div class="feature-icon-wrapper"><i class="fa-solid fa-shield-halved feature-icon"></i></div>
                    <h4 class="feature-title">AIファースト設計</h4>
                    <p class="feature-desc">FastMCP 規格に準拠した13の精密なMCPツールを提供。AIエージェントが、人間にいちいち聞かずに「証拠（過去のADRやインシデント）」に基づいて行動方針を判断できます。</p>
                </div>
            </div>

            <div class="markdown-body" style="margin-top: 3.5rem; text-align: center; max-width: 650px; margin-left: auto; margin-right: auto; border-top: 1px solid var(--border-glass); padding-top: 2.5rem;">
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">インストール ＆ セットアップ（Coming Soon）</h3>
                <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.7; margin-bottom: 1.5rem;">
                    現在、Shiori はプライベートベータ版として開発・実走テストが行われています。<br>
                    AIエージェントの安全なオーケストレーション基盤との連携を含む「Public Release版（OSS公開）」のローンチに伴い、Docker Compose を用いた簡単なセットアップ手順をここに公開予定です。
                </p>
                <div style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--accent-blue); background: rgba(0, 242, 254, 0.05); border: 1px solid var(--border-hover); padding: 0.5rem 1rem; border-radius: 30px;">
                    <i class="fa-solid fa-code-fork"></i> Public Release Roadmap under construction
                </div>
            </div>
        `;
    }

    // Run Initializer
    init();
});
