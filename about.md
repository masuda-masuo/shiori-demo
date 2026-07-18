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

### 💡 AIエージェントと Shiori の協調プロセス (探索シナリオ)

開発者の抽象的な質問から、AIエージェントが Shiori を案内役（ナビゲーター）として解決に至るまでの実際の探索プロセスです。

---

#### 👤 1. 開発者（人間）からの指示
> **「package_install ツールで、uv の速度メリットを活かせるように、$VIRTUAL_ENV がある場合のみ uv を使い、そうでない場合は pip にフォールバックする条件分岐を追加して」**

---

#### 🤖 2. エージェントによる探索（Shiori との対話）

##### **Step 1: 曖昧な指示から「真実のポインタ」を検索**
エージェントはまず、開発者の曖昧なエラー内容を Shiori のハイブリッド検索に掛け、一次情報のありか（ポインタ）を尋ねます。
*   **API 呼び出し**: `shiori_search(query="package_install uv virtual_env fallback pip")`
*   **Shiori からの回答**:
    > 💡 **探索ポインタを返却**:
    > *   ソースコード: `src/sunaba/tools/package.py`
    > *   類似・関連インシデント:
    >     *   [GitHub Issue #390 (uv優先を$VIRTUAL_ENV条件付きで再有効化)](https://github.com/masuda-masuo/sunaba/issues/390) 👈 **実在する Issue #390！**
    >     *   [GitHub Issue #380 (uv管理環境でのVirtualenv不在エラー)](https://github.com/masuda-masuo/sunaba/issues/380) 👈 **実在する Issue #380！**
    >     *   過去の恒久設計ドキュメント: `docs/design_package_install.md`

##### **Step 2: ピンポイントで事実（実体）を取得 (Pointer-then-Fetch)**
手に入れた正確な「ファイル位置」と「Issue番号」をもとに、最小限のコンテキストだけを取得します。
1.  **コードの取得**:
    *   `shiori_read_file(path="src/sunaba/tools/package.py", start_line=110, end_line=130)`
    *   ➔ **取得した実物コード**:
        ```python
        # --- Choose the installer at runtime inside the container (#390) ---
        quoted_args = " ".join(shlex.quote(a) for a in install_args)
        install_cmd = [
            "sh",
            "-c",
            'if [ -n "$VIRTUAL_ENV" ] && command -v uv >/dev/null 2>&1; '
            f"then exec uv pip {quoted_args}; "
            f"else exec pip {quoted_args}; fi",
        ]
        ```
2.  **関連する過去知見の取得 (Shiori による uv 側の仕様制限・罠の掘り下げ)**:
    *   `shiori_read_issue(number=380)`
    *   ➔ **取得した uv 側の仕様制限・動作検証の事実**:
        *   **仮想環境の必須制約**: venv（仮想環境）の外で `uv` を実行すると `No virtual environment found` で即死する。
        *   **権限とオプションの壁**: `--system` は root 権限が必要なため非 root の sandbox 実行で死に、かつ `uv` は pip の `--user`（user-site）自動フォールバックに対応していない。
        *   **キャッシュの罠の回避**: `sandbox_exec pip` は失敗結果すらキャッシュされる罠（Issue #329）があり、キャッシュを迂回する安全な `package_install` が正常に動く重要性が極めて高い。

##### **Step 3: 原因特定と修正案の提示**
コンテキストを最小限に絞り込んでいるため、ハルシネーション（嘘）を極限まで抑えて、的確な解決策を導き出します。

---

#### 👤 3. 開発者への報告
> **解決策の特定**: 「`src/sunaba/tools/package.py` において、`$VIRTUAL_ENV` 変数の有無と `uv` の存在確認を行うシェルコマンド分岐を `install_cmd` に追加しました。これにより、恒久対応で導入された標準イメージの venv を活かして `uv` で爆速インストールさせつつ、カスタムイメージでは安全に `pip` へ落ちる（後退なしの）実装が完了しました。」

---

#### 🛠️ 実際のMCPツール連携イメージ (JSON)

AIエージェントは、Shioriが提供するMCPツールを以下のようにJSONプロトコル経由で呼び出し、必要な事実（ポインタ）だけをすくい取ります。

```json
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
```

---

### Shiori のコアバリュー

*   **ハイブリッド検索 (Hybrid Search)**: 単一の PostgreSQL 上で pgvector による多言語意味検索と、pgroonga による日本語検索を結合。軽量かつ高精度。
*   **クロス・リファレンス**: Issue → PR → Diff → Code の行番号に至るまで、開発プロセスの全ライフサイクルを1本に束ねて検索可能。
*   **AIファースト設計**: FastMCP 規格に準拠した13の精密なMCPツールを提供。

---

### インストール ＆ セットアップ（Coming Soon）

現在、Shiori はプライベートベータ版として開発・実走テストが行われています。  
AIエージェントの安全なオーケストレーション基盤との連携を含む「Public Release版（OSS公開）」のローンチに伴い、Docker Compose を用いた簡単なセットアップ手順をここに公開予定です。

::: details Public Release Roadmap
<div style="text-align: center; margin-top: 0.5rem;">
  <div style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--vp-c-brand-1); background: rgba(0, 242, 254, 0.05); border: 1px solid var(--vp-c-brand-soft); padding: 0.5rem 1rem; border-radius: 30px;">
      <i class="fa-solid fa-code-fork"></i> Public Release Roadmap under construction
  </div>
</div>
:::
