/**
 * TransactionItem - Premium Transaction List Item
 * Beautiful transaction item with icon, amount, and status
 */

import React from 'react';

export function TransactionItem({
  icon: Icon,
  title,
  description,
  amount,
  currency,
  date,
  status,
  onClick,
}) {
  const statusColors = {
    completed: 'text-green-600 dark:text-green-400',
    pending: 'text-amber-600 dark:text-amber-400',
    failed: 'text-red-600 dark:text-red-400',
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 hover:shadow-lg-glass transition-all duration-300 hover:translate-y-[-1px]"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {Icon && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
              <Icon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 dark:text-white truncate">
              {title}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <p className={`font-bold ${statusColors[status] || 'text-slate-900 dark:text-white'}`}>
            {amount} {currency}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {date}
          </p>
        </div>
      </div>
    </button>
  );
}
