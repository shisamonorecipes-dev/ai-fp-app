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

// 所得税の計算（速算表）- 控除額と税率を返す
const getIncomeTaxRateAndDeduction = (taxableIncome) => {
  if (taxableIncome <= 0) return { rate: 0.05, deduction: 0 }
  if (taxableIncome <= 1950000) return { rate: 0.05, deduction: 0 }
  if (taxableIncome <= 3300000) return { rate: 0.10, deduction: 97500 }
  if (taxableIncome <= 6950000) return { rate: 0.20, deduction: 427500 }
  if (taxableIncome <= 9000000) return { rate: 0.23, deduction: 636000 }
  if (taxableIncome <= 18000000) return { rate: 0.33, deduction: 1536000 }
  if (taxableIncome <= 40000000) return { rate: 0.40, deduction: 2796000 }
  return { rate: 0.45, deduction: 4796000 }
}

const getIncomeTax = (taxableIncome) => {
  const { rate, deduction } = getIncomeTaxRateAndDeduction(taxableIncome)
  return Math.max(0, taxableIncome * rate - deduction)
}

// 所得税の復興特別所得税 (2.1%)
const getTotalIncomeTax = (incomeTax) => {
  return Math.floor(incomeTax * 1.021)
}

// ふるさと納税の上限額目安（非常に簡略化した安全な目安）
// 住民税所得割額 × 20% / (100% - 住民税率(10%) - (所得税率 × 1.021)) + 2000
const calculateFurusatoLimit = (taxableIncomeRes, taxableIncomeIncomeTax) => {
  if (taxableIncomeRes <= 0) return 0
  const residentTaxIncomeBased = taxableIncomeRes * 0.10
  const { rate: incomeTaxRate } = getIncomeTaxRateAndDeduction(taxableIncomeIncomeTax)
  // 正確な計算式: 住民税所得割額 * 0.2 / (1 - 0.1 - (所得税率 * 1.021)) + 2000
  // ただし余裕を持たせて少し少なめに見積もる
  const limit = (residentTaxIncomeBased * 0.2) / (1 - 0.1 - (incomeTaxRate * 1.021)) + 2000
  return Math.floor(limit)
}

const parseOptions = (options) => {
  return {
    furusatoNozei: parseInt(options.furusatoNozei) || 0,
    ideco: parseInt(options.ideco) || 0,
    lifeInsurance: parseInt(options.lifeInsurance) || 0,
    medical: parseInt(options.medical) || 0,
    housingLoan: parseInt(options.housingLoan) || 0,
    otherDeductions: options.otherDeductions ? 270000 : 0, // ひとり親など簡易的に27万とする
    healthInsRate: options.healthInsRate !== undefined && options.healthInsRate !== '' ? parseFloat(options.healthInsRate) / 100 : null,
    pensionRate: options.pensionRate !== undefined && options.pensionRate !== '' ? parseFloat(options.pensionRate) / 100 : null,
    empInsRate: options.empInsRate !== undefined && options.empInsRate !== '' ? parseFloat(options.empInsRate) / 100 : null,
    residentTaxRate: options.residentTaxRate !== undefined && options.residentTaxRate !== '' ? parseFloat(options.residentTaxRate) / 100 : null,
  }
}

