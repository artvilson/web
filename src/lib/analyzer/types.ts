export type TransactionDirection = 'IN' | 'OUT';
export type TransactionChannel = 'ACH' | 'CARD' | 'WIRE' | 'ZELLE' | 'VENMO' | 'CHECK' | 'CASH' | 'OTHER';

export interface Transaction {
  id: string;
  account_id: string;
  statement_id: string;
  date: string; // ISO date string
  description_raw: string;
  description_clean: string;
  amount: number; // always positive
  direction: TransactionDirection;
  category: string;
  channel: TransactionChannel;
  tags: string[];
}

export interface Statement {
  id: string;
  bank: 'Chase' | 'CapitalOne' | 'Other';
  account_hint: string;
  period_start: string;
  period_end: string;
  uploaded_filename: string;
  parsed_at: string;
  parse_confidence: number;
  transaction_count: number;
  total_in: number;
  total_out: number;
  warnings: string[];
  doc_type: 'statement' | 'form';
  form_type?: string; // e.g., '1095-A', '1095-B'
  form_year?: string;
  form_fields?: Record<string, string>;
  raw_text?: string;
}

export interface MatchingRule {
  rule_id: string;
  name: string;
  match_type: 'contains' | 'regex' | 'merchant';
  patterns: string[];
  channel_filter?: TransactionChannel;
  enabled: boolean;
}

export interface Project {
  id: string;
  name: string;
  created_at: string;
  statement_ids: string[];
}

export interface DashboardFilters {
  dateRange: { start: string; end: string } | null;
  amountMin: number | null;
  amountMax: number | null;
  direction: TransactionDirection | null;
  category: string | null;
  search: string;
  sourceStatement: string | null;
  onlyTransfersTo0488: boolean;
  onlyACHTo0478: boolean;
}

export interface CategorySummary {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MerchantSummary {
  merchant: string;
  total: number;
  count: number;
}

export interface MonthlyTrend {
  month: string; // YYYY-MM
  totalIn: number;
  totalOut: number;
}

export const DEFAULT_FILTERS: DashboardFilters = {
  dateRange: null,
  amountMin: null,
  amountMax: null,
  direction: null,
  category: null,
  search: '',
  sourceStatement: null,
  onlyTransfersTo0488: false,
  onlyACHTo0478: false,
};

export const DEFAULT_MATCHING_RULES: MatchingRule[] = [
  {
    rule_id: 'cap-one-0488',
    name: 'Capital One 0488 Transfers',
    match_type: 'contains',
    patterns: ['0488', 'CAPITAL ONE', 'CAP ONE'],
    enabled: true,
  },
  {
    rule_id: 'ach-0478',
    name: 'ACH to 0478',
    match_type: 'contains',
    patterns: ['0478'],
    channel_filter: 'ACH',
    enabled: true,
  },
];
