import { ArrowDownRight, ArrowUpRight, Building2, Landmark, TrendingDown, TrendingUp } from 'lucide-react';
import { useAnalyzerStore } from '@/lib/analyzer/store';

function formatMoney(amount: number): string {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface SummaryBlockProps {
  title: string;
  amount: number;
  subtitle?: string;
  count?: number;
  icon: React.ReactNode;
  color: 'green' | 'red' | 'blue' | 'purple';
  dateRange?: string;
  details?: string[];
}

function SummaryBlock({ title, amount, subtitle, count, icon, color, dateRange, details }: SummaryBlockProps) {
  const colorMap = {
    green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', accent: 'text-green-300' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', accent: 'text-red-300' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', accent: 'text-blue-300' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', accent: 'text-purple-300' },
  };

  const c = colorMap[color];

  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`${c.text} p-2 rounded-lg ${c.bg}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold ${c.accent} mb-1`}>
        ${formatMoney(amount)}
      </p>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        {count !== undefined && <span>{count} transaction{count !== 1 ? 's' : ''}</span>}
        {dateRange && <span>{dateRange}</span>}
      </div>
      {details && details.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-1">
          {details.map((d, i) => (
            <p key={i} className="text-xs text-gray-400">{d}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const stats = useAnalyzerStore(s => s.getDashboardStats());
  const filters = useAnalyzerStore(s => s.filters);
  const transactions = useAnalyzerStore(s => s.getFilteredTransactions());

  const dateRange = filters.dateRange
    ? `${filters.dateRange.start} to ${filters.dateRange.end}`
    : transactions.length > 0
    ? `${transactions[transactions.length - 1]?.date} to ${transactions[0]?.date}`
    : undefined;

  // Get top description patterns for 0488 transfers
  const top0488Patterns = getTopPatterns(stats.transfersTo0488.transactions);
  const top0478Patterns = getTopPatterns(stats.achTo0478.transactions);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SummaryBlock
        title="Total Money In (Chase)"
        subtitle="Sum of all deposits & credits"
        amount={stats.totalIn}
        count={transactions.filter(t => t.direction === 'IN').length}
        icon={<TrendingUp size={20} />}
        color="green"
        dateRange={dateRange}
      />
      <SummaryBlock
        title="Total Money Out (Chase)"
        subtitle="Sum of all withdrawals & debits"
        amount={stats.totalOut}
        count={transactions.filter(t => t.direction === 'OUT').length}
        icon={<TrendingDown size={20} />}
        color="red"
        dateRange={dateRange}
      />
      <SummaryBlock
        title="Transfers to Capital One 0488"
        subtitle="Business debit — Artvilson LLC"
        amount={stats.transfersTo0488.total}
        count={stats.transfersTo0488.count}
        icon={<Building2 size={20} />}
        color="blue"
        dateRange={dateRange}
        details={top0488Patterns.length > 0 ? [
          'Top patterns:',
          ...top0488Patterns.map(p => `  ${p.pattern} (${p.count}x)`)
        ] : undefined}
      />
      <SummaryBlock
        title="ACH Total to 0478"
        subtitle="ACH transfers to configured target"
        amount={stats.achTo0478.total}
        count={stats.achTo0478.count}
        icon={<Landmark size={20} />}
        color="purple"
        dateRange={dateRange}
        details={top0478Patterns.length > 0 ? [
          'Top patterns:',
          ...top0478Patterns.map(p => `  ${p.pattern} (${p.count}x)`)
        ] : undefined}
      />
    </div>
  );
}

function getTopPatterns(transactions: { description_raw: string }[]): { pattern: string; count: number }[] {
  const patterns = new Map<string, number>();
  for (const t of transactions) {
    // Use first ~40 chars as pattern
    const key = t.description_raw.substring(0, 40).trim();
    patterns.set(key, (patterns.get(key) || 0) + 1);
  }
  return Array.from(patterns.entries())
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}
