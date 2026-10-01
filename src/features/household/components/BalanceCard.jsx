// 残高カードコンポーネント
// 現在の合計残高を表示するカード。
// props:
//   balance (number) — 合計残高（収入 - 支出）

export default function BalanceCard({ balance, onHelpClick }) {
  const formatMoney = (num) => new Intl.NumberFormat('ja-JP').format(num)

  return (
    <section className="balance-card">
      <div className="balance-header-row">
        <div className="balance-label">総残高（全期間累計）</div>
        <button className="help-icon-btn" onClick={onHelpClick} title="使い方">
          <span className="help-icon">?</span>
        </button>
      </div>
      <div className="balance-amount">
        {formatMoney(balance)}<span>円</span>
      </div>
    </section>
  )
}
