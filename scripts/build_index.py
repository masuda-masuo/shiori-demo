import os
import json
import re

# パス設定
COLUMNS_DIR = "/home/masuda/shiori/data/repos/masuda-masuo__zenn-content/columns"
HISTORY_DIR = "/home/masuda/shiori/data/repos/masuda-masuo__zenn-content/history"
OUTPUT_DIR = "/home/masuda/shiori-demo"
COLUMNS_DEST = os.path.join(OUTPUT_DIR, "content/columns")
HISTORY_DEST = os.path.join(OUTPUT_DIR, "content/history")

# 出力先ディレクトリの作成
os.makedirs(COLUMNS_DEST, exist_ok=True)
os.makedirs(HISTORY_DEST, exist_ok=True)

def parse_markdown(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # タイトル（# タイトル）の抽出
    title_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
    title = title_match.group(1) if title_match else os.path.basename(file_path)
    
    # 概要（最初の数行、または## 概要、または最初の段落）の抽出
    # 簡単のため、最初の段落（空行で区切られた最初の250文字）を取得
    paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
    summary = ""
    for p in paragraphs:
        if not p.startswith("#") and not p.startswith("```"):
            summary = p[:180] + "..." if len(p) > 180 else p
            break
            
    # 実際のGitHubリンクの抽出
    github_links = re.findall(r"https://github\.com/[a-zA-Z0-9\-_]+/[a-zA-Z0-9\-_]+/(?:issues|pull)/\d+", content)
    github_links = list(set(github_links)) # 重複排除
    
    return {
        "filename": os.path.basename(file_path),
        "title": title,
        "summary": summary,
        "links": github_links
    }

def process_directory(src_dir, dest_dir, prefix):
    items = []
    files = sorted([f for f in os.listdir(src_dir) if f.endswith(".md")])
    for filename in files:
        src_path = os.path.join(src_dir, filename)
        dest_path = os.path.join(dest_dir, filename)
        
        # ファイルのコピー
        with open(src_path, "r", encoding="utf-8") as f:
            data = f.read()
        with open(dest_path, "w", encoding="utf-8") as f:
            f.write(data)
            
        # メタデータの抽出
        meta = parse_markdown(src_path)
        meta["type"] = prefix
        # 番号の抽出（42_xxx.md -> 42）
        num_match = re.match(r"^(\d+)_", filename)
        meta["id"] = int(num_match.group(1)) if num_match else filename
        items.append(meta)
        
    return items

# インデックスの生成とコピーの実行
print("Processing columns...")
columns_meta = process_directory(COLUMNS_DIR, COLUMNS_DEST, "column")
print("Processing histories...")
history_meta = process_directory(HISTORY_DIR, HISTORY_DEST, "history")

index_data = {
    "columns": columns_meta,
    "histories": history_meta
}

with open(os.path.join(OUTPUT_DIR, "content/index.json"), "w", encoding="utf-8") as f:
    json.dump(index_data, f, ensure_ascii=False, indent=2)

print(f"Successfully generated index with {len(columns_meta)} columns and {len(history_meta)} histories.")
