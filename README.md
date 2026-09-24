# 物理現象シミュレーションゲーム

スマートフォンを「物理実験装置」に見立て、傾ける・振る・タップするといった操作で物理現象そのものを楽しむゲーム。

## 公開URL

https://uchi-stock.github.io/kids-game/

mainブランチへのpushをトリガーに、GitHub Actionsで自動ビルド・デプロイされる（`.github/workflows/deploy.yml`）。

## 現状

MVPステージ1「砂シミュレーション」のPOCを実装済み（Issue #1）。

- スマホの傾き（DeviceOrientation API）を重力方向として反映し、砂が流れる
- センサー非対応・許可拒否・値取得不可の環境では、画面ドラッグによるフォールバック操作へ自動的に切り替わる
- 砂をゴール領域まで集めるとクリア判定

## セットアップ

```sh
npm install
npm run dev
```

## スクリプト

- `npm run dev`: 開発サーバー起動
- `npm run build`: 本番ビルド
- `npm run lint`: ESLintによる静的チェック
- `npm run test`: Vitestによるユニットテスト

## ディレクトリ構成

- `src/sim/`: 物理シミュレーション・ステージ判定（純粋関数、DOM非依存）
- `src/input/`: スマホの傾き・ドラッグ入力を重力ベクトルへ変換する層
- `src/main.js`: 上記を組み合わせてCanvas描画・ゲームループを構成するエントリーポイント
- `src/__tests__/`: ユニットテスト
