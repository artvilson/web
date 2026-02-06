import type { Transaction, TransactionDirection } from './types';
import { categorizeTransaction, detectChannel, cleanDescription } from './categorizer';

interface ParseResult {
  transactions: Transaction[];
  periodStart: string;
  periodEnd: string;
  accountHint: string;
  confidence: number;
  warnings: string[];
}

function generateId(): string {
  return crypto.randomUUID();
}

function parseDate(dateStr: string, year?: number): string {
  // Handle MM/DD format (common in Chase statements)
  const mdMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (mdMatch) {
    const month = mdMatch[1].padStart(2, '0');
    const day = mdMatch[2].padStart(2, '0');
    const y = year || new Date().getFullYear();
    return `${y}-${month}-${day}`;
  }

  // Handle MM/DD/YYYY or MM/DD/YY
  const fullMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (fullMatch) {
    const month = fullMatch[1].padStart(2, '0');
    const day = fullMatch[2].padStart(2, '0');
    let y = parseInt(fullMatch[3]);
    if (y < 100) y += 2000;
    return `${y}-${month}-${day}`;
  }

  return dateStr;
}

function parseAmount(amountStr: string): number {
  const cleaned = amountStr.replace(/[$,\s]/g, '').replace(/[()]/g, '');
  return Math.abs(parseFloat(cleaned)) || 0;
}

function extractStatementPeriod(text: string): { start: string; end: string; year: number } {
  // Look for "Statement Period: MM/DD/YYYY through MM/DD/YYYY"
  // Or "January 1, 2024 through January 31, 2024"
  // Or other common date range formats

  const monthNames: Record<string, string> = {
    'january': '01', 'february': '02', 'march': '03', 'april': '04',
    'may': '05', 'june': '06', 'july': '07', 'august': '08',
    'september': '09', 'october': '10', 'november': '11', 'december': '12',
  };

  // Pattern: "Month DD, YYYY through Month DD, YYYY"
  const namedDatePattern = /(\w+)\s+(\d{1,2}),?\s*(\d{4})\s*(?:through|thru|to|-)\s*(\w+)\s+(\d{1,2}),?\s*(\d{4})/i;
  const namedMatch = text.match(namedDatePattern);
  if (namedMatch) {
    const startMonth = monthNames[namedMatch[1].toLowerCase()] || '01';
    const startDay = namedMatch[2].padStart(2, '0');
    const startYear = namedMatch[3];
    const endMonth = monthNames[namedMatch[4].toLowerCase()] || '01';
    const endDay = namedMatch[5].padStart(2, '0');
    const endYear = namedMatch[6];
    return {
      start: `${startYear}-${startMonth}-${startDay}`,
      end: `${endYear}-${endMonth}-${endDay}`,
      year: parseInt(endYear),
    };
  }

  // Pattern: "MM/DD/YYYY through MM/DD/YYYY"
  const numericPattern = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s*(?:through|thru|to|-)\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})/i;
  const numMatch = text.match(numericPattern);
  if (numMatch) {
    let startYear = parseInt(numMatch[3]);
    let endYear = parseInt(numMatch[6]);
    if (startYear < 100) startYear += 2000;
    if (endYear < 100) endYear += 2000;
    return {
      start: `${startYear}-${numMatch[1].padStart(2, '0')}-${numMatch[2].padStart(2, '0')}`,
      end: `${endYear}-${numMatch[4].padStart(2, '0')}-${numMatch[5].padStart(2, '0')}`,
      year: endYear,
    };
  }

  // Fallback: look for any year
  const yearMatch = text.match(/20[1-3]\d/);
  const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

  return { start: '', end: '', year };
}

