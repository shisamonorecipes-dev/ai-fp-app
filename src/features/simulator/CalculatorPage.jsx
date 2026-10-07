import { useState, useMemo } from 'react'
import { calculateEmployee, calculateFreelance } from './utils/taxCalculator'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import SimulatorHelpModal from './components/SimulatorHelpModal'
import './simulator.css'

const formatMoney = (num) => new Intl.NumberFormat('ja-JP').format(num)

export default function CalculatorPage() {
  const [mode, setMode] = useState('employee') // 'employee' or 'freelance'
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  
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

  // オプション（控除・詳細設定）
  const [options, setOptions] = useState({
    furusatoNozei: '',
    ideco: '',
    lifeInsurance: '',
    medical: '',
    housingLoan: '',
    otherDeductions: false,
    healthInsRate: '',
    pensionRate: '',
    empInsRate: '',
    residentTaxRate: ''
  })

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  // 計算実行
  const result = useMemo(() => {
    if (mode === 'employee') {
      const salary = parseInt(salaryStr, 10) || 0
      return calculateEmployee(salary, ageOver40, hasSpouse, parseInt(dependents, 10) || 0, options)
    } else {
      const rev = parseInt(revenueStr, 10) || 0
      const exp = parseInt(expensesStr, 10) || 0
      return calculateFreelance(rev, exp, blueReturn, ageOver40, hasSpouse, parseInt(dependents, 10) || 0, options)
    }
  }, [mode, salaryStr, revenueStr, expensesStr, blueReturn, ageOver40, hasSpouse, dependents, options])

  // 円グラフ用データ
  const chartData = [
    { name: '手取り', value: Math.max(0, result.takeHome), color: '#05D58B' },
    { name: '税金', value: result.totalTax, color: '#FF4081' },
    { name: '社会保険料', value: result.totalSocialIns, color: '#4A90E2' },
  ]

  return (
    <div className="simulator-page">
      <div className="simulator-header">
        <div className="simulator-help-link" onClick={() => setIsHelpOpen(true)}>
          ※このシミュレーターの使い方※
        </div>
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
              <div className="input-with-slider">
                <div className="input-with-unit">
                  <input type="number" value={salaryStr} onChange={e => setSalaryStr(e.target.value)} />
                  <span>円</span>
                </div>
                <input 
                  type="range" 
                  min="1000000" max="20000000" step="100000"
                  value={salaryStr} 
                  onChange={e => setSalaryStr(e.target.value)}
                  className="custom-range"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>事業収入（売上）</label>
                <div className="input-with-slider">
                  <div className="input-with-unit">
                    <input type="number" value={revenueStr} onChange={e => setRevenueStr(e.target.value)} />
                    <span>円</span>
                  </div>
                  <input 
                    type="range" 
                    min="1000000" max="30000000" step="100000"
                    value={revenueStr} 
                    onChange={e => setRevenueStr(e.target.value)}
                    className="custom-range"
                  />
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

          {/* その他の控除（任意） */}
          <details className="assumptions-accordion optional-settings">
            <summary>➕ その他の控除を入力（任意）</summary>
            <div className="assumptions-content">
              <div className="form-group">
                <label>ふるさと納税（寄附済の金額）</label>
                <div className="input-with-unit">
                  <input type="number" placeholder="例: 50000" value={options.furusatoNozei} onChange={e => handleOptionChange('furusatoNozei', e.target.value)} />
                  <span>円</span>
                </div>
                <p className="help-text">既に自治体へ寄附した金額を入力してください。</p>
              </div>
              <div className="form-group">
                <label>iDeCo・小規模企業共済（年間掛金）</label>
                <div className="input-with-unit">
                  <input type="number" placeholder="例: 276000" value={options.ideco} onChange={e => handleOptionChange('ideco', e.target.value)} />
                  <span>円</span>
                </div>
                <p className="help-text">全額が所得控除となるため節税効果が大きいです。年間の合計掛金を入力してください。</p>
              </div>
              <div className="form-group">
                <label>生命保険料・地震保険料（控除額）</label>
                <div className="input-with-unit">
                  <input type="number" placeholder="例: 120000" value={options.lifeInsurance} onChange={e => handleOptionChange('lifeInsurance', e.target.value)} />
                  <span>円</span>
                </div>
                <p className="help-text">所得税で最大12万円、住民税で最大7万円まで控除されます（※実際の支払額ではなく控除額を入力）。なお、火災保険料は対象外です。</p>
              </div>
              <div className="form-group">
                <label>医療費控除（対象額）</label>
                <div className="input-with-unit">
                  <input type="number" placeholder="例: 50000" value={options.medical} onChange={e => handleOptionChange('medical', e.target.value)} />
                  <span>円</span>
                </div>
                <p className="help-text">年間10万円（または総所得の5%）を超えた分の医療費を入力してください。</p>
              </div>
              <div className="form-group">
                <label>住宅ローン控除（税額控除額）</label>
                <div className="input-with-unit">
                  <input type="number" placeholder="例: 200000" value={options.housingLoan} onChange={e => handleOptionChange('housingLoan', e.target.value)} />
                  <span>円</span>
                </div>
                <p className="help-text">年末残高に応じて税金から直接差し引かれる金額を入力してください。</p>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" checked={options.otherDeductions} onChange={e => handleOptionChange('otherDeductions', e.target.checked)} />
                  ひとり親・寡婦・障害者控除などを受ける
                </label>
              </div>
            </div>
          </details>

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

          {/* 節税のヒント */}
          <div className="tax-tips-area">
            <h4>💡 節税のヒント</h4>
            <div className="furusato-tip">
              ふるさと納税の目安（上限）: <strong>約 {formatMoney(result.furusatoLimit)} 円</strong>
              {options.furusatoNozei ? (
                <div className="furusato-diff">
                  （入力済: {formatMoney(options.furusatoNozei)}円 / 
                  あと約 <strong>{formatMoney(Math.max(0, result.furusatoLimit - parseInt(options.furusatoNozei)))}円</strong> 寄附可能です）
                </div>
              ) : null}
            </div>
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
          
          <details className="assumptions-accordion">
            <summary>💡 計算の前提条件・ロジックを見る</summary>
            <div className="assumptions-content">
              <ul>
                <li><strong>基礎控除・給与所得控除:</strong> 令和6年度の一般的な控除額を自動適用しています。配偶者・扶養控除以外の個人的な控除は、「その他の控除」の入力内容を反映します。</li>
                <li><strong>健康保険料率:</strong> デフォルトでは、会社員は協会けんぽ（東京都）、フリーランスは一般的な都市部（新宿区基準）の料率で概算しています。</li>
                <li><strong>住民税:</strong> 一律10%の標準税率＋均等割（約5,000円）で概算しています。</li>
                <li><strong>結果の正確性:</strong> この結果はあくまで目安です。お住まいの自治体や加入組合、実際の申告内容により数千円〜数万円の誤差が生じる場合があります。</li>
              </ul>
            </div>
          </details>

          {/* 詳細設定（料率のカスタマイズ） */}
          <details className="assumptions-accordion advanced-settings">
            <summary>⚙️ 詳細設定（料率のカスタマイズ）</summary>
            <div className="assumptions-content">
              <p style={{marginBottom: '16px', color: 'var(--primary-color)', fontSize: '0.85rem'}}>※自治体や加入組合の正確な料率を上書き適用できます。</p>
              
              <div className="form-group">
                <label>健康保険料率 (%)</label>
                <div className="input-with-unit">
                  <input type="number" step="0.01" placeholder={mode === 'employee' ? (ageOver40 ? "11.60" : "10.00") : "9.00"} value={options.healthInsRate} onChange={e => handleOptionChange('healthInsRate', e.target.value)} />
                  <span>%</span>
                </div>
                <p className="help-text">加入している組合や都道府県によって異なります。一般的な会社員（協会けんぽ）の方は<a href="https://www.kyoukaikenpo.or.jp/g7/cat330/sb3150/r06/r6ryougakuhyou3gatubun/" target="_blank" rel="noreferrer" style={{color: 'var(--primary-color)'}}>こちら</a>から都道府県別の料率を確認できます。（※労使折半前の全体%を入力してください）</p>
              </div>

              {mode === 'employee' && (
                <div className="form-group">
                  <label>厚生年金保険料率 (%)</label>
                  <div className="input-with-unit">
                    <input type="number" step="0.01" placeholder="18.30" value={options.pensionRate} onChange={e => handleOptionChange('pensionRate', e.target.value)} />
                    <span>%</span>
                  </div>
                  <p className="help-text">全国一律で18.3%（本人負担9.15%）で完全に固定されているため、原則変更の必要はありません。（※労使折半前の全体%を入力してください）</p>
                </div>
              )}

              {mode === 'employee' && (
                <div className="form-group">
                  <label>雇用保険料率 (%)</label>
                  <div className="input-with-unit">
                    <input type="number" step="0.01" placeholder="0.60" value={options.empInsRate} onChange={e => handleOptionChange('empInsRate', e.target.value)} />
                    <span>%</span>
                  </div>
                  <p className="help-text">一般の事業は0.6%（労働者負担分）です。農林水産業や建設業の場合は0.7%となります。</p>
                </div>
              )}

              <div className="form-group">
                <label>住民税率 (%)</label>
                <div className="input-with-unit">
                  <input type="number" step="0.1" placeholder="10.0" value={options.residentTaxRate} onChange={e => handleOptionChange('residentTaxRate', e.target.value)} />
                  <span>%</span>
                </div>
                <p className="help-text">全国ほぼ一律で10%です（ごく一部の自治体のみ異なります）。</p>
              </div>

            </div>
          </details>

        </div>
      </div>
      
      <SimulatorHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  )
}
