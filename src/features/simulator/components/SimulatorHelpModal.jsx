import React from 'react'

export default function SimulatorHelpModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="center-modal-overlay" onClick={onClose}>
      <div className="center-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-sticky-header">
          <div className="modal-header" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>シミュレーターの使い方</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="modal-body" style={{ paddingTop: '20px' }}>
          <div className="help-section" style={{ marginBottom: '24px' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '8px' }}>1. 働き方を選ぶ</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              「会社員・役員」か「個人事業主」のどちらかを選択してください。選んだ働き方によって、必要な入力項目や計算される保険料の種類（厚生年金か国民年金か等）が変わります。
            </p>
          </div>
          
          <div className="help-section" style={{ marginBottom: '24px' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '8px' }}>2. 収入と条件を入力する</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              額面年収や諸条件を入力します。収入の入力には<strong>直感的に動かせるスライダー</strong>をご利用いただけます（スライダーの上限を超える場合は、枠内に直接ご入力ください）。
            </p>
          </div>

          <div className="help-section" style={{ marginBottom: '24px' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '8px' }}>3. 複数のパターンを保存・比較する</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              結果画面の「⭐ この条件を保存して比較する」ボタンを押すと、現在の結果が画面下部にストックされます。条件を変えて複数ストックすると、自動的に<strong>比較用の棒グラフ</strong>が出現し、「転職」や「独立」といったシナリオごとの手取りの違いを一目で比べることができます。
            </p>
          </div>

          <div className="help-section" style={{ marginBottom: '24px' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '8px' }}>4. 便利な自動保存機能</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              シミュレーターに入力したすべての内容（比較用のストックデータ含む）は、<strong>自動的にブラウザに保存</strong>されます。別の機能タブに移動したり、ブラウザを一度閉じたりしても、次回開いた時にそのまま続きから再開できます。（※一番下のボタンからすべて初期化することも可能です）
            </p>
          </div>
          
          <button className="save-btn" onClick={onClose} style={{ marginTop: '16px' }}>
            確認して閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
