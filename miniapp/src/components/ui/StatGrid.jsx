/**
 * StatGrid - Responsive Stats Display Grid
 * Grid of statistics with icons, values, and optional trends
 */

import React from 'react';

export function StatGrid({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800 hover:shadow-lg-glass transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {stat.label}
              </span>
              {Icon && (
                <Icon className="w-5 h-5 text-orange-500 opacity-60" />
              )}
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                {stat.value}
              </span>
              {stat.suffix && (
                <span className="pb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {stat.suffix}
                </span>
              )}
            </div>
            {stat.trend && (
              <div className={`mt-3 text-xs font-bold ${stat.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend > 0 ? '↑' : '↓'} {Math.abs(stat.trend)}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
