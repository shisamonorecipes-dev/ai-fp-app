// AI FPアドバイス表示コンポーネント
// 現時点はモックテキスト。Step6（AIフィードバックの動的化）で実データに差し替える。
// props:
//   message (string) — 表示するアドバイステキスト

export default function AIMessage({ message }) {
  return (
    <section className="ai-message">
      <div className="ai-icon">✨</div>
      <div className="ai-text">
        <strong>AI FPからのアドバイス</strong><br />
        {message}
      </div>
    </section>
  )
}
