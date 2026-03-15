/**
 * Currency Configuration Utility
 * Centralizes all currency display logic for TW TECH STORE
 * 
 * Usage:
 *   import { formatPrice, CURRENCY_SYMBOL, CURRENCY_CODE } from '../utils/currency';
 *   formatPrice(2299.00)  // "Rs. 2,299.00"
 *   CURRENCY_SYMBOL        // "Rs."
 *   CURRENCY_CODE          // "LKR"
 */

export const CURRENCY_CODE = 'LKR';
export const CURRENCY_SYMBOL = 'Rs.';

/**
 * Format a number as a price with the store currency symbol
 * @param {number} amount - The price amount
 * @param {boolean} showDecimals - Whether to show decimal places (default: true)
 * @returns {string} Formatted price string, e.g. "Rs. 2,299.00"
 */
export const formatPrice = (amount, showDecimals = true) => {
  if (amount === null || amount === undefined) return `${CURRENCY_SYMBOL} 0.00`;
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return `${CURRENCY_SYMBOL} 0.00`;
  
  const formatted = showDecimals ? num.toFixed(2) : Math.round(num).toString();
  
  return `${CURRENCY_SYMBOL} ${formatted}`;
};

/**
 * Format a negative price (for credit notes, refunds)
 * @param {number} amount - The price amount (positive number)
 * @returns {string} Formatted negative price string, e.g. "-Rs. 299.00"
 */
export const formatNegativePrice = (amount) => {
  if (amount === null || amount === undefined) return `-${CURRENCY_SYMBOL} 0.00`;
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return `-${CURRENCY_SYMBOL} 0.00`;
  
  return `-${CURRENCY_SYMBOL} ${num.toFixed(2)}`;
};
