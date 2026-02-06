import { LayoutDashboard, List, PieChart, FileText, Settings } from 'lucide-react';
import { useAnalyzerStore } from '@/lib/analyzer/store';
import { ProjectSelector } from '@/components/analyzer/ProjectSelector';
import { FileUpload, StatementsSummary } from '@/components/analyzer/FileUpload';
import { Dashboard } from '@/components/analyzer/Dashboard';
import { TransactionLedger } from '@/components/analyzer/TransactionLedger';
import { CategoryBreakdown } from '@/components/analyzer/CategoryBreakdown';
import { DocumentVault } from '@/components/analyzer/DocumentVault';

type Tab = 'dashboard' | 'ledger' | 'categories' | 'documents';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'ledger', label: 'Transactions', icon: <List size={16} /> },
  { id: 'categories', label: 'Categories', icon: <PieChart size={16} /> },
  { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
];

export default function AnalyzerPage() {
  const activeTab = useAnalyzerStore(s => s.activeTab);
  const setActiveTab = useAnalyzerStore(s => s.setActiveTab);
  const transactions = useAnalyzerStore(s => s.transactions);
  const activeProjectId = useAnalyzerStore(s => s.activeProjectId);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-100">PDF Statement Analyzer</h1>
              <p className="text-xs text-gray-500 mt-0.5">Artvilson LLC — Bookkeeping Dashboard</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {transactions.length > 0 && (
                <span>{transactions.length} total transactions</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Project selector */}
            <div>
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Project</h2>
              <ProjectSelector />
            </div>

            {/* Upload */}
            <div>
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Upload PDFs</h2>
              <FileUpload />
            </div>

            {/* Parsed statements summary */}
            <StatementsSummary />
          </aside>

          {/* Main content */}
          <main className="min-w-0">
            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-gray-800/30 rounded-xl p-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
                    activeTab === tab.id
                      ? 'bg-gray-700/60 text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            {!activeProjectId ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4">
                  <LayoutDashboard size={28} className="text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">Get Started</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Create a project, then upload your bank statement PDFs to see analytics,
                  transaction breakdown, and transfer tracking.
                </p>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'ledger' && <TransactionLedger />}
                {activeTab === 'categories' && <CategoryBreakdown />}
                {activeTab === 'documents' && <DocumentVault />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
