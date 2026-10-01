// 家計簿機能のメインページ
// データの状態管理は useTransactions フックに委譲し、
// このコンポーネントはUIの組み立てに専念する。

import { useState, useMemo } from 'react'
import './household.css'
import { useTransactions } from './hooks/useTransactions'
import BalanceCard from './components/BalanceCard'
import AIMessage from './components/AIMessage'
import TransactionList from './components/TransactionList'
import CalendarView from './components/CalendarView'
import AnalyticsView from './components/AnalyticsView'
import InputModal from './components/InputModal'
import DisclaimerModal from './components/DisclaimerModal'
import HelpModal from './components/HelpModal'
import { generateAIFeedback } from './utils/aiFeedback'

// 今日の年月を "YYYY-MM" 形式で取得
const getTodayMonth = () => new Date().toISOString().slice(0, 7)

export default function HouseholdPage() {
  const { transactions, addTransaction, deleteTransaction, updateTransaction, updateCategoryForTransactions } = useTransactions()

  // モーダルの開閉と編集対象の管理
  const [isModalOpen,     setIsModalOpen]     = useState(false)
  const [editingTx,       setEditingTx]       = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  
  // 法務免責事項およびヘルプモーダルの状態
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  // タブ（リスト / カレンダー）
  const [viewMode, setViewMode] = useState('list')  // 'list' | 'calendar'

  // カレンダー用の状態
  const [selectedMonth, setSelectedMonth] = useState(getTodayMonth)  // "YYYY-MM"
  const [selectedDate,  setSelectedDate]  = useState(null)           // "YYYY-MM-DD" | null

  // --- 月切り替え ---
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const prev = new Date(y, m - 2, 1)
    setSelectedMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`)
    setSelectedDate(null)
  }
  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const next = new Date(y, m, 1)
    setSelectedMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`)
    setSelectedDate(null)
  }

  // --- 月の情報を計算 ---
  const [year, month] = selectedMonth.split('-').map(Number)
  const monthlyTxs = useMemo(() => transactions.filter(tx => tx.date.startsWith(selectedMonth)), [transactions, selectedMonth])
  const monthlyIncome = useMemo(() => monthlyTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [monthlyTxs])
  const monthlyExpense = useMemo(() => monthlyTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [monthlyTxs])
  const formatMoney = (num) => new Intl.NumberFormat('ja-JP').format(num)

  // --- 表示するトランザクション ---
  // カレンダーで日付が選ばれている → その日のみ、選ばれていない / リストモード → 当月分全件
  const displayedTransactions = useMemo(() => {
    if (viewMode === 'calendar' && selectedDate) {
      return transactions.filter(tx => tx.date === selectedDate)
    }
    return monthlyTxs
  }, [transactions, viewMode, selectedDate, monthlyTxs])

  // --- 合計残高（全件）の計算 ---
  const balance = transactions.reduce((acc, tx) => {
    return tx.type === 'income' ? acc + tx.amount : acc - tx.amount
  }, 0)

  // --- 動的AIメッセージの生成 ---
  const dynamicAIMessage = useMemo(() => {
    return generateAIFeedback(transactions, selectedMonth)
  }, [transactions, selectedMonth])

  // --- モーダル操作 ---
  const handleOpenNew = () => {
    setEditingTx(null)
    setIsModalOpen(true)
  }
  const handleOpenEdit = (tx) => {
    setEditingTx(tx)
    setIsModalOpen(true)
  }
  const handleClose = () => {
    setIsModalOpen(false)
    setEditingTx(null)
  }
  const handleSave = (data) => {
    if (editingTx) {
      updateTransaction(editingTx.id, data)
    } else {
      addTransaction(data)
    }
    handleClose()
  }

  // --- 削除操作 ---
  const handleDeleteRequest = (id) => setConfirmDeleteId(id)
  const handleDeleteConfirm = (id) => {
    deleteTransaction(id)
    setConfirmDeleteId(null)
  }
  const handleDeleteCancel = () => setConfirmDeleteId(null)

  return (
    <div className="household-page">
      <main className="dashboard">
        <BalanceCard balance={balance} onHelpClick={() => setIsHelpOpen(true)} />

        {/* 月次切り替えヘッダー */}
        <div className="calendar-header">
          <button className="month-nav-btn" onClick={handlePrevMonth} id="prev-month-btn">‹</button>
          <span className="calendar-month-title">{year}年{month}月</span>
          <button className="month-nav-btn" onClick={handleNextMonth} id="next-month-btn">›</button>
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

        {/* タブ切り替え */}
        <div className="view-tabs">
          <button
            id="tab-list"
            className={`view-tab ${viewMode === 'list' ? 'view-tab-active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 リスト
          </button>
          <button
            id="tab-calendar"
            className={`view-tab ${viewMode === 'calendar' ? 'view-tab-active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            📅 カレンダー
          </button>
          <button
            id="tab-analytics"
            className={`view-tab ${viewMode === 'analytics' ? 'view-tab-active' : ''}`}
            onClick={() => setViewMode('analytics')}
          >
            📊 分析
          </button>
        </div>

        {/* カレンダービュー */}
        {viewMode === 'calendar' && (
          <CalendarView
            transactions={transactions}
            selectedMonth={selectedMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}

        {/* 分析ビュー */}
        {viewMode === 'analytics' && (
          <AnalyticsView
            transactions={transactions}
            selectedMonth={selectedMonth}
          />
        )}

        {/* AIアドバイス（リストモードのみ表示） */}
        {viewMode === 'list' && (
          <AIMessage message={dynamicAIMessage} />
        )}

        {/* カレンダーモード時の絞り込みラベル */}
        {viewMode === 'calendar' && (
          <div className="filter-label">
            <span>
              {selectedDate
                ? `📅 ${selectedDate} の記録`
                : `📋 ${selectedMonth.replace('-', '年')}月 の記録`
              }
            </span>
            {selectedDate && (
              <button className="add-this-day-btn" onClick={handleOpenNew}>
                ＋ この日に入力
              </button>
            )}
          </div>
        )}

        {/* 収支リスト (分析モード以外で表示) */}
        {viewMode !== 'analytics' && (
          <TransactionList
            transactions={displayedTransactions}
            onEdit={handleOpenEdit}
            onDeleteRequest={handleDeleteRequest}
            onDeleteConfirm={handleDeleteConfirm}
            onDeleteCancel={handleDeleteCancel}
            confirmDeleteId={confirmDeleteId}
          />
        )}
      </main>

      {/* フッター（免責事項へのリンク） */}
      <footer className="app-footer">
        <button className="footer-link" onClick={() => setIsDisclaimerOpen(true)}>
          免責事項とデータ保存について
        </button>
      </footer>

      {/* 新規入力用フローティングボタン */}
      <button className="fab" onClick={handleOpenNew}>＋</button>

      {/* 入力 / 編集モーダル */}
      <InputModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSave={handleSave}
        onCategoryChange={updateCategoryForTransactions}
        editData={editingTx}
        defaultDate={viewMode === 'calendar' ? selectedDate : null}
      />

      {/* 免責事項・データ保護モーダル */}
      <DisclaimerModal 
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />

      {/* 使い方ヘルプモーダル */}
      <HelpModal 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  )
}
