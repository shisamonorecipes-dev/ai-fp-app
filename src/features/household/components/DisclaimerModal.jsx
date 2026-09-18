import React from 'react'

export default function DisclaimerModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content disclaimer-modal" onClick={e => e.stopPropagation()}>
        
        <div className="modal-sticky-header">
          <div className="modal-header" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>免責事項とデータ保存について</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="modal-body" style={{ paddingTop: '20px' }}>
          <div className="disclaimer-section">
            <h4>🔒 データのローカル保存について</h4>
            <p>
              当アプリ（AI FP）に入力された家計簿データは、すべてお客様がお使いの端末（ブラウザのLocalStorage）内にのみ保存されます。<br />
              外部のサーバーへ送信されることや、運営者がお客様のデータを収集・閲覧することは一切ありませんので、安心してご利用ください。<br />
              <br />
              <small style={{ color: 'var(--danger-color)' }}>
                ※ブラウザのキャッシュを削除すると、入力データも消失しますのでご注意ください。
              </small>
            </p>
          </div>

          <div className="disclaimer-section">
            <h4>⚠️ 免責事項（金融・税務アドバイスについて）</h4>
            <p>
              本アプリによって提供される計算結果やAIのアドバイスは、一般的なロジックに基づく「目安」を提供するものであり、実際の税額、公的保険料、投資成果等を保証するものではありません。<br />
              また、本アプリの提供する情報は金融商品取引法に基づく「投資助言業」や、税理士法に基づく「税務相談」には該当しません。<br />
              最終的な金融上の意思決定については、お客様ご自身の責任において行われるようお願いいたします。
            </p>
          </div>
          
          <button className="save-btn" onClick={onClose} style={{ marginTop: '24px' }}>
            確認して閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
