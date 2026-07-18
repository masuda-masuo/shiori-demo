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
