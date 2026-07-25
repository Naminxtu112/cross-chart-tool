/*
 * 十字図の軸セットを登録するファイルです。
 *
 * 新しい図を増やす場合は、下の配列に同じ形式で1件追加してください。
 * id は重複しない整数にしてください。
 *
 * 例：
 * {
 *   id: 5,
 *   name: "セット5",
 *   title: "○○の時の反応は？", // 空欄なら ""
 *   top: "上側の意味",
 *   bottom: "下側の意味",
 *   left: "左側の意味",
 *   right: "右側の意味"
 * }
 */

window.AXIS_SETS = [
  {
    id: 1,
    name: "No. 1",
    title: "キスしたいとき",
    top: "勝手にする",
    bottom: "許可をとる",
    left: "ねっとりする",
    right: "あっさりする"
  },
  {
    id: 2,
    name: "No. 2",
    title: "愛が……",
    top: "重い",
    bottom: "重くない",
    left: "嫉妬深い",
    right: "ドライ"
  },
  {
    id: 3,
    name: "No. 3",
    title: "相手が色っぽい恰好をして居たら……",
    top: "怒る",
    bottom: "喜ぶ",
    left: "照れる",
    right: "興奮する"
  },
  {
    id: 4,
    name: "No. 4",
    title: "喧嘩したとき",
    top: "自分から謝る",
    bottom: "相手が謝るを待つ",
    left: "態度に出す",
    right: "態度に出さない"
  },
  {
    id: 5,
    name: "No. 5",
    title: "あなたの推したちは……",
    top: "カッコイイ",
    bottom: "カワイイ",
    left: "しっかりしてる",
    right: "天然"
  },
  {
    id: 6,
    name: "No. 6",
    title: "人間関係において",
    top: "過去を振り返る",
    bottom: "未来を見ている",
    left: "社交的",
    right: "内向的"
  },
  {
    id: 7,
    name: "No. 7",
    title: "大事な人の姿をした敵を……",
    top: "倒せる",
    bottom: "倒せない",
    left: "迷う",
    right: "躊躇しない"
  },
  {
    id: 8,
    name: "No. 8",
    title: "中身と外見について",
    top: "中身がカッコイイ",
    bottom: "中身が可愛い",
    left: "外見がカッコイイ",
    right: "外見が可愛い"
  },
  {
    id: 9,
    name: "No. 9",
    title: "自分が犠牲になれば相手が助かるというシチュエーションで……",
    top: "犠牲になる",
    bottom: "犠牲にならない",
    left: "躊躇する",
    right: "迷わない"
  },
  {
    id: 10,
    name: "No. 10",
    title: "性格は……",
    top: "自由人",
    bottom: "真面目",
    left: "静か",
    right: "騒がしい"
  }
];
