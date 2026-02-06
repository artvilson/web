import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Transaction,
  Statement,
  Project,
  MatchingRule,
  DashboardFilters,
  CategorySummary,
  MerchantSummary,
  MonthlyTrend,
} from './types';
import { DEFAULT_FILTERS, DEFAULT_MATCHING_RULES } from './types';
import { extractTextFromPDF, detectDocumentType, detectBank, detectFormType } from './pdf-parser';
import { parseChaseStatement, parseGenericStatement } from './chase-parser';
import { getTransfersTo0488, getACHTo0478 } from './matching-rules';

interface AnalyzerState {
  // Data
  projects: Project[];
  activeProjectId: string | null;
  statements: Statement[];
  transactions: Transaction[];
  matchingRules: MatchingRule[];

  // UI state
  filters: DashboardFilters;
  isProcessing: boolean;
  processingProgress: { current: number; total: number; filename: string } | null;
  activeTab: 'dashboard' | 'ledger' | 'categories' | 'documents';

  // Actions - Projects
  createProject: (name: string) => string;
  setActiveProject: (id: string) => void;
  deleteProject: (id: string) => void;

  // Actions - File processing
  processFiles: (files: File[]) => Promise<void>;

  // Actions - Filters
  setFilters: (filters: Partial<DashboardFilters>) => void;
  resetFilters: () => void;

  // Actions - Rules
  updateRule: (rule: MatchingRule) => void;
  addRule: (rule: MatchingRule) => void;
  deleteRule: (ruleId: string) => void;

  // Actions - Transactions
  updateTransactionCategory: (txnId: string, category: string) => void;

  // Actions - UI
  setActiveTab: (tab: AnalyzerState['activeTab']) => void;

  // Computed / selectors
  getFilteredTransactions: () => Transaction[];
  getDashboardStats: () => {
    totalIn: number;
    totalOut: number;
    transfersTo0488: { total: number; count: number; transactions: Transaction[] };
    achTo0478: { total: number; count: number; transactions: Transaction[] };
  };
  getCategorySummary: () => CategorySummary[];
  getTopMerchants: () => MerchantSummary[];
  getMonthlyTrends: () => MonthlyTrend[];
  getActiveProjectStatements: () => Statement[];
  getDocuments: () => Statement[];
}

