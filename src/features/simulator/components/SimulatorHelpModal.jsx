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
              額面年収（または売上・経費）、年齢、配偶者や扶養親族の有無を入力します。リアルタイムで手取り額や税金が再計算されます。
            </p>
          </div>

          <div className="help-section" style={{ marginBottom: '24px' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '8px' }}>3. 結果を確認する</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              1年間の手取り額と、月換算の目安が表示されます。円グラフで税金や社会保険料の割合を直感的に確認できます。より詳しい計算の前提条件は、結果の下にある「💡 計算の前提条件」から確認できます。
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
