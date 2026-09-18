// CalendarView.jsx
// 月次カレンダーコンポーネント
// props:
//   transactions  (array)      — 全収支データ
//   selectedMonth (string)     — 表示中の月 "YYYY-MM"
//   selectedDate  (string|null)— 選択中の日付 "YYYY-MM-DD"
//   onSelectDate  (func)       — 日付タップ時。引数: "YYYY-MM-DD"（同じ日で再タップ → null で解除）
//   onPrevMonth   (func)       — 前月へ
//   onNextMonth   (func)       — 次月へ

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

const formatMoney = (num) => new Intl.NumberFormat('ja-JP').format(num)

export default function CalendarView({
  transactions,
  selectedMonth,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}) {
  const [year, month] = selectedMonth.split('-').map(Number)

  // --- カレンダーグリッドの生成 ---
  const firstDay   = new Date(year, month - 1, 1).getDay()  // 月初の曜日（0=日, 6=土）
  const daysInMonth = new Date(year, month, 0).getDate()     // 月の日数

  // 42マス（6週 × 7日）のセルを生成
  const cells = []
  for (let i = 0; i < 42; i++) {
    const dayNum = i - firstDay + 1
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push(null)  // 当月外の空白
    } else {
      cells.push(dayNum)
    }
  }

  // --- 当月のトランザクションを日付でグループ化 ---
  const txByDate = {}
  transactions.forEach(tx => {
    if (tx.date.startsWith(selectedMonth)) {
      if (!txByDate[tx.date]) txByDate[tx.date] = []
      txByDate[tx.date].push(tx)
    }
  })

  // --- 当月の収入・支出合計 ---
  const monthlyTxs = transactions.filter(tx => tx.date.startsWith(selectedMonth))
  const monthlyIncome  = monthlyTxs.filter(t => t.type === 'income' ).reduce((s, t) => s + t.amount, 0)
  const monthlyExpense = monthlyTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // --- 日付文字列の生成 ---
  const toDateStr = (dayNum) =>
    `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`

  // --- 今日の日付 ---
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="calendar-view">

      {/* 月次切り替えヘッダー */}
      <div className="calendar-header">
        <button className="month-nav-btn" onClick={onPrevMonth} id="prev-month-btn">‹</button>
        <span className="calendar-month-title">{year}年{month}月</span>
        <button className="month-nav-btn" onClick={onNextMonth} id="next-month-btn">›</button>
      </div>

      {/* 月次サマリー */}
      <div className="monthly-summary">
        <div className="summary-item summary-income">
          <span className="summary-label">収入</span>
          <span className="summary-value">+{formatMoney(monthlyIncome)}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item summary-expense">
          <span className="summary-label">支出</span>
          <span className="summary-value">-{formatMoney(monthlyExpense)}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-label">収支</span>
          <span className={`summary-value ${monthlyIncome - monthlyExpense >= 0 ? 'summary-positive' : 'summary-negative'}`}>
            {monthlyIncome - monthlyExpense >= 0 ? '+' : ''}{formatMoney(monthlyIncome - monthlyExpense)}
          </span>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="calendar-grid">
        {WEEKDAYS.map((d, i) => (
          <div key={d} className={`weekday-header ${i === 0 ? 'sunday' : i === 6 ? 'saturday' : ''}`}>
            {d}
          </div>
        ))}

        {/* 日付セル */}
        {cells.map((dayNum, i) => {
          if (dayNum === null) {
            return <div key={`empty-${i}`} className="calendar-cell empty" />
          }

          const dateStr    = toDateStr(dayNum)
          const isToday    = dateStr === today
          const isSelected = dateStr === selectedDate
          const hasTx      = !!txByDate[dateStr]
          const dayOfWeek  = (firstDay + dayNum - 1) % 7

          // その日の支出と収入を確認（ドットの色分け用）
          const dayTxs       = txByDate[dateStr] || []
          const hasExpense   = dayTxs.some(t => t.type === 'expense')
          const hasIncome    = dayTxs.some(t => t.type === 'income')

          return (
            <button
              key={dateStr}
              id={`cal-day-${dayNum}`}
              className={[
                'calendar-cell',
                isToday    ? 'is-today'    : '',
                isSelected ? 'is-selected' : '',
                dayOfWeek === 0 ? 'sunday'   : '',
                dayOfWeek === 6 ? 'saturday' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
            >
              <span className="day-num">{dayNum}</span>
              {hasTx && (
                <div className="tx-dots">
                  {hasExpense && <span className="dot dot-expense" />}
                  {hasIncome  && <span className="dot dot-income"  />}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
