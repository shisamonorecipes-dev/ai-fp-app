// AnalyticsView.jsx
// 分析ダッシュボード（円グラフとカテゴリ別の集計リスト）
// props:
//   transactions  (array)  — 全収支データ
//   selectedMonth (string) — 表示中の月 "YYYY-MM"

import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

const formatMoney = (num) => new Intl.NumberFormat('ja-JP').format(num)

// 円グラフの各カテゴリに割り当てる色
const COLORS = {
  // 支出用
  '食費': '#05D58B',
  '日用品': '#4A90E2',
  '交通費': '#F5A623',
  '交際費': '#D0021B',
  '娯楽': '#9013FE',
  '医療・健康': '#F8E71C',
  '衣服・美容': '#FF4081',
  '住居': '#8B572A',
  '光熱費': '#50E3C2',
  'その他': '#9B9B9B',
  
  // 収入用
  '給与': '#05D58B',
  '副収入': '#4A90E2',
  'ボーナス': '#F5A623',
}

export default function AnalyticsView({ transactions, selectedMonth }) {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'income' | 'expense'

  // 当月のデータ抽出と集計
  const { expenseData, incomeData, totalExpense, totalIncome } = useMemo(() => {
    const monthlyTxs = transactions.filter(tx => tx.date.startsWith(selectedMonth))
    
    const expenses = {}
    const incomes = {}
    let tExpense = 0
    let tIncome = 0

    monthlyTxs.forEach(tx => {
      if (tx.type === 'expense') {
        expenses[tx.category] = (expenses[tx.category] || 0) + tx.amount
        tExpense += tx.amount
      } else {
        incomes[tx.category] = (incomes[tx.category] || 0) + tx.amount
        tIncome += tx.amount
      }
    })

    const eData = Object.entries(expenses).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    const iData = Object.entries(incomes).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

    return { expenseData: eData, incomeData: iData, totalExpense: tExpense, totalIncome: tIncome }
  }, [transactions, selectedMonth])

  // ツールチップ
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="analytics-tooltip">
          <p className="tooltip-label">{data.name}</p>
          <p className="tooltip-value">{formatMoney(data.value)} 円</p>
        </div>
      )
    }
    return null
  }

  // カテゴリ別リストの描画関数
  const renderRanking = (data, total) => (
    <div className="category-ranking">
      {data.map(item => {
        const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
        return (
          <div key={item.name} className="ranking-item">
            <div className="ranking-info">
              <span className="ranking-color-dot" style={{ backgroundColor: COLORS[item.name] || COLORS['その他'] }} />
              <span className="ranking-name">{item.name}</span>
              <span className="ranking-percentage">{percentage}%</span>
            </div>
            <span className="ranking-amount">{formatMoney(item.value)} 円</span>
          </div>
        )
      })}
    </div>
  )

  // 円グラフの描画関数
  const renderPieChart = (data, total, label) => (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            stroke="none"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS['その他']} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="chart-center-label">
        <span className="chart-center-title">{label}</span>
        <span className="chart-center-amount">¥{formatMoney(total)}</span>
      </div>
    </div>
  )

  const overviewData = [
    { name: '今月の収支', 収入: totalIncome, 支出: totalExpense }
  ]

  return (
    <div className="analytics-view">
      <h3 className="analytics-title">{selectedMonth.replace('-', '年')}月 分析</h3>

      {/* 内部タブ切り替え */}
      <div className="analytics-tabs">
        <button className={`analytics-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>全体</button>
        <button className={`analytics-tab ${activeTab === 'income' ? 'active' : ''}`} onClick={() => setActiveTab('income')}>収入</button>
        <button className={`analytics-tab ${activeTab === 'expense' ? 'active' : ''}`} onClick={() => setActiveTab('expense')}>支出</button>
      </div>

      <div className="analytics-content">
        {/* ================= 全体合算 ================= */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="overview-summary">
              <div className="summary-card income-card">
                <div className="summary-label">総収入</div>
                <div className="summary-amount">+{formatMoney(totalIncome)}</div>
              </div>
              <div className="summary-card expense-card">
                <div className="summary-label">総支出</div>
                <div className="summary-amount">-{formatMoney(totalExpense)}</div>
              </div>
            </div>
            
            <div className="bar-chart-container" style={{ marginTop: '24px' }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={overviewData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#888" width={0} hide />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1E232D', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="収入" fill="#05D58B" radius={[0, 4, 4, 0]} barSize={32} />
                  <Bar dataKey="支出" fill="#FF4081" radius={[0, 4, 4, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="net-income">
              <span className="net-label">今月の差引収支:</span>
              <span className={`net-amount ${totalIncome - totalExpense >= 0 ? 'positive' : 'negative'}`}>
                {totalIncome - totalExpense >= 0 ? '+' : ''}{formatMoney(totalIncome - totalExpense)} 円
              </span>
            </div>
          </div>
        )}

        {/* ================= 収入 ================= */}
        {activeTab === 'income' && (
          <div className="income-section">
            {totalIncome === 0 ? (
              <div className="analytics-empty">今月の収入はまだありません。</div>
            ) : (
              <>
                {renderPieChart(incomeData, totalIncome, '総収入')}
                {renderRanking(incomeData, totalIncome)}
              </>
            )}
          </div>
        )}

        {/* ================= 支出 ================= */}
        {activeTab === 'expense' && (
          <div className="expense-section">
            {totalExpense === 0 ? (
              <div className="analytics-empty">今月の支出はまだありません。</div>
            ) : (
              <>
                {renderPieChart(expenseData, totalExpense, '総支出')}
                {renderRanking(expenseData, totalExpense)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
