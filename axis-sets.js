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
 *   top: "上側の意味",
 *   bottom: "下側の意味",
 *   left: "左側の意味",
 *   right: "右側の意味"
 * }
 */

window.AXIS_SETS = [
  {
    id: 1,
    name: "セット1",
    top: "理論的",
    bottom: "実践的",
    left: "個人的",
    right: "社会的"
  },
  {
    id: 2,
    name: "セット2",
    top: "長期的",
    bottom: "短期的",
    left: "低リスク",
    right: "高リスク"
  },
  {
    id: 3,
    name: "セット3",
    top: "革新的",
    bottom: "保守的",
    left: "専門的",
    right: "一般的"
  },
  {
    id: 4,
    name: "セット4",
    top: "抽象的",
    bottom: "具体的",
    left: "受動的",
    right: "能動的"
  }
];
