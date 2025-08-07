/**
 * Convierte un valor a número de manera segura
 * @param value - El valor a convertir (puede ser string, number, null, undefined)
 * @param defaultValue - Valor por defecto si la conversión falla (default: 0)
 * @returns Un número válido
 */
export const safeNumber = (value: unknown, defaultValue: number = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  
  return defaultValue;
};

/**
 * Formatea un número como moneda
 * @param value - El valor a formatear
 * @param currency - El símbolo de moneda (default: '$')
 * @param decimals - Número de decimales (default: 2)
 * @returns Cadena formateada como moneda
 */
export const formatCurrency = (
  value: number | string, 
  currency: string = '$', 
  decimals: number = 2
): string => {
  const num = safeNumber(value);
  return `${currency}${num.toFixed(decimals)}`;
};

/**
 * Obtiene el símbolo de moneda apropiado
 * @param currencyCode - Código de moneda (ARS, USD, EUR, etc.)
 * @returns Símbolo de moneda
 */
export const getCurrencySymbol = (currencyCode?: string): string => {
  const symbols: Record<string, string> = {
    'USD': 'USD',
    'ARS': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'BRL': 'R$',
    'CLP': '$',
    'COP': '$',
    'MXN': '$',
    'PEN': 'S/',
  };
  
  return symbols[currencyCode?.toUpperCase() || 'USD'] || '$';
};

/**
 * Formatea moneda con el símbolo correcto según el código
 * @param value - El valor a formatear
 * @param currencyCode - Código de moneda (USD, ARS, etc.)
 * @param decimals - Número de decimales (default: 2)
 * @returns Cadena formateada con moneda apropiada
 */
export const formatCurrencyWithCode = (
  value: number | string, 
  currencyCode?: string,
  decimals: number = 2
): string => {
  const symbol = getCurrencySymbol(currencyCode);
  const num = safeNumber(value);
  const suffix = currencyCode && currencyCode !== 'USD' ? ` ${currencyCode}` : '';
  return `${symbol}${num.toFixed(decimals)}${suffix}`;
};

/**
 * Formatea una fecha de manera segura
 * @param dateValue - La fecha a formatear
 * @param fallback - Texto de respaldo si la fecha es inválida
 * @returns Fecha formateada o texto de respaldo
 */
export const formatDate = (dateValue: string | undefined, fallback: string = 'Sin fecha'): string => {
  if (!dateValue) return fallback;
  
  try {
    return new Date(dateValue).toLocaleDateString();
  } catch {
    return fallback;
  }
};

/**
 * Formatea una fecha y hora de manera segura
 * @param dateValue - La fecha a formatear
 * @param fallback - Texto de respaldo si la fecha es inválida
 * @returns Fecha y hora formateada o texto de respaldo
 */
export const formatDateTime = (dateValue: string | undefined, fallback: string = 'Sin fecha'): string => {
  if (!dateValue) return fallback;
  
  try {
    return new Date(dateValue).toLocaleString();
  } catch {
    return fallback;
  }
};
