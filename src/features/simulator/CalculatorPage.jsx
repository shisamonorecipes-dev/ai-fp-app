import { useState, useMemo } from 'react'
import { calculateEmployee, calculateFreelance } from './utils/taxCalculator'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import './simulator.css'

const formatMoney = (num) => new Intl.NumberFormat('ja-JP').format(num)

export default function CalculatorPage() {
  const [mode, setMode] = useState('employee') // 'employee' or 'freelance'
  
  // 共通状態
  const [ageOver40, setAgeOver40] = useState(false)
  const [hasSpouse, setHasSpouse] = useState(false)
  const [dependents, setDependents] = useState(0)

  // 会社員用
  const [salaryStr, setSalaryStr] = useState('5000000')

  // 個人事業主用
  const [revenueStr, setRevenueStr] = useState('6000000')
  const [expensesStr, setExpensesStr] = useState('1000000')
  const [blueReturn, setBlueReturn] = useState(650000)

  // 計算実行
  const result = useMemo(() => {
    if (mode === 'employee') {
      const salary = parseInt(salaryStr, 10) || 0
      return calculateEmployee(salary, ageOver40, hasSpouse, parseInt(dependents, 10) || 0)
    } else {
      const rev = parseInt(revenueStr, 10) || 0
      const exp = parseInt(expensesStr, 10) || 0
      return calculateFreelance(rev, exp, blueReturn, ageOver40, hasSpouse, parseInt(dependents, 10) || 0)
    }
  }, [mode, salaryStr, revenueStr, expensesStr, blueReturn, ageOver40, hasSpouse, dependents])

  // 円グラフ用データ
  const chartData = [
    { name: '手取り', value: Math.max(0, result.takeHome), color: '#05D58B' },
    { name: '税金', value: result.totalTax, color: '#FF4081' },
    { name: '社会保険料', value: result.totalSocialIns, color: '#4A90E2' },
  ]

  return (
    <div className="simulator-page">
      <div className="simulator-header">
        <h2>手取りシミュレーター</h2>
        <p className="subtitle">税金や社会保険料を引いた「本当の収入」を計算します</p>
      </div>

      <div className="mode-toggle">
        <button 
          className={mode === 'employee' ? 'active' : ''} 
          onClick={() => setMode('employee')}
        >
          会社員・役員
        </button>
        <button 
          className={mode === 'freelance' ? 'active' : ''} 
          onClick={() => setMode('freelance')}
        >
          個人事業主
        </button>
      </div>

      <div className="simulator-content">
        {/* 入力フォーム */}
        <div className="input-card">
          <h3 className="card-title">条件を入力</h3>
          
          {mode === 'employee' ? (
            <div className="form-group">
              <label>額面年収（ボーナス含む）</label>
              <div className="input-with-unit">
                <input type="number" value={salaryStr} onChange={e => setSalaryStr(e.target.value)} />
                <span>円</span>
              </div>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>事業収入（売上）</label>
                <div className="input-with-unit">
                  <input type="number" value={revenueStr} onChange={e => setRevenueStr(e.target.value)} />
                  <span>円</span>
                </div>
              </div>
              <div className="form-group">
                <label>必要経費</label>
                <div className="input-with-unit">
                  <input type="number" value={expensesStr} onChange={e => setExpensesStr(e.target.value)} />
                  <span>円</span>
                </div>
              </div>
              <div className="form-group">
                <label>青色申告特別控除</label>
                <select value={blueReturn} onChange={e => setBlueReturn(Number(e.target.value))}>
                  <option value={650000}>65万円（電子申告等）</option>
                  <option value={550000}>55万円（紙申告等）</option>
                  <option value={100000}>10万円</option>
                  <option value={0}>なし（白色申告）</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>年齢 (介護保険料の有無)</label>
            <div className="radio-group">
              <label><input type="radio" checked={!ageOver40} onChange={() => setAgeOver40(false)} /> 40歳未満</label>
              <label><input type="radio" checked={ageOver40} onChange={() => setAgeOver40(true)} /> 40歳以上</label>
            </div>
          </div>

          <div className="form-group">
            <label>配偶者控除</label>
            <div className="radio-group">
              <label><input type="radio" checked={hasSpouse} onChange={() => setHasSpouse(true)} /> あり</label>
              <label><input type="radio" checked={!hasSpouse} onChange={() => setHasSpouse(false)} /> なし</label>
            </div>
          </div>

          <div className="form-group">
            <label>その他の扶養親族（16歳以上）</label>
            <div className="input-with-unit">
              <input type="number" min="0" max="10" value={dependents} onChange={e => setDependents(e.target.value)} style={{width: '60px'}} />
              <span>人</span>
            </div>
          </div>

          {mode === 'freelance' && (
            <p className="disclaimer-text">※国民健康保険料は自治体により異なります。本ツールでは一般的な都市部（東京都）の概算を用いています。</p>
          )}
        </div>

        {/* 結果表示 */}
        <div className="result-card">
          <h3 className="card-title">シミュレーション結果</h3>
          
          <div className="take-home-display">
            <div className="label">1年間の手取り額</div>
            <div className="amount">¥{formatMoney(Math.max(0, result.takeHome))}</div>
            <div className="monthly-amount">（月換算: 約 ¥{formatMoney(Math.max(0, Math.floor(result.takeHome / 12)))}）</div>
          </div>

          <div className="chart-container" style={{ height: '200px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80}
                  stroke="none"
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${formatMoney(value)}円`}
                  contentStyle={{ backgroundColor: '#1E232D', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="breakdown-list">
            <div className="breakdown-item gross">
              <span>{mode === 'employee' ? '額面収入' : '事業所得(売上-経費)'}</span>
              <span>{formatMoney(result.gross)} 円</span>
            </div>
            
            <div className="breakdown-category">社会保険料</div>
            {mode === 'employee' ? (
              <>
                <div className="breakdown-item"><span>健康保険料</span><span>-{formatMoney(result.healthIns)} 円</span></div>
                <div className="breakdown-item"><span>厚生年金</span><span>-{formatMoney(result.pension)} 円</span></div>
                <div className="breakdown-item"><span>雇用保険料</span><span>-{formatMoney(result.empIns)} 円</span></div>
              </>
            ) : (
              <>
                <div className="breakdown-item"><span>国民健康保険料</span><span>-{formatMoney(result.healthIns)} 円</span></div>
                <div className="breakdown-item"><span>国民年金</span><span>-{formatMoney(result.pension)} 円</span></div>
              </>
            )}
            
            <div className="breakdown-category">税金</div>
            <div className="breakdown-item"><span>所得税</span><span>-{formatMoney(result.incomeTax)} 円</span></div>
            <div className="breakdown-item"><span>住民税</span><span>-{formatMoney(result.residentTax)} 円</span></div>
            {mode === 'freelance' && result.businessTax > 0 && (
              <div className="breakdown-item"><span>個人事業税</span><span>-{formatMoney(result.businessTax)} 円</span></div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  )
}
