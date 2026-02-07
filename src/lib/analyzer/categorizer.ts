import type { TransactionChannel } from './types';

interface CategoryRule {
  category: string;
  keywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  { category: 'Rideshare / Transport', keywords: ['UBER', 'LYFT', 'TAXI', 'PARKING', 'METRO', 'TRANSIT'] },
  { category: 'Gas / Fuel', keywords: ['SHELL', 'EXXON', 'CHEVRON', 'BP ', 'SUNOCO', 'CITGO', 'FUEL', 'GAS STATION', 'SPEEDWAY', 'WAWA'] },
  { category: 'Groceries', keywords: ['WALMART', 'TARGET', 'COSTCO', 'WHOLE FOODS', 'TRADER JOE', 'KROGER', 'ALDI', 'SAFEWAY', 'PUBLIX', 'HEB ', 'GROCERY'] },
  { category: 'Restaurants / Dining', keywords: ['MCDONALD', 'STARBUCKS', 'CHIPOTLE', 'CHICK-FIL', 'SUBWAY', 'DUNKIN', 'DOORDASH', 'GRUBHUB', 'UBER EATS', 'RESTAURANT', 'PIZZA', 'CAFE', 'DINER', 'TACO BELL', 'WENDY', 'BURGER KING', 'PANERA'] },
  { category: 'Shopping / Retail', keywords: ['AMAZON', 'AMZN', 'APPLE.COM', 'BEST BUY', 'HOME DEPOT', 'LOWES', 'IKEA', 'NORDSTROM', 'MACYS', 'ROSS', 'TJ MAXX', 'MARSHALLS'] },
  { category: 'Insurance', keywords: ['PROGRESSIVE', 'GEICO', 'STATE FARM', 'ALLSTATE', 'INSURANCE', 'OSCAR', 'AETNA', 'CIGNA', 'UNITED HEALTH', 'HUMANA', 'BLUE CROSS'] },
  { category: 'Utilities', keywords: ['ELECTRIC', 'GAS BILL', 'WATER BILL', 'INTERNET', 'COMCAST', 'VERIZON', 'AT&T', 'T-MOBILE', 'SPRINT', 'XFINITY', 'SPECTRUM', 'CON EDISON', 'CONED'] },
  { category: 'Subscriptions', keywords: ['NETFLIX', 'SPOTIFY', 'HULU', 'DISNEY+', 'HBO', 'APPLE MUSIC', 'YOUTUBE', 'ADOBE', 'MICROSOFT', 'GOOGLE STORAGE', 'ICLOUD'] },
  { category: 'Government / Tax', keywords: ['IRS', 'TAX', 'DMV', 'STATE OF', 'FEDERAL', 'GOVT', 'GOVERNMENT'] },
  { category: 'P2P Transfers', keywords: ['ZELLE', 'VENMO', 'CASHAPP', 'CASH APP', 'PAYPAL'] },
  { category: 'Wire / ACH Transfer', keywords: ['WIRE', 'ACH', 'TRANSFER', 'XFER'] },
  { category: 'Health / Medical', keywords: ['PHARMACY', 'CVS', 'WALGREENS', 'DOCTOR', 'HOSPITAL', 'MEDICAL', 'DENTAL', 'CLINIC', 'HEALTH'] },
  { category: 'Education', keywords: ['UNIVERSITY', 'COLLEGE', 'SCHOOL', 'TUITION', 'STUDENT', 'COURSERA', 'UDEMY'] },
  { category: 'Rent / Housing', keywords: ['RENT', 'MORTGAGE', 'LANDLORD', 'PROPERTY', 'HOA'] },
  { category: 'Bank Fees', keywords: ['SERVICE FEE', 'OVERDRAFT', 'ATM FEE', 'MONTHLY FEE', 'MAINTENANCE FEE', 'LATE FEE'] },
  { category: 'Cash / ATM', keywords: ['ATM', 'CASH WITHDRAWAL', 'CASH DEPOSIT'] },
  { category: 'Income / Deposit', keywords: ['DIRECT DEP', 'PAYROLL', 'SALARY', 'DEPOSIT', 'REFUND'] },
  { category: 'Check', keywords: ['CHECK #', 'CHECK NO', 'CHECKCARD'] },
];

// User-defined overrides: description pattern -> category
const userOverrides: Map<string, string> = new Map();

export function categorizeTransaction(descriptionRaw: string): string {
  const upper = descriptionRaw.toUpperCase();

  // Check user overrides first
  for (const [pattern, category] of userOverrides) {
    if (upper.includes(pattern.toUpperCase())) {
      return category;
    }
  }

  // Rule-based categorization
  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (upper.includes(keyword)) {
        return rule.category;
      }
    }
  }

  return 'Uncategorized';
}

export function addCategoryOverride(pattern: string, category: string) {
  userOverrides.set(pattern, category);
}

export function removeCategoryOverride(pattern: string) {
  userOverrides.delete(pattern);
}

export function getAllCategories(): string[] {
  return [...new Set(CATEGORY_RULES.map(r => r.category)), 'Uncategorized'];
}

export function detectChannel(descriptionRaw: string): TransactionChannel {
  const upper = descriptionRaw.toUpperCase();

  if (upper.includes('ACH') || upper.includes('ELECTRONIC')) return 'ACH';
  if (upper.includes('ZELLE')) return 'ZELLE';
  if (upper.includes('VENMO')) return 'VENMO';
  if (upper.includes('WIRE')) return 'WIRE';
  if (upper.includes('CHECK')) return 'CHECK';
  if (upper.includes('ATM') || upper.includes('CASH')) return 'CASH';
  if (upper.includes('CARD') || upper.includes('PURCHASE') || upper.includes('DEBIT') || upper.includes('POS')) return 'CARD';

  return 'OTHER';
}

export function cleanDescription(raw: string): string {
  let cleaned = raw
    .replace(/\s{2,}/g, ' ')
    .replace(/\d{2}\/\d{2}\s*/g, '')
    .replace(/PURCHASE\s*(AUTHORIZED ON|RETURN)\s*/gi, '')
    .replace(/RECURRING\s*/gi, '')
    .replace(/CARD\s*\d+\s*/gi, '')
    .replace(/POS\s*/gi, '')
    .replace(/ORIG CO NAME:.*$/gi, '')
    .replace(/CO ENTRY:.*$/gi, '')
    .replace(/SEC:.*$/gi, '')
    .replace(/IND ID:.*$/gi, '')
    .replace(/IND NAME:.*$/gi, '')
    .replace(/TRN\*.*$/gi, '')
    .trim();

  // Capitalize first letter of each word
  cleaned = cleaned
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());

  return cleaned || raw;
}
