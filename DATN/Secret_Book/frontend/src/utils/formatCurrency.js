/**
 * Format currency for Vietnamese Dong (VND)
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  const numericAmount = parseFloat(amount) || 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericAmount);
};

/**
 * Format price without currency symbol
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted price string with ₫ symbol
 */
export const formatPrice = (amount) => {
  const numericAmount = parseFloat(amount) || 0;
  return numericAmount.toLocaleString('vi-VN') + ' ₫';
};