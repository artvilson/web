import type { MatchingRule, Transaction } from './types';

export function matchesRule(transaction: Transaction, rule: MatchingRule): boolean {
  if (!rule.enabled) return false;

  // Channel filter check
  if (rule.channel_filter && transaction.channel !== rule.channel_filter) {
    return false;
  }

  const desc = transaction.description_raw.toUpperCase();

  switch (rule.match_type) {
    case 'contains':
      return rule.patterns.some(pattern => desc.includes(pattern.toUpperCase()));

    case 'regex':
      return rule.patterns.some(pattern => {
        try {
          return new RegExp(pattern, 'i').test(transaction.description_raw);
        } catch {
          return false;
        }
      });

    case 'merchant':
      return rule.patterns.some(pattern =>
        transaction.description_clean.toUpperCase().includes(pattern.toUpperCase())
      );

    default:
      return false;
  }
}

export function getMatchingTransactions(
  transactions: Transaction[],
  rule: MatchingRule
): Transaction[] {
  return transactions.filter(t => matchesRule(t, rule));
}

export function getTransfersTo0488(
  transactions: Transaction[],
  rules: MatchingRule[]
): Transaction[] {
  const rule = rules.find(r => r.rule_id === 'cap-one-0488');
  if (!rule) return [];
  return transactions.filter(t => t.direction === 'OUT' && matchesRule(t, rule));
}

export function getACHTo0478(
  transactions: Transaction[],
  rules: MatchingRule[]
): Transaction[] {
  const rule = rules.find(r => r.rule_id === 'ach-0478');
  if (!rule) return [];
  return transactions.filter(t => t.direction === 'OUT' && matchesRule(t, rule));
}
