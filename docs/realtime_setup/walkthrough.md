# Walkthrough - リアルタイムデータ化

## 実施内容

### 1. ローカルHTTPサーバーの起動
```bash
python3 -m http.server 8000
```
- **ポート**: 8000
- **URL**: http://localhost:8000
- **目的**: Twitter埋め込みウィジェットの動作に必要（file://プロトコルでは動作しない）

### 2. ダミーデータの削除
#### [MODIFY] [js/data.js](file:///Users/saki/lab/anken/disaster-prevention-system/js/data.js)

**変更前**:
```javascript
alerts: [
    { id: 1, type: '緊急地震速報', ... },  // シミュレーションデータ
    { id: 2, type: '大雨警報', ... },
    { id: 3, type: '津波注意報', ... }
]
```

**変更後**:
```javascript
// 初期状態は空配列
alerts: []
```

### 3. データフロー

1. **ページ読み込み時**: `alerts` は空配列
2. **app.js の init()**: `fetchRealData()` を実行
3. **api.js の fetchEarthquakes()**: JMA API からデータ取得
4. **成功時**: 気象庁の地震情報で `alerts` を上書き
5. **失敗時**: 空のまま（地震がない状態として表示）

## アクセス方法

ブラウザで以下のURLを開く：
```
http://localhost:8000
```

## 確認項目

### ✓ Twitterタイムライン
- SNS情報タブで実際のツイートが表示される
- 「#地震」「#災害」などのリアルタイム情報

### ✓ 地震情報
- JMA APIから取得した実際の地震データが表示される
- 地震がない場合、地図上にマーカーは表示されない
- コンソールに「Loaded Real JMA Data: X」または「Using Simulation Data」と表示

### ✓ 震度等高線
- 実際の地震が発生している場合、マグニチュードに応じた震度分布が表示される
- 各円の上部に「震度X」のラベルが表示される

## サーバー終了方法

ターミナルで `Ctrl + C` を押す
