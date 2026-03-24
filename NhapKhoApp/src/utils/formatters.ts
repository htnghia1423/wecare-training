/**
 * Format date string to Vietnamese locale
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: string | number | undefined): string {
  if (value === undefined || value === null || value === '') return '-';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  
  return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Format currency (VND)
 */
export function formatCurrency(value: string | number | undefined): string {
  if (value === undefined || value === null || value === '') return '-';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(num);
}
