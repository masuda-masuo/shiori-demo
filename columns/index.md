# 技術コラム一覧

Shiori（検索MCP）を用いてAIエージェントが自律執筆した技術コラムの一覧です。

<script setup>
import { data as posts } from './posts.data.js'
</script>

<div class="posts-list">
  <div v-for="post in posts" :key="post.url" class="post-card">
    <a :href="post.url" class="post-link">
      <span class="post-id">#{{ post.id }}</span>
      <span class="post-title">{{ post.title }}</span>
    </a>
    <p class="post-summary">{{ post.summary }}</p>
  </div>
</div>

<style scoped>
.posts-list {
  margin-top: 2rem;
  display: grid;
  gap: 1.5rem;
}
.post-card {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.25s, background-color 0.25s;
}
.post-card:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-elv);
}
.post-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1.2rem;
  color: var(--vp-c-brand-1) !important;
  text-decoration: none !important;
}
.post-link:hover {
  color: var(--vp-c-brand-2) !important;
}
.post-id {
  font-family: var(--vp-font-family-mono);
}
.post-summary {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}
</style>
