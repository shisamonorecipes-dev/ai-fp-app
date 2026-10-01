// 収支入力モーダル — 新規入力・編集の両モード対応
// props:
//   isOpen   (bool)        — モーダルの開閉状態
//   onClose  (func)        — 閉じる処理
//   onSave      (func)        — 保存処理。引数: { date, type, category, amount, memo }
//   editData    (object|null) — 編集対象のトランザクション。nullなら新規入力モード
//   defaultDate (string)      — 新規入力時のデフォルト日付 "YYYY-MM-DD"

import { useState, useEffect } from 'react'
import { useCategories } from '../hooks/useCategories'

const KEYPAD = [
  'C', '⌫', '', '÷',
  '7', '8', '9', '×',
  '4', '5', '6', '-',
  '1', '2', '3', '+',
  '00', '0', '.', '='
]

const evaluateMath = (expr) => {
  try {
    const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/')
    if (!/^[0-9+\-*/. ]+$/.test(sanitized)) return expr
    const result = new Function('return ' + sanitized)()
    return Number.isFinite(result) ? String(Math.floor(result)) : expr
  } catch {
    return expr
  }
}

export default function InputModal({ isOpen, onClose, onSave, onCategoryChange, editData, defaultDate }) {
  const isEditMode = !!editData

  const { categories, customCategories, addCategory, editCategory, deleteCategory } = useCategories()

  const [type,      setType]      = useState('expense')
  const [category,  setCategory]  = useState('食費')
  const [amountStr, setAmountStr] = useState('')
  const [date,      setDate]      = useState(defaultDate || new Date().toISOString().split('T')[0])
  const [memo,      setMemo]      = useState('')

  // 管理モード用のステート
  const [isManageMode, setIsManageMode] = useState(false)
  const [newEmoji, setNewEmoji] = useState('✨')
  const [newLabel, setNewLabel] = useState('')
  const [editingTarget, setEditingTarget] = useState(null) // { oldLabel }

  // モーダルが開くたびに、editDataの内容でフォームを初期化する
  useEffect(() => {
    if (isOpen) {
      setIsManageMode(false)
      setEditingTarget(null)
      setNewLabel('')
      
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
    setCategory(categories[newType][0].label)
    setEditingTarget(null)
    setNewLabel('')
  }

  // --- キーパッド入力 ---
  const handleKey = (key) => {
    if (!key) return
    if (key === 'C') {
      setAmountStr('')
      return
    }
    if (key === '⌫') {
      setAmountStr(prev => prev.slice(0, -1))
      return
    }
    if (key === '=') {
      setAmountStr(prev => evaluateMath(prev))
      return
    }
    // 先頭の0処理などを考慮しつつ、単純に文字列連結する
    if (amountStr === '0' && key !== '00' && key !== '.' && !['+','-','×','÷'].includes(key)) {
      setAmountStr(key)
      return
    }
    // 長すぎないように制限
    if (amountStr.length >= 20) return
    setAmountStr(prev => prev + key)
  }

  // 表示用：計算結果が分かるようにする
  // 例: "500+200" → 数式そのまま表示。ただしフォーマットは難しいので生の文字列を出すか、計算可能なら結果を横に出すなど。
  // 今回は電卓入力中はそのまま文字列表示する。
  const displayAmount = amountStr || '0'

  const handleSave = () => {
    const finalAmountStr = evaluateMath(amountStr)
    const amount = parseInt(finalAmountStr, 10)
    if (!amount || amount <= 0 || isNaN(amount)) return
    
    onSave({ date, type, category, amount, memo })
    if (!isEditMode) {
      setAmountStr('')
      setMemo('')
      setDate(defaultDate || new Date().toISOString().split('T')[0])
    }
  }

  // --- 管理モード用ハンドラ ---
  const handleSaveCategory = () => {
    if (!newLabel.trim() || !newEmoji.trim()) return

    if (editingTarget) {
      const newName = newLabel.trim();
      editCategory(type, editingTarget.oldLabel, newName, newEmoji.trim())
      if (onCategoryChange) {
        onCategoryChange(type, editingTarget.oldLabel, newName)
      }
      if (category === editingTarget.oldLabel) setCategory(newName)
    } else {
      addCategory(type, newLabel.trim(), newEmoji.trim())
    }
    setNewLabel('')
    setNewEmoji('✨')
    setEditingTarget(null)
  }

  const handleEditClick = (c) => {
    setEditingTarget({ oldLabel: c.label })
    setNewLabel(c.label)
    setNewEmoji(c.emoji)
  }

  const handleDeleteClick = (label) => {
    if (confirm(`「${label}」を削除してもよろしいですか？\n※このカテゴリを使用していた過去の記録は「その他」に変更されます。`)) {
      deleteCategory(type, label)
      if (onCategoryChange) {
        onCategoryChange(type, label, 'その他')
      }
      if (category === label) setCategory(categories[type][0].label)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>

        {/* ── 固定ヘッダー ── */}
        <div className="modal-sticky-header">
          {isEditMode && !isManageMode && (
            <div className="modal-edit-label">記録を編集</div>
          )}
          {isManageMode && (
             <div className="modal-edit-label">カスタムカテゴリ管理</div>
          )}
          <div className="modal-header">
            <div className="type-toggle">
              <button
                className={`type-btn ${type === 'expense' ? 'active-expense' : ''}`}
                onClick={() => handleTypeChange('expense')}
              >
                支出
              </button>
              <button
                className={`type-btn ${type === 'income' ? 'active-income' : ''}`}
                onClick={() => handleTypeChange('income')}
              >
                収入
              </button>
            </div>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        {/* ── スクロール可能エリア ── */}
        <div className="modal-body">
          
          {isManageMode ? (
            /* ===== カテゴリ管理モード ===== */
            <div className="category-manage-mode">
              <button className="back-btn" onClick={() => setIsManageMode(false)}>← 戻る</button>
              
              <div className="manage-form">
                <h4>{editingTarget ? 'カテゴリを編集' : '新しいカテゴリを追加'}</h4>
                <div className="manage-inputs">
                  <input 
                    type="text" 
                    className="emoji-input" 
                    value={newEmoji} 
                    onChange={e => setNewEmoji(e.target.value)} 
                    maxLength={2} 
                    placeholder="絵文字"
                  />
                  <input 
                    type="text" 
                    className="name-input" 
                    value={newLabel} 
                    onChange={e => setNewLabel(e.target.value)} 
                    placeholder="カテゴリ名"
                  />
                  <button className="add-category-btn" onClick={handleSaveCategory}>
                    {editingTarget ? '更新' : '追加'}
                  </button>
                  {editingTarget && (
                    <button className="cancel-edit-btn" onClick={() => { setEditingTarget(null); setNewLabel(''); }}>キャンセル</button>
                  )}
                </div>
              </div>

              <div className="manage-list">
                <h4>作成済みのカスタムカテゴリ（{type === 'expense' ? '支出' : '収入'}）</h4>
                {customCategories[type].length === 0 ? (
                  <p className="empty-text">まだ追加されていません。</p>
                ) : (
                  <ul>
                    {customCategories[type].map(c => (
                      <li key={c.label}>
                        <span className="manage-list-label">{c.emoji} {c.label}</span>
                        <div className="manage-list-actions">
                          <button onClick={() => handleEditClick(c)}>✏️</button>
                          <button onClick={() => handleDeleteClick(c.label)}>🗑️</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            /* ===== 通常の入力モード ===== */
            <>
              <div className="input-group">
                <label>日付</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div className={`amount-display ${type === 'expense' ? 'amount-expense' : 'amount-income'}`}>
                <span className="amount-currency">¥</span>
                <span className="amount-value">{displayAmount}</span>
              </div>

              <div className="keypad">
                {KEYPAD.map((key, i) => (
                  <button
                    key={`${key}-${i}`}
                    className={`key-btn ${['÷','×','-','+','='].includes(key) ? 'key-operator' : ''} ${['C','⌫'].includes(key) ? 'key-action' : ''} ${!key ? 'key-empty' : ''}`}
                    onClick={() => handleKey(key)}
                    disabled={!key}
                  >
                    {key}
                  </button>
                ))}
              </div>

              <div className="category-grid">
                {categories[type].map(({ label, emoji }) => (
                  <button
                    key={label}
                    className={`category-item ${category === label ? 'category-active' : ''}`}
                    onClick={() => setCategory(label)}
                  >
                    <span className="category-emoji">{emoji}</span>
                    <span className="category-label">{label}</span>
                  </button>
                ))}
                {/* 管理モード切り替えボタン */}
                <button className="category-item category-manage-btn" onClick={() => setIsManageMode(true)}>
                  <span className="category-emoji">⚙️</span>
                  <span className="category-label">追加・管理</span>
                </button>
              </div>

              <div className="input-group">
                <label>メモ（任意）</label>
                <input
                  type="text"
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  placeholder="例：ランチ、スーパー..."
                />
              </div>

              <button
                className={`save-btn ${(!amountStr || amountStr === '0') ? 'save-btn-disabled' : ''}`}
                onClick={handleSave}
                disabled={!amountStr || amountStr === '0'}
              >
                {isEditMode ? '更新する' : '記録する'}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
