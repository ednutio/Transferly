/**
 * PremiumInput - Enhanced Form Input with Floating Label
 * Premium form input with icon support and smooth animations
 */

import React from 'react';

export function PremiumInput({
  type = 'text',
  label,
  value = '',
  onChange,
  error,
  helperText,
  icon: Icon,
  disabled = false,
  ...props
}) {
  const [focused, setFocused] = React.useState(false);

  return (
    <div className="relative">
      {label && (
        <label className={`
          absolute left-4 transition-all duration-200 pointer-events-none font-medium
          ${focused || value
            ? 'top-2 text-xs text-slate-500 dark:text-slate-400'
            : 'top-3.5 text-base text-slate-400 dark:text-slate-500'
          }
        `}>
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className={`
            absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5
            transition-colors duration-200
            ${focused ? 'text-orange-500' : 'text-slate-400'}
            ${disabled ? 'opacity-50' : ''}
          `} />
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className={`
            w-full ${label ? 'pt-6 pb-2' : 'py-3'} ${Icon ? 'pl-10' : 'px-4'} pr-4
            border-b-2 bg-transparent dark:bg-slate-900/30
            transition-all duration-200 outline-none font-medium
            border-slate-200 dark:border-slate-700
            focus:border-orange-500 dark:focus:border-orange-400
            placeholder-slate-400 dark:placeholder-slate-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 dark:border-red-400 focus:border-red-600' : ''}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-2 text-sm font-medium text-red-500 dark:text-red-400 animate-slide-up">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
