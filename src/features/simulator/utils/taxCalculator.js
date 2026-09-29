// 令和6年度（2024年）基準の簡易計算ロジック
// 限界まで正確に近づけますが、自治体や細かい条件により実際の税額とは多少異なります。

// 給与所得控除の計算
const getEmploymentIncomeDeduction = (salary) => {
  if (salary <= 1625000) return 550000
  if (salary <= 1800000) return salary * 0.4 - 100000
  if (salary <= 3600000) return salary * 0.3 + 80000
  if (salary <= 6600000) return salary * 0.2 + 440000
  if (salary <= 8500000) return salary * 0.1 + 1100000
  return 1950000
}

// 所得税の計算（速算表）
const getIncomeTax = (taxableIncome) => {
  if (taxableIncome <= 0) return 0
  if (taxableIncome <= 1950000) return taxableIncome * 0.05
  if (taxableIncome <= 3300000) return taxableIncome * 0.10 - 97500
  if (taxableIncome <= 6950000) return taxableIncome * 0.20 - 427500
  if (taxableIncome <= 9000000) return taxableIncome * 0.23 - 636000
  if (taxableIncome <= 18000000) return taxableIncome * 0.33 - 1536000
  if (taxableIncome <= 40000000) return taxableIncome * 0.40 - 2796000
  return taxableIncome * 0.45 - 4796000
}

// 所得税の復興特別所得税 (2.1%)
const getTotalIncomeTax = (incomeTax) => {
  return Math.floor(incomeTax * 1.021)
}

// 住民税の計算（均等割 + 所得割）
const getResidentTax = (taxableIncome) => {
  if (taxableIncome <= 0) return 5000 // 均等割のみ（非課税限度額は簡略化のため考慮せず）
  return Math.floor(taxableIncome * 0.10) + 5000
}

// 会社員・役員（給与所得者）の計算
export const calculateEmployee = (salary, ageOver40, hasSpouse, dependents) => {
  // 1. 社会保険料（概算: 報酬月額によらず年収に対する定率で近似）
  const healthInsRate = ageOver40 ? 0.058 : 0.050 // 介護保険分を加算
  const pensionRate = 0.0915
  const empInsRate = 0.006

  const healthIns = Math.floor(salary * healthInsRate)
  const pension = Math.floor(salary * pensionRate)
  const empIns = Math.floor(salary * empInsRate)
  const totalSocialIns = healthIns + pension + empIns

  // 2. 控除
  const empDeduction = getEmploymentIncomeDeduction(salary)
  const basicDeduction = 480000
  const basicDeductionResident = 430000
  const spouseDeduction = hasSpouse ? 380000 : 0
  const depDeduction = dependents * 380000 // 一般扶養親族

  const totalDeductions = empDeduction + totalSocialIns + basicDeduction + spouseDeduction + depDeduction
  const totalDeductionsRes = empDeduction + totalSocialIns + basicDeductionResident + spouseDeduction + depDeduction

  // 3. 課税所得
  const taxableIncome = Math.max(0, salary - totalDeductions)
  const taxableIncomeRes = Math.max(0, salary - totalDeductionsRes)

  // 4. 税金
  const incomeTax = getTotalIncomeTax(getIncomeTax(taxableIncome))
  const residentTax = getResidentTax(taxableIncomeRes)

  // 5. 手取り
  const takeHome = salary - (totalSocialIns + incomeTax + residentTax)

  return {
    gross: salary,
    healthIns,
    pension,
    empIns,
    totalSocialIns,
    incomeTax,
    residentTax,
    totalTax: incomeTax + residentTax,
    takeHome
  }
}

// 個人事業主・フリーランス（事業所得者）の計算
// ※国民健康保険は新宿区の令和6年度料率を参考に概算
export const calculateFreelance = (revenue, expenses, blueReturn, ageOver40, hasSpouse, dependents) => {
  const businessIncome = Math.max(0, revenue - expenses - blueReturn)
  
  // 1. 国民健康保険料（基礎控除43万を引いた金額にかける）
  const kokuhoBase = Math.max(0, revenue - expenses - 430000)
  let kokuho = 0
  if (kokuhoBase > 0) {
    // 医療分(約7%) + 支援金分(約2%) + 均等割(~4万)
    kokuho += kokuhoBase * 0.09 + 40000
    if (ageOver40) {
      // 介護分(約2%) + 均等割(~2万)
      kokuho += kokuhoBase * 0.02 + 20000
    }
  }
  // 上限額適用（約104万円）
  kokuho = Math.min(Math.floor(kokuho), 1040000)

  // 2. 国民年金（定額 約16,980円/月）
  const nationalPension = 16980 * 12

  const totalSocialIns = kokuho + nationalPension

  // 3. 個人事業税 (事業所得が290万を超える場合、5% ※業種によるが一般的に5%)
  const businessTaxBase = Math.max(0, revenue - expenses - 2900000)
  const businessTax = Math.floor(businessTaxBase * 0.05)

  // 4. 控除
  const basicDeduction = 480000
  const basicDeductionResident = 430000
  const spouseDeduction = hasSpouse ? 380000 : 0
  const depDeduction = dependents * 380000

  const totalDeductions = totalSocialIns + basicDeduction + spouseDeduction + depDeduction
  const totalDeductionsRes = totalSocialIns + basicDeductionResident + spouseDeduction + depDeduction

  // 5. 課税所得
  const taxableIncome = Math.max(0, businessIncome - totalDeductions)
  const taxableIncomeRes = Math.max(0, businessIncome - totalDeductionsRes)

  // 6. 税金
  const incomeTax = getTotalIncomeTax(getIncomeTax(taxableIncome))
  const residentTax = getResidentTax(taxableIncomeRes)

  const actualIncome = revenue - expenses
  const takeHome = actualIncome - (totalSocialIns + businessTax + incomeTax + residentTax)

  return {
    gross: actualIncome,
    healthIns: kokuho,
    pension: nationalPension,
    empIns: 0,
    businessTax,
    totalSocialIns,
    incomeTax,
    residentTax,
    totalTax: incomeTax + residentTax + businessTax,
    takeHome
  }
}
