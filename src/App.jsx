// App.jsx — アプリケーションのルートコンポーネント
// 将来的にはここでルーティング（react-router等）を管理し、
// 各機能（household / tax-simulation / life-plan 等）のページを切り替える。

import './index.css'
import Header from './components/Header'
import HouseholdPage from './features/household/HouseholdPage'

function App() {
  return (
    <>
      <Header />
      {/* 現在は家計簿機能のみ。今後ここにルーティングを追加する */}
      <HouseholdPage />
    </>
  )
}

export default App
