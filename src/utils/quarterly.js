// Helper function to aggregate accrued data by financial year
export function getAnnualAccruedData(monthlyData) {
  // Define financial years: FY25 = Apr 2024 - Mar 2025, Aug'25 = Apr 2025 - Aug 2025
  const years = [
    { label: "FY25", start: new Date("2024-04-01"), end: new Date("2025-03-31") },
    { label: "Aug'25", start: new Date("2025-04-01"), end: new Date("2025-08-31") }
  ];
  return years.map(y => {
    const filtered = monthlyData.filter(row => {
      const d = new Date(row.date);
      return d >= y.start && d <= y.end;
    });
    const sumAccruedMrr = filtered.reduce((sum, r) => sum + (r.accrued_mrr || 0), 0);
    const validTargets = filtered.map(r => r.accrued_mrr_target).filter(v => v !== null && v !== undefined);
    const sumAccruedMrrTarget = validTargets.length > 0 ? validTargets.reduce((sum, v) => sum + v, 0) : null;
    return {
      label: y.label,
      accrued_mrr: sumAccruedMrr,
      accrued_mrr_target: sumAccruedMrrTarget
    };
  });
}
// Helper function to aggregate accrued data by quarter
export function getQuarterlyAccruedData(monthlyData) {
  const grouped = {};
  monthlyData.forEach(row => {
    const date = new Date(row.date);
    const year = date.getFullYear();
    const month = date.getMonth();
    let qIdx, qYear;
    let endMonth;
    if ([3,4,5].includes(month)) { qIdx = 1; qYear = year; endMonth = "Jun"; } // Q1: Apr-Jun
    else if ([6,7,8].includes(month)) { qIdx = 2; qYear = year; endMonth = "Sep"; } // Q2: Jul-Sep
    else if ([9,10,11].includes(month)) { qIdx = 3; qYear = year; endMonth = "Dec"; } // Q3: Oct-Dec
    else { qIdx = 4; qYear = month <= 2 ? year : year + 1; endMonth = "Mar"; } // Q4: Jan-Mar
    let label = `${endMonth}'${String(qYear).slice(-2)}`;
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(row);
  });
  return Object.entries(grouped)
    .filter(([label, arr]) => label !== "Sep'25") // Remove Sep'25 from quarterly view
    .map(([label, arr]) => {
    // Sum accrued_mrr and accrued_mrr_target for the quarter
    const sumAccruedMrr = arr.reduce((sum, r) => sum + (r.accrued_mrr || 0), 0);
    // Sum targets if at least one value is not null
    const validTargets = arr.map(r => r.accrued_mrr_target).filter(v => v !== null && v !== undefined);
    const sumAccruedMrrTarget = validTargets.length > 0 ? validTargets.reduce((sum, v) => sum + v, 0) : null;
    return {
      label,
      accrued_mrr: sumAccruedMrr,
      accrued_mrr_target: sumAccruedMrrTarget
    };
  });
}
