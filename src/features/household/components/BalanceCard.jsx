// 残高カードコンポーネント
// 現在の合計残高を表示するカード。
// props:
//   balance (number) — 合計残高（収入 - 支出）

export default function BalanceCard({ balance }) {
  const formatMoney = (num) => new Intl.NumberFormat('ja-JP').format(num)

  return (
    <section className="balance-card">
      <div className="balance-label">現在の残高</div>
      <div className="balance-amount">
        {formatMoney(balance)}<span>円</span>
      </div>
    </section>
  )
}
