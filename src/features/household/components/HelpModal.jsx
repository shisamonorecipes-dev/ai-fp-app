import React from 'react'

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="center-modal-overlay" onClick={onClose}>
      <div className="center-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-sticky-header">
          <div className="modal-header">
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>アプリの使い方</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>
        
        <div className="modal-body" style={{ padding: '20px' }}>
          <div className="help-section">
            <h4>1. 収支の記録</h4>
            <p>
              画面右下の「＋」ボタンから新しい記録を追加できます。金額入力時には内蔵の電卓機能（＋、−、×、÷）が利用可能です。
            </p>
          </div>
          
          <div className="help-section">
            <h4>2. カスタムカテゴリの作成</h4>
            <p>
              入力画面のカテゴリ一覧の最後にある「⚙️追加・管理」を選ぶと、自分だけのオリジナルカテゴリ（食費や趣味など）を作成できます。
            </p>
          </div>

          <div className="help-section">
            <h4>3. 月別のダッシュボード</h4>
            <p>
              アプリ上部の月切り替えボタン（＜ ＞）を使うと、その月の「収入・支出・収支」がパッと確認できます。下のリストも選択した月のデータに自動で絞り込まれます。
            </p>
          </div>

          <div className="help-section">
            <h4>4. 分析とカレンダー</h4>
            <p>
              「📊分析」タブでは、その月の支出と収入の割合を円グラフで確認できます。「📅カレンダー」タブでは、記録がある日が一目で分かります。
            </p>
          </div>

          <div className="help-section">
            <h4>💡データ保存について</h4>
            <p>
              現在入力したデータはすべて、お使いの端末（ブラウザ）内にのみ安全に保存されています。他の端末には引き継がれませんのでご注意ください。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
