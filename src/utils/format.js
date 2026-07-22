export function formatCurrency(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '0원';
  return `${Number(amount).toLocaleString('ko-KR')}원`;
}

export function formatNumber(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '0';
  return Number(amount).toLocaleString('ko-KR');
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

export function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return '';
  if (!endDate || startDate === endDate) return formatDate(startDate);
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}