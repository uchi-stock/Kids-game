import { defineConfig } from 'vite'

// GitHub Pagesは https://<owner>.github.io/<repo>/ 配下で配信される。
// リポジトリ名の大文字小文字を含めて実際の配信パスと一致させる必要があり、
// リポジトリ名変更後もGitHub Pages側のURLが追従しないケースが実機で確認された
// （リポジトリを"kids-game"へリネームしても、既存のPagesサイトの配信URLは
// リネーム前の"Kids-game"のまま変わらなかった）。ハードコードすると再び同じ
// 不一致が起きるため、CI（.github/workflows/deploy.yml）がビルド時に
// `github.event.repository.name`（実際のリポジトリ名）からVITE_BASEを注入し、
// それをそのまま使う。ローカル開発（未設定時）はルート配信として扱う。
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  test: {
    environment: 'jsdom',
    // dev-standardsはsubmodule（別プロジェクト）のため、自身のテストは
    // 対象に含めない。
    exclude: ['**/node_modules/**', 'dev-standards/**'],
  },
})
