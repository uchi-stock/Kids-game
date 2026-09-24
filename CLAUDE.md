@dev-standards/CLAUDE.md

# プロジェクト固有情報

## プロダクト概要

物理現象シミュレーションゲーム。スマートフォンを「物理実験装置」に見立て、傾ける・振る・タップするといった操作で物理現象そのものを楽しむゲーム。詳細は[README.md](README.md)を参照。

## 技術構成

- Vite + Vanilla JS + Canvas（単一パッケージ、リポジトリルート直下）
- dev-standards標準のフロントエンド構成（React + TypeScript + Bootstrap）へは移行していない。既存構成のまま`reusable-ci.yml`の`packages`モードでCI/CDを運用する
- ホスティング: GitHub Pages（`.github/workflows/deploy.yml`）。dev-standards標準のS3 + CloudFrontは採用していない

## CI/CD構成

- `reusable-ci.yml`（`packages: '[{"dir":".","build":true,"node_version":"22"}]'`、`enable_standards_check: true`、`enable_dead_link_check: true`）でlint・test・buildと、dev-standards submoduleへのsymlink整合性チェック・ドキュメント間（README.md・CLAUDE.md）のリンク切れチェックを実行し、成功後は自動でsquash mergeされる
- `reusable-cd.yml`（semantic-releaseによるバージョン管理）は導入していない。デプロイは独立した`deploy.yml`（mainへのpushトリガー）が担う
