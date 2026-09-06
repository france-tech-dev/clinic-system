export type CashflowSummary = {
  income: number;
  expense: number;
  balance: number;
  /** Soma dos lançamentos FORECAST de entrada. */
  forecastIncome: number;
  /** Soma dos lançamentos FORECAST de saída. */
  forecastExpense: number;
  /** (income + forecastIncome) − (expense + forecastExpense). */
  projectedBalance: number;
};