export const useAnalyzerStore = create<AnalyzerState>()(
  persist(
    (set, get) => ({
      // Initial state
      projects: [],
      activeProjectId: null,
      statements: [],
      transactions: [],
      matchingRules: [...DEFAULT_MATCHING_RULES],
      filters: { ...DEFAULT_FILTERS },
      isProcessing: false,
      processingProgress: null,
      activeTab: 'dashboard',

      // Project actions
      createProject: (name: string) => {
        const id = crypto.randomUUID();
        const project: Project = {
          id,
          name,
          created_at: new Date().toISOString(),
          statement_ids: [],
        };
        set(state => ({ projects: [...state.projects, project], activeProjectId: id }));
        return id;
      },

      setActiveProject: (id: string) => {
        set({ activeProjectId: id, filters: { ...DEFAULT_FILTERS } });
      },

      deleteProject: (id: string) => {
        set(state => {
          const project = state.projects.find(p => p.id === id);
          const stmtIds = project?.statement_ids || [];
          return {
            projects: state.projects.filter(p => p.id !== id),
            statements: state.statements.filter(s => !stmtIds.includes(s.id)),
            transactions: state.transactions.filter(t => !stmtIds.includes(t.statement_id)),
            activeProjectId: state.activeProjectId === id
              ? (state.projects.find(p => p.id !== id)?.id || null)
              : state.activeProjectId,
          };
        });
      },

      // File processing
      processFiles: async (files: File[]) => {
        const state = get();
        let projectId = state.activeProjectId;
        if (!projectId) {
          projectId = state.createProject('Default Project');
        }

        set({ isProcessing: true });

        const newStatements: Statement[] = [];
        const newTransactions: Transaction[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          set({ processingProgress: { current: i + 1, total: files.length, filename: file.name } });

          try {
            const text = await extractTextFromPDF(file);
            const docType = detectDocumentType(text, file.name);
            const bank = detectBank(text, file.name);
            const stmtId = crypto.randomUUID();

            if (docType === 'form') {
              const formInfo = detectFormType(text);
              const statement: Statement = {
                id: stmtId,
                bank,
                account_hint: '',
                period_start: '',
                period_end: '',
                uploaded_filename: file.name,
                parsed_at: new Date().toISOString(),
                parse_confidence: 0.5,
                transaction_count: 0,
                total_in: 0,
                total_out: 0,
                warnings: [],
                doc_type: 'form',
                form_type: formInfo.type,
                form_year: formInfo.year,
                form_fields: formInfo.fields,
                raw_text: text.substring(0, 5000),
              };
              newStatements.push(statement);
            } else {
              // Parse as statement
              const parseResult = bank === 'Chase'
                ? parseChaseStatement(text, stmtId, file.name)
                : parseGenericStatement(text, stmtId, file.name);

              const statement: Statement = {
                id: stmtId,
                bank,
                account_hint: parseResult.accountHint,
                period_start: parseResult.periodStart,
                period_end: parseResult.periodEnd,
                uploaded_filename: file.name,
                parsed_at: new Date().toISOString(),
                parse_confidence: parseResult.confidence,
                transaction_count: parseResult.transactions.length,
                total_in: parseResult.transactions
                  .filter(t => t.direction === 'IN')
                  .reduce((sum, t) => sum + t.amount, 0),
                total_out: parseResult.transactions
                  .filter(t => t.direction === 'OUT')
                  .reduce((sum, t) => sum + t.amount, 0),
                warnings: parseResult.warnings,
                doc_type: 'statement',
                raw_text: text.substring(0, 5000),
              };

              newStatements.push(statement);
              newTransactions.push(...parseResult.transactions);
            }
          } catch (error) {
            const statement: Statement = {
              id: crypto.randomUUID(),
              bank: 'Other',
              account_hint: '',
              period_start: '',
              period_end: '',
              uploaded_filename: file.name,
              parsed_at: new Date().toISOString(),
              parse_confidence: 0,
              transaction_count: 0,
              total_in: 0,
              total_out: 0,
              warnings: [`Failed to parse: ${error instanceof Error ? error.message : 'Unknown error'}`],
              doc_type: 'statement',
            };
            newStatements.push(statement);
          }
        }

        set(state => {
          const project = state.projects.find(p => p.id === projectId);
          const updatedProjects = project
            ? state.projects.map(p =>
                p.id === projectId
                  ? { ...p, statement_ids: [...p.statement_ids, ...newStatements.map(s => s.id)] }
                  : p
              )
            : state.projects;

          return {
            statements: [...state.statements, ...newStatements],
            transactions: [...state.transactions, ...newTransactions],
            projects: updatedProjects,
            isProcessing: false,
            processingProgress: null,
          };
        });
      },

      // Filters
      setFilters: (filters) => {
        set(state => ({ filters: { ...state.filters, ...filters } }));
      },

      resetFilters: () => {
        set({ filters: { ...DEFAULT_FILTERS } });
      },

      // Rules
      updateRule: (rule) => {
        set(state => ({
          matchingRules: state.matchingRules.map(r => r.rule_id === rule.rule_id ? rule : r),
        }));
      },

      addRule: (rule) => {
        set(state => ({ matchingRules: [...state.matchingRules, rule] }));
      },

      deleteRule: (ruleId) => {
        set(state => ({
          matchingRules: state.matchingRules.filter(r => r.rule_id !== ruleId),
        }));
      },

      // Transaction editing
      updateTransactionCategory: (txnId, category) => {
        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === txnId ? { ...t, category } : t
          ),
        }));
      },

      // UI
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Selectors
      getFilteredTransactions: () => {
        const { transactions, filters, activeProjectId, projects, statements, matchingRules } = get();

        // Get statement IDs for active project
        const project = projects.find(p => p.id === activeProjectId);
        const projectStmtIds = project?.statement_ids || [];

        let filtered = transactions.filter(t => projectStmtIds.includes(t.statement_id));

        if (filters.dateRange) {
          filtered = filtered.filter(t =>
            t.date >= filters.dateRange!.start && t.date <= filters.dateRange!.end
          );
        }
        if (filters.amountMin !== null) {
          filtered = filtered.filter(t => t.amount >= filters.amountMin!);
        }
        if (filters.amountMax !== null) {
          filtered = filtered.filter(t => t.amount <= filters.amountMax!);
        }
        if (filters.direction) {
          filtered = filtered.filter(t => t.direction === filters.direction);
        }
        if (filters.category) {
          filtered = filtered.filter(t => t.category === filters.category);
        }
        if (filters.sourceStatement) {
          const stmt = statements.find(s => s.id === filters.sourceStatement);
          if (stmt) {
            filtered = filtered.filter(t => t.statement_id === stmt.id);
          }
        }
        if (filters.search) {
          const q = filters.search.toLowerCase();
          filtered = filtered.filter(t =>
            t.description_raw.toLowerCase().includes(q) ||
            t.description_clean.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
          );
        }
        if (filters.onlyTransfersTo0488) {
          const transfers = getTransfersTo0488(filtered, matchingRules);
          filtered = transfers;
        }
        if (filters.onlyACHTo0478) {
          const ach = getACHTo0478(filtered, matchingRules);
          filtered = ach;
        }

        // Sort by date descending
        filtered.sort((a, b) => b.date.localeCompare(a.date));

        return filtered;
      },

      getDashboardStats: () => {
        const { transactions, activeProjectId, projects, matchingRules, filters } = get();

        const project = projects.find(p => p.id === activeProjectId);
        const projectStmtIds = project?.statement_ids || [];

        let projectTxns = transactions.filter(t => projectStmtIds.includes(t.statement_id));

        // Apply date filter to dashboard stats
        if (filters.dateRange) {
          projectTxns = projectTxns.filter(t =>
            t.date >= filters.dateRange!.start && t.date <= filters.dateRange!.end
          );
        }

        const totalIn = projectTxns
          .filter(t => t.direction === 'IN')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalOut = projectTxns
          .filter(t => t.direction === 'OUT')
          .reduce((sum, t) => sum + t.amount, 0);

        const transfers0488 = getTransfersTo0488(projectTxns, matchingRules);
        const ach0478 = getACHTo0478(projectTxns, matchingRules);

        return {
          totalIn,
          totalOut,
          transfersTo0488: {
            total: transfers0488.reduce((sum, t) => sum + t.amount, 0),
            count: transfers0488.length,
            transactions: transfers0488,
          },
          achTo0478: {
            total: ach0478.reduce((sum, t) => sum + t.amount, 0),
            count: ach0478.length,
            transactions: ach0478,
          },
        };
      },

      getCategorySummary: () => {
        const txns = get().getFilteredTransactions().filter(t => t.direction === 'OUT');
        const totalSpend = txns.reduce((sum, t) => sum + t.amount, 0);

        const categoryMap = new Map<string, { total: number; count: number }>();
        for (const t of txns) {
          const existing = categoryMap.get(t.category) || { total: 0, count: 0 };
          categoryMap.set(t.category, {
            total: existing.total + t.amount,
            count: existing.count + 1,
          });
        }

        return Array.from(categoryMap.entries())
          .map(([category, data]) => ({
            category,
            total: data.total,
            count: data.count,
            percentage: totalSpend > 0 ? (data.total / totalSpend) * 100 : 0,
          }))
          .sort((a, b) => b.total - a.total);
      },

      getTopMerchants: () => {
        const txns = get().getFilteredTransactions().filter(t => t.direction === 'OUT');

        const merchantMap = new Map<string, { total: number; count: number }>();
        for (const t of txns) {
          const key = t.description_clean;
          const existing = merchantMap.get(key) || { total: 0, count: 0 };
          merchantMap.set(key, {
            total: existing.total + t.amount,
            count: existing.count + 1,
          });
        }

        return Array.from(merchantMap.entries())
          .map(([merchant, data]) => ({
            merchant,
            total: data.total,
            count: data.count,
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 15);
      },

      getMonthlyTrends: () => {
        const txns = get().getFilteredTransactions();

        const monthMap = new Map<string, { totalIn: number; totalOut: number }>();
        for (const t of txns) {
          const month = t.date.substring(0, 7); // YYYY-MM
          const existing = monthMap.get(month) || { totalIn: 0, totalOut: 0 };
          if (t.direction === 'IN') {
            existing.totalIn += t.amount;
          } else {
            existing.totalOut += t.amount;
          }
          monthMap.set(month, existing);
        }

        return Array.from(monthMap.entries())
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => a.month.localeCompare(b.month));
      },

      getActiveProjectStatements: () => {
        const { statements, activeProjectId, projects } = get();
        const project = projects.find(p => p.id === activeProjectId);
        if (!project) return [];
        return statements.filter(s => project.statement_ids.includes(s.id) && s.doc_type === 'statement');
      },

      getDocuments: () => {
        const { statements, activeProjectId, projects } = get();
        const project = projects.find(p => p.id === activeProjectId);
        if (!project) return [];
        return statements.filter(s => project.statement_ids.includes(s.id) && s.doc_type === 'form');
      },
    }),
    {
      name: 'analyzer-storage',
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        statements: state.statements,
        transactions: state.transactions,
        matchingRules: state.matchingRules,
      }),
    }
  )
);
