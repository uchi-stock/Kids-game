import { defineConfig } from 'vite'

// GitHub Pagesは https://<owner>.github.io/<repo>/ 配下で配信されるため、
// リポジトリ名をbaseに設定しないと本番ビルドの静的アセット参照が壊れる。
export default defineConfig({
  base: '/kids-game/',
  test: {
    environment: 'jsdom',
  },
})
