/**
 * ConfirmationModal - Premium Modal Dialog with Animations
 * Beautiful confirmation modal with backdrop blur and smooth transitions
 */

import React from 'react';
import { X } from 'lucide-react';

export function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = false,
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-elevated animate-slide-up">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold transition-all hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              flex-1 px-4 py-3 rounded-full font-bold transition-all
              ${isDangerous
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
              inline-flex items-center justify-center gap-2
            `}
          >
            {isLoading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
