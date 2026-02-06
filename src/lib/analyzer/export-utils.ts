import type { Transaction, CategorySummary } from './types';

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function exportTransactionsToCSV(transactions: Transaction[]): string {
  const headers = ['Date', 'Description', 'Cleaned Description', 'Category', 'Amount', 'Direction', 'Channel', 'Tags', 'Source Statement'];
  const rows = transactions.map(t => [
    t.date,
    escapeCsvField(t.description_raw),
    escapeCsvField(t.description_clean),
    t.category,
    t.direction === 'OUT' ? `-${t.amount.toFixed(2)}` : t.amount.toFixed(2),
    t.direction,
    t.channel,
    t.tags.join('; '),
    t.statement_id,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function exportCategorySummaryToCSV(categories: CategorySummary[]): string {
  const headers = ['Category', 'Total', 'Count', 'Percentage'];
  const rows = categories.map(c => [
    escapeCsvField(c.category),
    c.total.toFixed(2),
    c.count.toString(),
    c.percentage.toFixed(1) + '%',
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function exportTransfersDetailToCSV(transactions: Transaction[], label: string): string {
  const headers = ['Label', 'Date', 'Description', 'Amount', 'Channel'];
  const rows = transactions.map(t => [
    escapeCsvField(label),
    t.date,
    escapeCsvField(t.description_raw),
    t.amount.toFixed(2),
    t.channel,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
