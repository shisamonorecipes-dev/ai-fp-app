// 収支リストコンポーネント
// props:
//   transactions    (array)      — 収支データの配列
//   onEdit          (func)       — 行タップ時。引数: transaction オブジェクト
//   onDeleteRequest (func)       — 🗑️タップ時。引数: id（確認UIを表示する）
//   onDeleteConfirm (func)       — 「削除する」ボタン押下時。引数: id
//   onDeleteCancel  (func)       — 「キャンセル」ボタン押下時
//   confirmDeleteId (number|null)— 現在削除確認中の行ID

const formatMoney = (num) => new Intl.NumberFormat('ja-JP').format(num)

export default function TransactionList({
  transactions,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
  confirmDeleteId,
}) {
  return (
    <section className="transaction-list">
      {transactions.length === 0 ? (
        <div className="transaction-empty">
          まだ記録がありません。＋ボタンから追加してください。
        </div>
      ) : (
        transactions.map(tx => {
          const isConfirming = confirmDeleteId === tx.id

          return (
            <div key={tx.id} className={`transaction-item ${isConfirming ? 'transaction-confirming' : ''}`}>
              {isConfirming ? (
                /* ── 削除確認UI（インライン展開） ── */
                <div className="delete-confirm">
                  <span className="delete-confirm-text">本当に削除しますか？</span>
                  <div className="delete-confirm-actions">
                    <button
                      className="delete-confirm-cancel"
                      onClick={onDeleteCancel}
                    >
                      キャンセル
                    </button>
                    <button
                      className="delete-confirm-ok"
                      onClick={() => onDeleteConfirm(tx.id)}
                    >
                      削除する
                    </button>
                  </div>
                </div>
              ) : (
                /* ── 通常の行表示 ── */
                <>
                  {/* 左側：カテゴリ・日付（タップで編集） */}
                  <div
                    className="t-info"
                    onClick={() => onEdit(tx)}
                    role="button"
                    tabIndex={0}
                    title="タップして編集"
                  >
                    <h4>{tx.category}</h4>
                    <div className="t-date">{tx.date}{tx.memo && ` - ${tx.memo}`}</div>
                  </div>

                  {/* 右側：金額 + 削除ボタン */}
                  <div className="t-right">
                    <div className={`t-amount ${tx.type === 'expense' ? 't-expense' : 't-income'}`}>
                      {tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount)} 円
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => onDeleteRequest(tx.id)}
                      title="削除"
                      aria-label={`${tx.category}を削除`}
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })
      )}
    </section>
  )
}
