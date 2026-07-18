---
layout: home

hero:
  name: "Shiori Demo Library"
  text: "AI×栞 による「失敗学」の全軌跡"
  tagline: "Shiori（検索MCP）をフル活用したAIエージェントが、ハルシネーションを完全に排除して自律執筆した技術コラムギャラリー"
  actions:
    - theme: brand
      text: コラムを読む
      link: /columns/index
    - theme: alt
      text: Shioriについて詳しく
      link: /about

features:
  - icon: 🔍
    title: ハイブリッド意味・キーワード検索
    details: PostgreSQL上でpgvector（多言語ベクトル意味検索）とpgroonga（日本語厳密全文検索）を統合。超軽量・高速に動作します。
  - icon: 🔗
    title: 開発プロセス全体のクロスリンク
    details: Issue → Pull Request → Commit Diff → Code（行番号）までを1本のインデックスに束ね、AIが開発文脈を見失うのを防止。
  - icon: 🤖
    title: AIエージェント自律執筆の成果
    details: 掲載された43本の「AI失敗学」コラムは、Shioriのポインタ検索機能を使ってエージェントが自律的に調査・執筆した本物のギャラリー。
---

::: info Notice
本サイトは、**Shiori（検索MCPサーバー/裏方）**を用いてAIエージェントが開発リポジトリから一次情報を自動スキャンし、自律生成したコラムライブラリです。Shiori自体はブログ生成ツールではありません。
:::

<script setup>
import { withBase } from 'vitepress'
import { data as columns } from './columns/posts.data.js'
import { data as histories } from './history/posts.data.js'
import { ref, computed } from 'vue'

const allItems = computed(() => {
  return [...columns, ...histories].sort((a, b) => b.id - a.id)
})
</script>

<div class="archive-section">
  <h2 class="archive-header">📚 コラム ＆ 実走履歴アーカイブ (全 {{ allItems.length }} 件)</h2>
  <p class="archive-intro">Shiori の強力なポインタ検索機能により、AIエージェントがハルシネーションを起こさずに自律調査・執筆したドキュメントの実績一覧です。</p>

  <div class="archive-grid">
    <div v-for="item in allItems" :key="item.url" class="archive-card">
      <a :href="withBase(item.url)" class="archive-link">
        <div class="card-meta">
          <span class="item-badge" :class="item.url.includes('/columns/') ? 'badge-column' : 'badge-history'">
            {{ item.url.includes('/columns/') ? 'Column' : 'History' }}
          </span>
          <span class="item-id">#{{ item.id }}</span>
        </div>
        <div class="item-title">{{ item.title }}</div>
      </a>
      <p class="item-summary">{{ item.summary }}</p>
    </div>
  </div>
</div>

<style scoped>
.archive-section {
  margin-top: 4rem;
  padding: 0 1.5rem;
  max-width: 1152px;
  margin-left: auto;
  margin-right: auto;
}
.archive-header {
  font-size: 1.8rem;
  font-weight: 700;
  border-bottom: none;
  margin-bottom: 0.5rem;
}
.archive-intro {
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
  margin-bottom: 2.5rem;
}
.archive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}
.archive-card {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
}
.archive-card:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-elv);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 242, 254, 0.08);
}
.archive-link {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-decoration: none !important;
  color: inherit !important;
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.item-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}
.badge-column {
  background: rgba(0, 242, 254, 0.1);
  color: #00f2fe;
}
.badge-history {
  background: rgba(255, 0, 128, 0.1);
  color: #ff0080;
}
.item-id {
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}
.item-title {
  font-weight: 600;
  font-size: 1.15rem;
  line-height: 1.4;
  color: var(--vp-c-text-1) !important;
  transition: color 0.25s;
}
.archive-card:hover .item-title {
  color: var(--vp-c-brand-1) !important;
}
.item-summary {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  flex-grow: 1;
}
</style>
