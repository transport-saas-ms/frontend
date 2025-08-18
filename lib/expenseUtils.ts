import { Expense } from '@/lib/types/index';
import { safeNumber, formatCurrencyWithCode } from '@/lib/utils';

/**
 * Calcula el total de gastos para una moneda específica
 * @param expenses - Array de gastos
 * @param currency - Código de moneda (opcional, si no se especifica suma todas)
 * @returns Total calculado
 */
export const calculateExpensesTotal = (
  expenses: Expense[], 
  currency?: string
): number => {
  if (!expenses || expenses.length === 0) return 0;
  
  return expenses
    .filter(expense => !currency || expense.currency === currency)
    .reduce((sum, expense) => sum + safeNumber(expense.amount), 0);
};

/**
 * Agrupa gastos por moneda y calcula totales
 * @param expenses - Array de gastos
 * @returns Objeto con totales por moneda
 */
export const groupExpensesByCurrency = (expenses: Expense[]) => {
  if (!expenses || expenses.length === 0) return {};
  
  const grouped = expenses.reduce((acc, expense) => {
    const currency = expense.currency || 'USD'; // Default a USD si no hay moneda
    const amount = safeNumber(expense.amount);
    
    if (!acc[currency]) {
      acc[currency] = {
        total: 0,
        count: 0,
        expenses: []
      };
    }
    
    acc[currency].total += amount;
    acc[currency].count += 1;
    acc[currency].expenses.push(expense);
    
    return acc;
  }, {} as Record<string, { total: number; count: number; expenses: Expense[] }>);
  
  return grouped;
};

/**
 * Formatea el total de gastos con soporte multi-moneda
 * @param expenses - Array de gastos
 * @param showCurrencyBreakdown - Si mostrar desglose por monedas
 * @returns String formateado
 */
export const formatExpensesTotal = (
  expenses: Expense[], 
  showCurrencyBreakdown = false
): string => {
  if (!expenses || expenses.length === 0) return '$0.00';
  
  const grouped = groupExpensesByCurrency(expenses);
  const currencies = Object.keys(grouped);
  
  if (currencies.length === 0) return '$0.00';
  
  if (currencies.length === 1 || !showCurrencyBreakdown) {
    // Una sola moneda o sin desglose
    const mainCurrency = currencies[0];
    const total = grouped[mainCurrency].total;
    return formatCurrencyWithCode(total, mainCurrency);
  }
  
  // Múltiples monedas
  return currencies
    .map(currency => formatCurrencyWithCode(grouped[currency].total, currency))
    .join(' + ');
};

/**
 * Obtiene estadísticas de gastos
 * @param expenses - Array de gastos
 * @returns Objeto con estadísticas
 */
export const getExpensesStats = (expenses: Expense[]) => {
  if (!expenses || expenses.length === 0) {
    return {
      totalExpenses: 0,
      totalAmount: 0,
      currencyBreakdown: {},
      averageExpense: 0,
      categoryBreakdown: {}
    };
  }
  
  const totalExpenses = expenses.length;
  const totalAmount = calculateExpensesTotal(expenses);
  const currencyBreakdown = groupExpensesByCurrency(expenses);
  const averageExpense = totalAmount / totalExpenses;
  
  // Agrupar por categoría
  const categoryBreakdown = expenses.reduce((acc, expense) => {
    const category = expense.type || 'OTHER';
    const amount = safeNumber(expense.amount);
    
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0 };
    }
    
    acc[category].total += amount;
    acc[category].count += 1;
    
    return acc;
  }, {} as Record<string, { total: number; count: number }>);
  
  return {
    totalExpenses,
    totalAmount,
    currencyBreakdown,
    averageExpense,
    categoryBreakdown
  };
};
