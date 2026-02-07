import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Download, Filter, X } from 'lucide-react';
import { useAnalyzerStore } from '@/lib/analyzer/store';
import { getAllCategories } from '@/lib/analyzer/categorizer';
import { exportTransactionsToCSV, downloadCSV } from '@/lib/analyzer/export-utils';
import type { Transaction, TransactionDirection } from '@/lib/analyzer/types';

type SortField = 'date' | 'amount' | 'category';
type SortDir = 'asc' | 'desc';

export function TransactionLedger() {
  const transactions = useAnalyzerStore(s => s.getFilteredTransactions());
  const filters = useAnalyzerStore(s => s.filters);
  const setFilters = useAnalyzerStore(s => s.setFilters);
  const resetFilters = useAnalyzerStore(s => s.resetFilters);
  const statements = useAnalyzerStore(s => s.getActiveProjectStatements());
  const updateCategory = useAnalyzerStore(s => s.updateTransactionCategory);

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const sorted = useMemo(() => {
    const txns = [...transactions];
    txns.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'date':
          cmp = a.date.localeCompare(b.date);
          break;
        case 'amount':
          cmp = a.amount - b.amount;
          break;
        case 'category':
          cmp = a.category.localeCompare(b.category);
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return txns;
  }, [transactions, sortField, sortDir]);

  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={12} className="text-gray-600" />;
    return sortDir === 'desc'
      ? <ChevronDown size={12} className="text-blue-400" />
      : <ChevronUp size={12} className="text-blue-400" />;
  };

  const handleExport = () => {
    const csv = exportTransactionsToCSV(sorted);
    downloadCSV(csv, `transactions-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const categories = getAllCategories();
  const statementFilename = (stmtId: string) => {
    const stmt = statements.find(s => s.id === stmtId);
    return stmt?.uploaded_filename || stmtId.slice(0, 8);
  };

  const hasActiveFilters = filters.search || filters.direction || filters.category ||
    filters.dateRange || filters.amountMin !== null || filters.amountMax !== null ||
    filters.sourceStatement || filters.onlyTransfersTo0488 || filters.onlyACHTo0478;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search description, payee, category..."
            value={filters.search}
            onChange={(e) => { setFilters({ search: e.target.value }); setPage(0); }}
            className="w-full pl-9 pr-4 py-2 bg-gray-800/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/60'
            }`}
          >
            <Filter size={14} />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">ON</span>
            )}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 rounded-lg text-sm transition-colors"
          >
            <Download size={14} />
            CSV
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Direction */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">Direction</label>
            <select
              value={filters.direction || ''}
              onChange={(e) => { setFilters({ direction: (e.target.value || null) as TransactionDirection | null }); setPage(0); }}
              className="w-full px-3 py-1.5 bg-gray-700/60 border border-gray-600 rounded text-sm text-gray-200"
            >
              <option value="">All</option>
              <option value="IN">Inflow</option>
              <option value="OUT">Outflow</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">Category</label>
            <select
              value={filters.category || ''}
              onChange={(e) => { setFilters({ category: e.target.value || null }); setPage(0); }}
              className="w-full px-3 py-1.5 bg-gray-700/60 border border-gray-600 rounded text-sm text-gray-200"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Date range */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">Date From</label>
            <input
              type="date"
              value={filters.dateRange?.start || ''}
              onChange={(e) => {
                const start = e.target.value;
                const end = filters.dateRange?.end || '2099-12-31';
                setFilters({ dateRange: start ? { start, end } : null });
                setPage(0);
              }}
              className="w-full px-3 py-1.5 bg-gray-700/60 border border-gray-600 rounded text-sm text-gray-200"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Date To</label>
            <input
              type="date"
              value={filters.dateRange?.end || ''}
              onChange={(e) => {
                const end = e.target.value;
                const start = filters.dateRange?.start || '2000-01-01';
                setFilters({ dateRange: end ? { start, end } : null });
                setPage(0);
              }}
              className="w-full px-3 py-1.5 bg-gray-700/60 border border-gray-600 rounded text-sm text-gray-200"
            />
          </div>

          {/* Amount range */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">Amount Min</label>
            <input
              type="number"
              placeholder="0.00"
              value={filters.amountMin ?? ''}
              onChange={(e) => { setFilters({ amountMin: e.target.value ? parseFloat(e.target.value) : null }); setPage(0); }}
              className="w-full px-3 py-1.5 bg-gray-700/60 border border-gray-600 rounded text-sm text-gray-200"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Amount Max</label>
            <input
              type="number"
              placeholder="999999"
              value={filters.amountMax ?? ''}
              onChange={(e) => { setFilters({ amountMax: e.target.value ? parseFloat(e.target.value) : null }); setPage(0); }}
              className="w-full px-3 py-1.5 bg-gray-700/60 border border-gray-600 rounded text-sm text-gray-200"
            />
          </div>

          {/* Source statement */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">Source Statement</label>
            <select
              value={filters.sourceStatement || ''}
              onChange={(e) => { setFilters({ sourceStatement: e.target.value || null }); setPage(0); }}
              className="w-full px-3 py-1.5 bg-gray-700/60 border border-gray-600 rounded text-sm text-gray-200"
            >
              <option value="">All Statements</option>
              {statements.map(s => (
                <option key={s.id} value={s.id}>{s.uploaded_filename}</option>
              ))}
            </select>
          </div>

          {/* Quick filters */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 block mb-1">Quick Filters</label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onlyTransfersTo0488}
                onChange={(e) => { setFilters({ onlyTransfersTo0488: e.target.checked }); setPage(0); }}
                className="rounded border-gray-600"
              />
              Only 0488 transfers
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.onlyACHTo0478}
                onChange={(e) => { setFilters({ onlyACHTo0478: e.target.checked }); setPage(0); }}
                className="rounded border-gray-600"
              />
              Only ACH to 0478
            </label>
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <div className="sm:col-span-2 lg:col-span-4">
              <button
                onClick={() => { resetFilters(); setPage(0); }}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-gray-500">
        {sorted.length} transaction{sorted.length !== 1 ? 's' : ''}
        {hasActiveFilters && ' (filtered)'}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-700/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800/60 text-gray-400 text-xs uppercase">
              <th
                className="px-4 py-3 text-left cursor-pointer hover:text-gray-200 select-none"
                onClick={() => toggleSort('date')}
              >
                <span className="flex items-center gap-1">Date <SortIcon field="date" /></span>
              </th>
              <th className="px-4 py-3 text-left">Description</th>
              <th
                className="px-4 py-3 text-left cursor-pointer hover:text-gray-200 select-none"
                onClick={() => toggleSort('category')}
              >
                <span className="flex items-center gap-1">Category <SortIcon field="category" /></span>
              </th>
              <th
                className="px-4 py-3 text-right cursor-pointer hover:text-gray-200 select-none"
                onClick={() => toggleSort('amount')}
              >
                <span className="flex items-center justify-end gap-1">Amount <SortIcon field="amount" /></span>
              </th>
              <th className="px-4 py-3 text-left">Channel</th>
              <th className="px-4 py-3 text-left">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {paginated.map(txn => (
              <tr key={txn.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-2.5 text-gray-300 whitespace-nowrap">{txn.date}</td>
                <td className="px-4 py-2.5 max-w-xs">
                  <p className="text-gray-200 truncate" title={txn.description_raw}>
                    {txn.description_clean}
                  </p>
                  <p className="text-xs text-gray-500 truncate" title={txn.description_raw}>
                    {txn.description_raw}
                  </p>
                </td>
                <td className="px-4 py-2.5">
                  {editingCategory === txn.id ? (
                    <select
                      value={txn.category}
                      onChange={(e) => {
                        updateCategory(txn.id, e.target.value);
                        setEditingCategory(null);
                      }}
                      onBlur={() => setEditingCategory(null)}
                      autoFocus
                      className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <span
                      className="text-xs text-gray-400 cursor-pointer hover:text-blue-400 transition-colors"
                      onClick={() => setEditingCategory(txn.id)}
                      title="Click to edit category"
                    >
                      {txn.category}
                    </span>
                  )}
                </td>
                <td className={`px-4 py-2.5 text-right font-mono whitespace-nowrap ${
                  txn.direction === 'IN' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {txn.direction === 'IN' ? '+' : '−'}${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-400">
                    {txn.channel}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-500 max-w-[120px] truncate">
                  {statementFilename(txn.statement_id)}
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  {transactions.length === 0
                    ? 'No transactions yet. Upload PDF statements to get started.'
                    : 'No transactions match the current filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 rounded bg-gray-800/60 hover:bg-gray-700/60 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 rounded bg-gray-800/60 hover:bg-gray-700/60 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
