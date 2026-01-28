/**
 * Utility functions for formatting data display
 */

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number, options?: {
  showCents?: boolean;
  showSign?: boolean;
}): string {
  const { showCents = true, showSign = false } = options || {};
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });

  let formatted = formatter.format(Math.abs(amount));
  
  if (showSign && amount !== 0) {
    formatted = (amount > 0 ? '+' : '-') + formatted;
  } else if (amount < 0) {
    formatted = '-' + formatted;
  }
  
  return formatted;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, options?: {
  style?: 'short' | 'medium' | 'long' | 'relative';
  includeTime?: boolean;
}): string {
  const { style = 'medium', includeTime = false } = options || {};
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (style === 'relative') {
    return formatRelativeDate(dateObj);
  }

  const formatOptions: Intl.DateTimeFormatOptions = {};

  switch (style) {
    case 'short':
      formatOptions.month = 'short';
      formatOptions.day = 'numeric';
      break;
    case 'medium':
      formatOptions.month = 'short';
      formatOptions.day = 'numeric';
      formatOptions.year = 'numeric';
      break;
    case 'long':
      formatOptions.weekday = 'long';
      formatOptions.month = 'long';
      formatOptions.day = 'numeric';
      formatOptions.year = 'numeric';
      break;
  }

  if (includeTime) {
    formatOptions.hour = 'numeric';
    formatOptions.minute = '2-digit';
    formatOptions.hour12 = true;
  }

  return new Intl.DateTimeFormat('en-US', formatOptions).format(dateObj);
}

/**
 * Format a date relative to now (e.g., "2 days ago")
 */
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 7) {
    return formatDate(date, { style: 'short' });
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, options?: {
  decimals?: number;
  showSign?: boolean;
}): string {
  const { decimals = 1, showSign = false } = options || {};
  
  let formatted = `${value.toFixed(decimals)}%`;
  
  if (showSign && value > 0) {
    formatted = '+' + formatted;
  }
  
  return formatted;
}

/**
 * Format a number with commas
 */
export function formatNumber(value: number, options?: {
  decimals?: number;
  showSign?: boolean;
}): string {
  const { decimals = 0, showSign = false } = options || {};
  
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  let formatted = formatter.format(Math.abs(value));
  
  if (showSign && value !== 0) {
    formatted = (value > 0 ? '+' : '-') + formatted;
  } else if (value < 0) {
    formatted = '-' + formatted;
  }
  
  return formatted;
}

/**
 * Format days as a readable string
 */
export function formatDays(days: number): string {
  if (days === 0) return 'Same day';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    if (remainingDays === 0) {
      return `${weeks} week${weeks > 1 ? 's' : ''}`;
    } else {
      return `${weeks}w ${remainingDays}d`;
    }
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `~${months} month${months > 1 ? 's' : ''}`;
  }
  
  const years = Math.floor(days / 365);
  return `~${years} year${years > 1 ? 's' : ''}`;
}

/**
 * Format trend value with appropriate icon and color
 */
export function formatTrend(value: number, options?: {
  type?: 'percentage' | 'currency' | 'number';
  decimals?: number;
}): {
  value: string;
  direction: 'up' | 'down' | 'neutral';
  className: string;
} {
  const { type = 'percentage', decimals = 1 } = options || {};
  
  let formattedValue: string;
  
  switch (type) {
    case 'currency':
      formattedValue = formatCurrency(Math.abs(value), { showCents: true });
      break;
    case 'number':
      formattedValue = formatNumber(Math.abs(value), { decimals });
      break;
    default:
      formattedValue = formatPercentage(Math.abs(value), { decimals });
  }

  let direction: 'up' | 'down' | 'neutral';
  let className: string;

  if (value > 0) {
    direction = 'up';
    className = 'text-green-600';
    formattedValue = '+' + formattedValue;
  } else if (value < 0) {
    direction = 'down';
    className = 'text-red-600';
    formattedValue = '-' + formattedValue;
  } else {
    direction = 'neutral';
    className = 'text-gray-500';
    formattedValue = formattedValue;
  }

  return {
    value: formattedValue,
    direction,
    className,
  };
}