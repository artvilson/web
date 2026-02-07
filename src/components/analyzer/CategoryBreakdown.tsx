import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAnalyzerStore } from '@/lib/analyzer/store';
import { exportCategorySummaryToCSV, downloadCSV } from '@/lib/analyzer/export-utils';
import { Download } from 'lucide-react';

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
  '#84cc16', '#e11d48', '#0ea5e9', '#d946ef', '#facc15',
];

function formatMoney(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export function CategoryBreakdown() {
  const categorySummary = useAnalyzerStore(s => s.getCategorySummary());
  const topMerchants = useAnalyzerStore(s => s.getTopMerchants());
  const monthlyTrends = useAnalyzerStore(s => s.getMonthlyTrends());

  const top10Categories = useMemo(() => categorySummary.slice(0, 10), [categorySummary]);
  const top10Merchants = useMemo(() => topMerchants.slice(0, 10), [topMerchants]);

  const handleExportCategories = () => {
    const csv = exportCategorySummaryToCSV(categorySummary);
    downloadCSV(csv, `categories-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  if (categorySummary.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No spending data available. Upload statements to see category breakdown.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category Pie Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="bg-gray-800/30 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Spending by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={top10Categories}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  strokeWidth={1}
                  stroke="#1f2937"
                >
                  {top10Categories.map((_entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Total']}
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#9ca3af' }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-gray-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category table */}
        <div className="bg-gray-800/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-300">Top Categories</h3>
            <button
              onClick={handleExportCategories}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              <Download size={12} />
              Export
            </button>
          </div>
          <div className="space-y-2">
            {top10Categories.map((cat, i) => (
              <div key={cat.category} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-200 truncate">{cat.category}</span>
                    <span className="text-sm font-mono text-gray-300 flex-shrink-0 ml-2">
                      ${cat.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="h-1 flex-1 bg-gray-700 rounded-full mr-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {cat.percentage.toFixed(1)}% · {cat.count} txns
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Merchants */}
      <div className="bg-gray-800/30 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Top Merchants / Payees</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top10Merchants} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
              <XAxis type="number" tickFormatter={formatMoney} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="merchant"
                width={110}
                tick={{ fill: '#d1d5db', fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Total']}
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trends */}
      {monthlyTrends.length > 0 && (
        <div className="bg-gray-800/30 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Monthly Trends</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tickFormatter={formatMoney} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    name === 'totalIn' ? 'Money In' : 'Money Out'
                  ]}
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-gray-400">
                      {value === 'totalIn' ? 'Money In' : 'Money Out'}
                    </span>
                  )}
                />
                <Bar dataKey="totalIn" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalOut" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