export const calculateEmployee = (salary, ageOver40, hasSpouse, dependents, rawOptions = {}) => {
  const opts = parseOptions(rawOptions)
  
  // 1. 社会保険料
  const healthInsRate = opts.healthInsRate !== null ? opts.healthInsRate : (ageOver40 ? 0.058 : 0.050)
  const pensionRate = opts.pensionRate !== null ? opts.pensionRate : 0.0915
  const empInsRate = opts.empInsRate !== null ? opts.empInsRate : 0.006

  const healthIns = Math.floor(salary * healthInsRate)
  const pension = Math.floor(salary * pensionRate)
  const empIns = Math.floor(salary * empInsRate)
  const totalSocialIns = healthIns + pension + empIns

  // 2. 控除
  const empDeduction = getEmploymentIncomeDeduction(salary)
  const basicDeduction = 480000
  const basicDeductionResident = 430000
  const spouseDeduction = hasSpouse ? 380000 : 0
  const depDeduction = dependents * 380000
  
  // 任意の所得控除
  const furusatoDeductionIncome = Math.max(0, opts.furusatoNozei - 2000)
  const medicalDeduction = opts.medical
  const lifeInsDeductionIncome = Math.min(120000, opts.lifeInsurance)
  const lifeInsDeductionRes = Math.min(70000, opts.lifeInsurance)
  
  const additionalDeductionsIncome = opts.ideco + medicalDeduction + lifeInsDeductionIncome + opts.otherDeductions + furusatoDeductionIncome
  const additionalDeductionsRes = opts.ideco + medicalDeduction + lifeInsDeductionRes + opts.otherDeductions

  const totalDeductions = empDeduction + totalSocialIns + basicDeduction + spouseDeduction + depDeduction + additionalDeductionsIncome
  const totalDeductionsRes = empDeduction + totalSocialIns + basicDeductionResident + spouseDeduction + depDeduction + additionalDeductionsRes

  // 3. 課税所得
  const taxableIncome = Math.max(0, salary - totalDeductions)
  const taxableIncomeRes = Math.max(0, salary - totalDeductionsRes)

  // ふるさと納税上限目安計算 (寄附前を想定)
  const furusatoLimit = calculateFurusatoLimit(taxableIncomeRes + furusatoDeductionIncome, taxableIncome + furusatoDeductionIncome)

  // 4. 税金（税額控除前）
  let incomeTaxBase = getTotalIncomeTax(getIncomeTax(taxableIncome))
  
  const resTaxRate = opts.residentTaxRate !== null ? opts.residentTaxRate : 0.10
  let residentTaxBase = Math.floor(taxableIncomeRes * resTaxRate) + 5000 // 均等割含む

  // 寄附金控除（住民税分: 特例分など）- 簡易計算
  if (opts.furusatoNozei > 2000) {
    const { rate: incRate } = getIncomeTaxRateAndDeduction(taxableIncome)
    const resSpecialDeduction = Math.min(
      Math.floor(residentTaxBase * 0.2), // 所得割の2割上限
      Math.floor((opts.furusatoNozei - 2000) * (1 - 0.10 - incRate * 1.021))
    )
    const resBasicDeduction = Math.floor((opts.furusatoNozei - 2000) * 0.10)
    residentTaxBase = Math.max(5000, residentTaxBase - resSpecialDeduction - resBasicDeduction)
  }

  // 住宅ローン控除（税額控除）
  let housingLoanLeft = opts.housingLoan
  if (housingLoanLeft > 0) {
    // まず所得税から引く
    if (incomeTaxBase >= housingLoanLeft) {
      incomeTaxBase -= housingLoanLeft
      housingLoanLeft = 0
    } else {
      housingLoanLeft -= incomeTaxBase
      incomeTaxBase = 0
    }
    // 引ききれない分は住民税から引く（上限あり。ここでは簡易的に最大9.75万円とする）
    if (housingLoanLeft > 0) {
      const resHousingDeduct = Math.min(housingLoanLeft, 97500)
      residentTaxBase = Math.max(5000, residentTaxBase - resHousingDeduct)
    }
  }

  const incomeTax = incomeTaxBase
  const residentTax = residentTaxBase

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
    takeHome,
    furusatoLimit
  }
}

