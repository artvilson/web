import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => {
        if ('str' in item) return item.str;
        return '';
      })
      .join(' ');
    textParts.push(pageText);
  }

  return textParts.join('\n\n--- PAGE BREAK ---\n\n');
}

export function detectDocumentType(text: string, filename: string): 'statement' | 'form' {
  const upper = text.toUpperCase();
  const fnUpper = filename.toUpperCase();

  // Check for known form types
  if (upper.includes('1095-A') || upper.includes('1095-B') || upper.includes('1095-C') ||
      fnUpper.includes('1095')) {
    return 'form';
  }
  if (upper.includes('W-2') || upper.includes('W2') || fnUpper.includes('W2') || fnUpper.includes('W-2')) {
    return 'form';
  }
  if (upper.includes('1099') || fnUpper.includes('1099')) {
    return 'form';
  }

  // If it looks like a bank statement
  if (upper.includes('STATEMENT') || upper.includes('TRANSACTION') ||
      upper.includes('BALANCE') || upper.includes('DEPOSIT') ||
      upper.includes('WITHDRAWAL') || upper.includes('DEBIT') ||
      upper.includes('CREDIT')) {
    return 'statement';
  }

  return 'statement'; // default to statement
}

export function detectBank(text: string, filename: string): 'Chase' | 'CapitalOne' | 'Other' {
  const upper = text.toUpperCase();
  const fnUpper = filename.toUpperCase();

  if (upper.includes('JPMORGAN CHASE') || upper.includes('CHASE BANK') ||
      upper.includes('J.P. MORGAN') || fnUpper.includes('CHASE')) {
    return 'Chase';
  }
  if (upper.includes('CAPITAL ONE') || fnUpper.includes('CAPITAL ONE') ||
      fnUpper.includes('CAPITALONE')) {
    return 'CapitalOne';
  }

  return 'Other';
}

export function detectFormType(text: string): { type: string; year: string; fields: Record<string, string> } {
  const upper = text.toUpperCase();
  let type = 'Unknown';
  let year = '';
  const fields: Record<string, string> = {};

  if (upper.includes('1095-A')) type = '1095-A';
  else if (upper.includes('1095-B')) type = '1095-B';
  else if (upper.includes('1095-C')) type = '1095-C';
  else if (upper.includes('1099-MISC')) type = '1099-MISC';
  else if (upper.includes('1099-NEC')) type = '1099-NEC';
  else if (upper.includes('1099-INT')) type = '1099-INT';
  else if (upper.includes('W-2') || upper.includes('W2')) type = 'W-2';

  // Extract year (look for 4-digit year near common keywords)
  const yearMatch = text.match(/(?:TAX\s*YEAR|CALENDAR\s*YEAR|FOR\s*(?:THE\s*)?YEAR)\s*(\d{4})/i)
    || text.match(/20[1-3]\d/);
  if (yearMatch) {
    year = yearMatch[1] || yearMatch[0];
  }

  return { type, year, fields };
}