function extractAccountHint(text: string): string {
  // Look for account number patterns like "Account Number: ...1234" or "...ending in 1234"
  const patterns = [
    /account\s*(?:number|#|no\.?)?\s*[:.]?\s*(?:\.\.\.|…|x+)?\s*(\d{4})/i,
    /ending\s*in\s*(\d{4})/i,
    /(?:\.\.\.|…|x{3,})(\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  return '';
}

export function parseChaseStatement(
  text: string,
  statementId: string,
  filename: string
): ParseResult {
  const warnings: string[] = [];
  const transactions: Transaction[] = [];

  const { start, end, year } = extractStatementPeriod(text);
  const accountHint = extractAccountHint(text);

  if (!start || !end) {
    warnings.push('Could not detect statement period');
  }

  // Chase statement transaction patterns:
  // Pattern 1: "MM/DD  Description  Amount" (positive = deposit, negative or no sign = withdrawal)
  // Pattern 2: Various sections like "DEPOSITS AND ADDITIONS", "ELECTRONIC WITHDRAWALS", etc.

  // Split into lines
  const lines = text.split('\n').flatMap(line => line.split(/(?<=\d{1,2}\/\d{1,2})\s+/));

  // Detect sections to help with direction
  let currentSection: TransactionDirection = 'OUT';

  // More comprehensive transaction regex
  // Chase statements typically show: MM/DD Description Amount
  const txnPattern = /(\d{1,2}\/\d{1,2})\s+(.+?)\s+(-?\$?[\d,]+\.\d{2})\s*$/;
  const txnPattern2 = /(\d{1,2}\/\d{1,2})\s+(.+?)\s+([\d,]+\.\d{2})\s*$/;

  // Also try to find transactions in the full text using a global regex
  const fullTextPattern = /(\d{1,2}\/\d{1,2})\s+((?:(?!\d{1,2}\/\d{1,2}).)+?)\s+(-?\$?[\d,]+\.\d{2})/g;

  const textLines = text.split(/\n/);

  for (const line of textLines) {
    const trimmed = line.trim();

    // Detect section headers
    const upperLine = trimmed.toUpperCase();
    if (upperLine.includes('DEPOSIT') || upperLine.includes('ADDITION') ||
        upperLine.includes('CREDIT')) {
      currentSection = 'IN';
      continue;
    }
    if (upperLine.includes('WITHDRAWAL') || upperLine.includes('PAYMENT') ||
        upperLine.includes('PURCHASE') || upperLine.includes('DEBIT') ||
        upperLine.includes('FEE') || upperLine.includes('ELECTRONIC')) {
      currentSection = 'OUT';
      continue;
    }

    // Try matching transaction line
    let match = trimmed.match(txnPattern) || trimmed.match(txnPattern2);
    if (!match) continue;

    const dateStr = match[1];
    const description = match[2].trim();
    const amountStr = match[3];

    // Skip header-like lines
    if (description.toUpperCase().includes('DATE') && description.toUpperCase().includes('DESCRIPTION')) continue;
    if (description.length < 3) continue;

    const amount = parseAmount(amountStr);
    if (amount === 0) continue;

    // Determine direction
    let direction: TransactionDirection = currentSection;
    if (amountStr.startsWith('-')) {
      direction = 'OUT';
    } else if (amountStr.includes('(') || amountStr.includes(')')) {
      direction = 'OUT';
    }

    const channel = detectChannel(description);
    const category = categorizeTransaction(description);
    const descClean = cleanDescription(description);

    transactions.push({
      id: generateId(),
      account_id: accountHint || 'chase',
      statement_id: statementId,
      date: parseDate(dateStr, year),
      description_raw: description,
      description_clean: descClean,
      amount,
      direction,
      category,
      channel,
      tags: [],
    });
  }

  // If line-by-line didn't work well, try the full text regex
  if (transactions.length === 0) {
    let match;
    while ((match = fullTextPattern.exec(text)) !== null) {
      const dateStr = match[1];
      const description = match[2].trim();
      const amountStr = match[3];

      if (description.length < 3) continue;
      const amount = parseAmount(amountStr);
      if (amount === 0) continue;

      // Heuristic: check context for direction
      const contextStart = Math.max(0, match.index - 200);
      const context = text.substring(contextStart, match.index).toUpperCase();
      let direction: TransactionDirection = 'OUT';
      if (context.includes('DEPOSIT') || context.includes('ADDITION') || context.includes('CREDIT')) {
        direction = 'IN';
      }
      if (amountStr.startsWith('-')) direction = 'OUT';

      const channel = detectChannel(description);
      const category = categorizeTransaction(description);
      const descClean = cleanDescription(description);

      transactions.push({
        id: generateId(),
        account_id: accountHint || 'chase',
        statement_id: statementId,
        date: parseDate(dateStr, year),
        description_raw: description,
        description_clean: descClean,
        amount,
        direction,
        category,
        channel,
        tags: [],
      });
    }
  }

  if (transactions.length === 0) {
    warnings.push('No transactions could be extracted. The PDF format may not be supported.');
  }

  // Deduplicate by date + description + amount
  const seen = new Set<string>();
  const deduped = transactions.filter(t => {
    const key = `${t.date}|${t.description_raw}|${t.amount}|${t.direction}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (deduped.length < transactions.length) {
    warnings.push(`Removed ${transactions.length - deduped.length} duplicate transactions`);
  }

  const confidence = deduped.length > 0 ? Math.min(1, deduped.length / 20) : 0;

  return {
    transactions: deduped,
    periodStart: start,
    periodEnd: end,
    accountHint,
    confidence,
    warnings,
  };
}

export function parseGenericStatement(
  text: string,
  statementId: string,
  _filename: string
): ParseResult {
  // Generic parser that tries common patterns
  const warnings: string[] = ['Using generic parser - results may be less accurate'];
  const transactions: Transaction[] = [];

  const { start, end, year } = extractStatementPeriod(text);
  const accountHint = extractAccountHint(text);

  // Try various date+amount patterns
  const patterns = [
    /(\d{1,2}\/\d{1,2}\/?\d{0,4})\s+(.+?)\s+(-?\$?[\d,]+\.\d{2})\s*$/gm,
    /(\d{1,2}-\d{1,2}-\d{2,4})\s+(.+?)\s+(-?\$?[\d,]+\.\d{2})\s*$/gm,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const dateStr = match[1].replace(/-/g, '/');
      const description = match[2].trim();
      const amountStr = match[3];

      if (description.length < 3) continue;
      const amount = parseAmount(amountStr);
      if (amount === 0) continue;

      const direction: TransactionDirection = amountStr.startsWith('-') ? 'OUT' : 'IN';
      const channel = detectChannel(description);
      const category = categorizeTransaction(description);
      const descClean = cleanDescription(description);

      transactions.push({
        id: generateId(),
        account_id: accountHint || 'unknown',
        statement_id: statementId,
        date: parseDate(dateStr, year),
        description_raw: description,
        description_clean: descClean,
        amount,
        direction,
        category,
        channel,
        tags: [],
      });
    }
  }

  if (transactions.length === 0) {
    warnings.push('No transactions could be extracted.');
  }

  const confidence = transactions.length > 0 ? Math.min(0.7, transactions.length / 30) : 0;

  return {
    transactions,
    periodStart: start,
    periodEnd: end,
    accountHint,
    confidence,
    warnings,
  };
}
