# Go-River 記事生成システム - Webアプリ版

## 概要

音声ファイルから記事と図解を自動生成するWebアプリケーションです。
Netlifyにデプロイして使用します。

## 機能

1. **音声→文字起こし** (Gemini API)
2. **文字起こし→記事生成** (Claude API)
3. **図解SVG自動生成** (Claude API)
4. **アイキャッチ画像生成** (Replicate API / 任意)
5. **エクスポート** (Markdown, クリップボード)

## 技術スタック

- **フロントエンド**: HTML/CSS/JavaScript (フレームワーク不使用)
- **バックエンド**: Netlify Functions (サーバーレス)
- **API**:
  - Gemini API (文字起こし)
  - Claude API (記事生成・図解生成)
  - Replicate API (画像生成・任意)

## セットアップ手順

### 1. 必要なAPIキーを取得

| API | 取得先 | 用途 |
|-----|--------|------|
| Gemini API | https://aistudio.google.com/ | 音声→文字起こし |
| Claude API | https://console.anthropic.com/ | 記事・図解生成 |
| Replicate API | https://replicate.com/ | アイキャッチ画像（任意） |

### 2. Netlifyにデプロイ

#### 方法A: GitHub連携（推奨）

1. このフォルダをGitHubリポジトリにプッシュ
2. [Netlify](https://netlify.com/) にログイン
3. 「Add new site」→「Import an existing project」
4. GitHubリポジトリを選択
5. Build settings:
   - Build command: (空欄のまま)
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
6. 「Deploy site」をクリック

#### 方法B: 手動デプロイ

```bash
# Netlify CLIをインストール
npm install -g netlify-cli

# ログイン
netlify login

# デプロイ
cd webapp
netlify deploy --prod
```

### 3. 使い方

1. デプロイしたURLにアクセス
2. APIキーを入力して保存
3. 音声ファイルをアップロード
4. 「文字起こし開始」→「記事を生成」→「図解を生成」
5. エクスポート

## ファイル構成

```
webapp/
├── public/
│   └── index.html          # フロントエンド
├── netlify/
│   └── functions/
│       ├── transcribe.js   # 文字起こしAPI
│       ├── article.js      # 記事生成API
│       ├── diagram.js      # 図解SVG生成API
│       └── eyecatch.js     # アイキャッチ画像API
├── netlify.toml            # Netlify設定
├── package.json
└── README.md
```

## API料金目安

| 処理 | API | 料金目安 |
|------|-----|----------|
| 30分音声の文字起こし | Gemini | 無料枠内 |
| 記事生成 | Claude | $0.01〜0.05/記事 |
| 図解生成（4枚） | Claude | $0.02〜0.10/記事 |
| アイキャッチ | Replicate | $0.003/枚 |
| **合計** | | **$0.05〜0.20/記事** |

## セキュリティ

- APIキーはブラウザのLocalStorageに保存
- サーバーには保存されず、各APIに直接送信
- HTTPSで暗号化

## トラブルシューティング

### 文字起こしが失敗する
- Gemini APIキーが正しいか確認
- 音声ファイルが対応形式か確認（MP3, M4A, WAV, WebM, OGG）
- ファイルサイズが大きすぎないか確認（50MB以下推奨）

### 記事生成が失敗する
- Claude APIキーが正しいか確認
- APIの利用制限に達していないか確認

### 図解が生成されない
- 記事内に「＞＞図解＜＜」マーカーがあるか確認
- Claude APIの利用制限を確認

## ローカル開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:8888 を開く
```

## ライセンス

Copyright 2024 Go-River. All rights reserved.
