/**
 * BalanceCard - Interactive Balance Display with Visibility Toggle
 * Beautiful balance card with show/hide functionality
 */

import React from 'react';

export function BalanceCard({ label, balance, currency = 'USD', isVisible = true }) {
  const [showBalance, setShowBalance] = React.useState(isVisible);

  return (
    <div className="rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 p-6 border border-orange-200/50 dark:border-orange-700/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          {label}
        </h3>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          {showBalance ? '👁️' : '🙈'}
        </button>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
          {showBalance ? balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '•••••'}
        </span>
        <span className="pb-2 text-lg font-semibold text-slate-600 dark:text-slate-400">
          {currency}
        </span>
      </div>
    </div>
  );
}
