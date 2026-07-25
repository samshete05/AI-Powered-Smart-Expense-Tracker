function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function computeFinancialHealth({ income = 0, expenses = 0, budgetUsage = 0, recurringLoadRatio = 0, savingsRatio = 0 }) {
  const spendingDiscipline = clamp(100 - Math.max(budgetUsage - 70, 0) * 1.4, 20, 100);
  const recurringCommitment = clamp(100 - recurringLoadRatio * 100, 20, 100);
  const savingsStrength = clamp(savingsRatio * 140, 10, 100);

  const score = Math.round(
    spendingDiscipline * 0.35 +
    savingsStrength * 0.35 +
    clamp(100 - (expenses > income && income > 0 ? ((expenses - income) / income) * 140 : 0), 15, 100) * 0.2 +
    recurringCommitment * 0.1
  );

  const label =
    score >= 85 ? "Excellent"
    : score >= 70 ? "Good"
    : score >= 55 ? "Fair"
    : "Needs attention";

  return {
    score,
    label,
    drivers: {
      spendingDiscipline: Math.round(spendingDiscipline),
      savingsStrength: Math.round(savingsStrength),
      recurringCommitment: Math.round(recurringCommitment)
    }
  };
}
