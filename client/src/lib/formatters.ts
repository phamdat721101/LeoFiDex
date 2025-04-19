/**
 * Format a number as a currency string
 * @param value The number to format
 * @param currency The currency symbol (default: $)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | string, currency: string = "$"): string {
  if (typeof value === "string") {
    value = parseFloat(value);
  }
  
  if (isNaN(value)) {
    return `${currency}0.00`;
  }
  
  // Format with appropriate abbreviation for large numbers
  if (value >= 1_000_000_000) {
    return `${currency}${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `${currency}${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `${currency}${(value / 1_000).toFixed(2)}K`;
  } else if (value >= 0.01) {
    return `${currency}${value.toFixed(2)}`;
  } else if (value > 0) {
    // For very small values, show more decimal places
    return `${currency}${value.toFixed(6)}`;
  } else {
    return `${currency}0.00`;
  }
}

/**
 * Format a number as a percentage
 * @param value The number to format (e.g., 0.05 for 5%)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number | string): string {
  if (typeof value === "string") {
    value = parseFloat(value);
  }
  
  if (isNaN(value)) {
    return "0.00%";
  }
  
  // Convert to percentage and format with appropriate precision
  const percentage = value * 100;
  
  if (Math.abs(percentage) >= 100) {
    return `${percentage.toFixed(0)}%`;
  } else if (Math.abs(percentage) >= 10) {
    return `${percentage.toFixed(1)}%`;
  } else {
    return `${percentage.toFixed(2)}%`;
  }
}

/**
 * Format a date to a relative time string (e.g., "2 mins ago")
 * @param date The date to format
 * @returns Formatted relative time string
 */
export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) {
    return `${seconds} ${seconds === 1 ? 'sec' : 'secs'} ago`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

/**
 * Format a number with thousands separators
 * @param value The number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number | string): string {
  if (typeof value === "string") {
    value = parseFloat(value);
  }
  
  if (isNaN(value)) {
    return "0";
  }
  
  return value.toLocaleString();
}

/**
 * Truncate a string in the middle
 * @param str The string to truncate
 * @param startChars Number of characters to keep at the start
 * @param endChars Number of characters to keep at the end
 * @returns Truncated string
 */
export function truncateMiddle(str: string, startChars: number = 6, endChars: number = 4): string {
  if (!str) {
    return "";
  }
  
  if (str.length <= startChars + endChars) {
    return str;
  }
  
  return `${str.substring(0, startChars)}...${str.substring(str.length - endChars)}`;
}

/**
 * Format a token amount with appropriate decimal places
 * @param amount The amount to format
 * @param decimals The number of decimals for the token
 * @param maxDecimals Maximum number of decimals to show (optional)
 * @returns Formatted token amount
 */
export function formatTokenAmount(amount: string | number, decimals: number, maxDecimals?: number): string {
  if (typeof amount === "string") {
    amount = parseFloat(amount);
  }
  
  if (isNaN(amount)) {
    return "0";
  }
  
  const decimalPlaces = maxDecimals !== undefined 
    ? Math.min(decimals, maxDecimals)
    : decimals;
  
  if (amount < 0.000001) {
    return amount.toExponential(decimalPlaces);
  }
  
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces
  });
}
