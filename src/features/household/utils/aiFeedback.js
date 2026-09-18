// aiFeedback.js
// 収支データから動的な「AIアドバイス」を生成するためのユーティリティ

export function generateAIFeedback(transactions, targetMonth) {
  // 指定された月のトランザクションを抽出
  const monthlyTxs = transactions.filter(tx => tx.date.startsWith(targetMonth))

  if (monthlyTxs.length === 0) {
    return "今月のデータがありません。まずは日々の収支を記録してみましょう！"
  }

  let totalIncome = 0
  let totalExpense = 0
  const expenseByCategory = {}

  monthlyTxs.forEach(tx => {
    if (tx.type === 'income') {
      totalIncome += tx.amount
    } else {
      totalExpense += tx.amount
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount
    }
  })

  // 1. 赤字アラート（収入があり、かつ支出が収入を上回っている場合）
  if (totalIncome > 0 && totalExpense > totalIncome) {
    return "⚠️ 今月は支出が収入を上回っています。使いすぎている項目がないか、分析タブで確認してみましょう。"
  }

  // 2. カテゴリ別の使いすぎアラート
  if (totalExpense > 0) {
    // 食費が全体の支出の35%以上を占めている場合
    if (expenseByCategory['食費'] && (expenseByCategory['食費'] / totalExpense) > 0.35) {
      return "💡 食費の割合が少し高めです。外食を1回減らすだけでも、良い節約になりますよ！"
    }
    // 交際費や娯楽が全体の30%以上の場合
    const funExpense = (expenseByCategory['交際費'] || 0) + (expenseByCategory['娯楽'] || 0)
    if ((funExpense / totalExpense) > 0.3) {
      return "💡 娯楽や交際費の割合が高めですね。リフレッシュも大切ですが、予算内かチェックしてみましょう。"
    }
  }

  // 3. 貯蓄ペースが良好な場合（収入の20%以上が残っている場合）
  if (totalIncome > 0 && (totalIncome - totalExpense) >= (totalIncome * 0.2)) {
    return "✨ 素晴らしいペースです！収入の20%以上を確保できています。この調子で資産を増やしていきましょう！"
  }

  // 4. デフォルトのポジティブメッセージ（上記の条件に当てはまらない、かつ入力がある）
  const messages = [
    "順調に記録できていますね！引き続き、日々の収支をチェックしていきましょう。",
    "記録お疲れ様です。こまめな入力が、将来の確かな資産形成に繋がりますよ！",
    "いいペースです！月末の振り返りを楽しみにしながら記録を続けましょう。"
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}
