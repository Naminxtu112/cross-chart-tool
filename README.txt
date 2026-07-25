十字図作成ツール（GitHub Pages 用）

【ファイル構成】
- index.html      : ページ本体
- style.css       : デザイン設定
- axis-sets.js    : 図番号と軸セット
- app.js          : クリック配置・保存処理
- README.txt      : 説明メモ

【今回の版の変更点】
- 開始画面は1つの入力パネルだけに整理
- 最初の画面では図番号と軸内容の一覧を表示しない
- 十字図の文字は手書き風フォント（Yomogi）を使用
- 文字入力のデフォルトは「マーカーなし」

【普段触るのは axis-sets.js だけでOK】
axis-sets.js の例：
{
  id: 1,
  name: "セット1",
  top: "理論的",
  bottom: "実践的",
  left: "個人的",
  right: "社会的"
}

【公開時の注意】
GitHub のリポジトリ直下に、以下のファイルをそのまま置いてください。
- index.html
- style.css
- axis-sets.js
- app.js
- README.txt

GitHub Pages の設定は以下です。
- Source: Deploy from a branch
- Branch: main
- Folder: /(root)

【保存失敗時】
ブラウザや端末の制限で PNG 保存に失敗した場合は、
「お使いの端末では画像を保存できませんでした。申し訳ありませんが、画面をスクリーンショットして保存してください。」
というメッセージが出ます。
