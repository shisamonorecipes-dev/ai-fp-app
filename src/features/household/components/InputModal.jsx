// 収支入力モーダル — 新規入力・編集の両モード対応
// props:
//   isOpen   (bool)        — モーダルの開閉状態
//   onClose  (func)        — 閉じる処理
//   onSave      (func)        — 保存処理。引数: { date, type, category, amount, memo }
//   editData    (object|null) — 編集対象のトランザクション。nullなら新規入力モード
//   defaultDate (string)      — 新規入力時のデフォルト日付 "YYYY-MM-DD"

import { useState, useEffect } from 'react'

const CATEGORIES = {
  expense: [
    { label: '食費',       emoji: '🍴' },
    { label: '日用品',     emoji: '🛒' },
    { label: '交通費',     emoji: '🚃' },
    { label: '交際費',     emoji: '🍻' },
    { label: '娯楽',       emoji: '🎮' },
    { label: '医療・健康', emoji: '💊' },
    { label: '衣服・美容', emoji: '👗' },
    { label: '住居',       emoji: '🏠' },
    { label: '光熱費',     emoji: '💡' },
    { label: 'その他',     emoji: '📦' },
  ],
  income: [
    { label: '給与',     emoji: '💰' },
    { label: '副収入',   emoji: '💼' },
    { label: 'ボーナス', emoji: '🎁' },
    { label: 'その他',   emoji: '📦' },
  ],
}

const KEYPAD = [
  '7', '8', '9',
  '4', '5', '6',
  '1', '2', '3',
  '00','0', '⌫',
]

export default function InputModal({ isOpen, onClose, onSave, editData, defaultDate }) {
  const isEditMode = !!editData

  const [type,      setType]      = useState('expense')
  const [category,  setCategory]  = useState('食費')
  const [amountStr, setAmountStr] = useState('')
  const [date,      setDate]      = useState(defaultDate || new Date().toISOString().split('T')[0])
  const [memo,      setMemo]      = useState('')

  // モーダルが開くたびに、editDataの内容でフォームを初期化する
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setType(editData.type)
        setCategory(editData.category)
        setAmountStr(String(editData.amount))
        setDate(editData.date)
        setMemo(editData.memo ?? '')
      } else {
        setType('expense')
        setCategory('食費')
        setAmountStr('')
        setDate(defaultDate || new Date().toISOString().split('T')[0])
        setMemo('')
      }
    }
  }, [isOpen, editData, defaultDate])

  if (!isOpen) return null

  // --- 支出 / 収入 切り替え ---
  const handleTypeChange = (newType) => {
    setType(newType)
    setCategory(CATEGORIES[newType][0].label)
  }

  // --- キーパッド入力 ---
  const handleKey = (key) => {
    if (key === '⌫') {
      setAmountStr(prev => prev.slice(0, -1))
      return
    }
    if (amountStr === '0' && key !== '00') {
      setAmountStr(key)
      return
    }
    if (amountStr.length >= 10) return
    setAmountStr(prev => prev + key)
  }

  // --- 金額の表示フォーマット ---
  const displayAmount = amountStr
    ? Number(amountStr).toLocaleString('ja-JP')
    : '0'

  // --- 保存処理 ---
  const handleSave = () => {
    const amount = parseInt(amountStr, 10)
    if (!amount || amount <= 0) return
    onSave({ date, type, category, amount, memo })
    // 新規入力モードのみリセット（編集モードは onClose 側で閉じる）
    if (!isEditMode) {
      setAmountStr('')
      setMemo('')
      setDate(defaultDate || new Date().toISOString().split('T')[0])
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>

        {/* ── 固定ヘッダー ── */}
        <div className="modal-sticky-header">
          {isEditMode && (
            <div className="modal-edit-label">記録を編集</div>
          )}
          <div className="modal-header">
            <div className="type-toggle">
              <button
                id="toggle-expense"
                className={`type-btn ${type === 'expense' ? 'active-expense' : ''}`}
                onClick={() => handleTypeChange('expense')}
              >
                支出
              </button>
              <button
                id="toggle-income"
                className={`type-btn ${type === 'income' ? 'active-income' : ''}`}
                onClick={() => handleTypeChange('income')}
              >
                収入
              </button>
            </div>
            <button id="modal-close-btn" className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        {/* ── スクロール可能エリア ── */}
        <div className="modal-body">

          {/* 日付 */}
          <div className="input-group">
            <label htmlFor="input-date">日付</label>
            <input
              id="input-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {/* 金額ディスプレイ */}
          <div className={`amount-display ${type === 'expense' ? 'amount-expense' : 'amount-income'}`}>
            <span className="amount-currency">¥</span>
            <span className="amount-value">{displayAmount}</span>
          </div>

          {/* 電卓キーパッド */}
          <div className="keypad">
            {KEYPAD.map((key) => (
              <button
                key={key}
                id={`keypad-${key === '⌫' ? 'backspace' : key}`}
                className={`key-btn ${key === '⌫' ? 'key-backspace' : ''}`}
                onClick={() => handleKey(key)}
              >
                {key}
              </button>
            ))}
          </div>

          {/* カテゴリ選択グリッド */}
          <div className="category-grid">
            {CATEGORIES[type].map(({ label, emoji }) => (
              <button
                key={label}
                id={`category-${label}`}
                className={`category-item ${category === label ? 'category-active' : ''}`}
                onClick={() => setCategory(label)}
              >
                <span className="category-emoji">{emoji}</span>
                <span className="category-label">{label}</span>
              </button>
            ))}
          </div>

          {/* メモ */}
          <div className="input-group">
            <label htmlFor="input-memo">メモ（任意）</label>
            <input
              id="input-memo"
              type="text"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="例：ランチ、スーパー..."
            />
          </div>

          {/* 保存ボタン */}
          <button
            id="save-btn"
            className={`save-btn ${(!amountStr || amountStr === '0') ? 'save-btn-disabled' : ''}`}
            onClick={handleSave}
            disabled={!amountStr || amountStr === '0'}
          >
            {isEditMode ? '更新する' : '記録する'}
          </button>

        </div>{/* /modal-body */}
      </div>
    </div>
  )
}
