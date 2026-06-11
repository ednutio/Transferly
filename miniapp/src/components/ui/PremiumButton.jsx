/**
 * PremiumButton - Enhanced Button Component with Variants
 * Flexible button with multiple variants (primary, secondary, outline, ghost)
 */

import React from 'react';

export function PremiumButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  onClick,
  disabled = false,
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-orange-500 hover:bg-orange-600 text-white',
    secondary: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white',
    outline: 'border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-full font-bold
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:shadow-md-glass active:scale-95
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {isLoading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {Icon && !isLoading && <Icon size={18} />}
      {children}
    </button>
  );
}