// ------------------------------------
// フリーランス版
// ------------------------------------
export const calculateFreelance = (revenue, expenses, blueReturn, ageOver40, hasSpouse, dependents, rawOptions = {}) => {
  const opts = parseOptions(rawOptions)
  const businessIncome = Math.max(0, revenue - expenses - blueReturn)
  
  // 1. 国民健康保険料（カスタム料率があればそれを使う。なければ新宿区概算）
  let kokuho = 0
  const kokuhoBase = Math.max(0, revenue - expenses - 430000)
  if (opts.healthInsRate !== null) {
    kokuho = Math.floor(kokuhoBase * opts.healthInsRate)
  } else {
    if (kokuhoBase > 0) {
      kokuho += kokuhoBase * 0.09 + 40000
      if (ageOver40) {
        kokuho += kokuhoBase * 0.02 + 20000
      }
    }
  }
  kokuho = Math.min(Math.floor(kokuho), 1040000)

  // 2. 国民年金
  const nationalPensionRate = opts.pensionRate !== null ? opts.pensionRate : null
  const nationalPension = nationalPensionRate !== null ? Math.floor((revenue - expenses) * nationalPensionRate) : 16980 * 12

  const totalSocialIns = kokuho + nationalPension

  // 3. 個人事業税
  const businessTaxBase = Math.max(0, revenue - expenses - 2900000)
  const businessTax = Math.floor(businessTaxBase * 0.05)

  // 4. 控除
  const basicDeduction = 480000
  const basicDeductionResident = 430000
  const spouseDeduction = hasSpouse ? 380000 : 0
  const depDeduction = dependents * 380000

  const furusatoDeductionIncome = Math.max(0, opts.furusatoNozei - 2000)
  const medicalDeduction = opts.medical
  const lifeInsDeductionIncome = Math.min(120000, opts.lifeInsurance)
  const lifeInsDeductionRes = Math.min(70000, opts.lifeInsurance)
  
  const additionalDeductionsIncome = opts.ideco + medicalDeduction + lifeInsDeductionIncome + opts.otherDeductions + furusatoDeductionIncome
  const additionalDeductionsRes = opts.ideco + medicalDeduction + lifeInsDeductionRes + opts.otherDeductions

  const totalDeductions = totalSocialIns + basicDeduction + spouseDeduction + depDeduction + additionalDeductionsIncome
  const totalDeductionsRes = totalSocialIns + basicDeductionResident + spouseDeduction + depDeduction + additionalDeductionsRes

  // 5. 課税所得
  const taxableIncome = Math.max(0, businessIncome - totalDeductions)
  const taxableIncomeRes = Math.max(0, businessIncome - totalDeductionsRes)

  const furusatoLimit = calculateFurusatoLimit(taxableIncomeRes + furusatoDeductionIncome, taxableIncome + furusatoDeductionIncome)

  // 6. 税金
  let incomeTaxBase = getTotalIncomeTax(getIncomeTax(taxableIncome))
  const resTaxRate = opts.residentTaxRate !== null ? opts.residentTaxRate : 0.10
  let residentTaxBase = Math.floor(taxableIncomeRes * resTaxRate) + 5000 

  // 寄附金控除（住民税分）
  if (opts.furusatoNozei > 2000) {
    const { rate: incRate } = getIncomeTaxRateAndDeduction(taxableIncome)
    const resSpecialDeduction = Math.min(
      Math.floor(residentTaxBase * 0.2),
      Math.floor((opts.furusatoNozei - 2000) * (1 - 0.10 - incRate * 1.021))
    )
    const resBasicDeduction = Math.floor((opts.furusatoNozei - 2000) * 0.10)
    residentTaxBase = Math.max(5000, residentTaxBase - resSpecialDeduction - resBasicDeduction)
  }

  // 住宅ローン控除
  let housingLoanLeft = opts.housingLoan
  if (housingLoanLeft > 0) {
    if (incomeTaxBase >= housingLoanLeft) {
      incomeTaxBase -= housingLoanLeft
      housingLoanLeft = 0
    } else {
      housingLoanLeft -= incomeTaxBase
      incomeTaxBase = 0
    }
    if (housingLoanLeft > 0) {
      const resHousingDeduct = Math.min(housingLoanLeft, 97500)
      residentTaxBase = Math.max(5000, residentTaxBase - resHousingDeduct)
    }
  }

  const incomeTax = incomeTaxBase
  const residentTax = residentTaxBase

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
    takeHome,
    furusatoLimit
  }
}
