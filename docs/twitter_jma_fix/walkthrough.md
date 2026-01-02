# Walkthrough - Twitter Embed & JMA Data Fix

## Changes

### 1. リアルタイムTwitter情報の実装
#### [MODIFY] [index.html](file:///Users/saki/lab/anken/disaster-prevention-system/index.html)
- Twitter公式ウィジェットを埋め込み
- 検索クエリ: `#地震 OR #災害 OR #津波 OR 地震速報 lang:ja`
- 最新のツイートがリアルタイムで表示される
- サイドバーに公式アカウント（NHK、気象庁、消防庁）へのリンクを追加
- 各ハッシュタグをクリックするとTwitterの検索結果に飛ぶようにリンク化

### 2. JMA API取得の改善
#### [MODIFY] [js/api.js](file:///Users/saki/lab/anken/disaster-prevention-system/js/api.js)
**問題**: ブラウザの CORS (Cross-Origin Resource Sharing) 制限により、JMAのAPIに直接アクセスできない場合がある

**解決策**:
1. まず直接 JMA API (`www.jma.go.jp/bosai/quake/data/list.json`) にアクセスを試行
2. 失敗した場合、CORSプロキシ (`api.allorigins.win`) 経由で再試行
3. 詳細なコンソールログを追加（開発者ツールで確認可能）

**ログ出力例**:
```
Attempting to fetch from: https://www.jma.go.jp/bosai/quake/data/list.json
Successfully fetched earthquake data: 100 items
```

### 3. renderSNS削除
#### [MODIFY] [js/app.js](file:///Users/saki/lab/anken/disaster-prevention-system/js/app.js)
- モックのSNSレンダリングを削除
- Twitter公式ウィジェットが自動で読み込み・レンダリングするため、JavaScript側の処理は不要

## 検証方法

### JMA地震情報の確認
1. ブラウザの開発者ツール (F12) を開く
2. Consoleタブで以下のメッセージを確認:
   - `Attempting to fetch...`
   - `Successfully fetched earthquake data: X items` (成功時)
   - または警告メッセージ（失敗時）
3. 地図上に最新の地震情報（赤・黄色の円）が表示されることを確認

### Twitter埋め込みの確認
1. 「SNS情報/速報」タブをクリック
2. 数秒後、実際のTwitterタイムラインが表示される
3. 災害関連の最新ツイートが表示されることを確認
