import React from 'react';

export function Input({
  label,
  error,
  helperText,
  id,
  type = 'text',
  className = '',
  required = false,
  ...props
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
          error ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500/80'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-400">{helperText}</p>}
    </div>
  );
}

export function Select({
  label,
  error,
  helperText,
  id,
  options = [],
  className = '',
  required = false,
  ...props
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <select
        id={id}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${
          error ? 'border-rose-500/80 focus:border-rose-500' : 'border-slate-800 focus:border-emerald-500/80'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-400">{helperText}</p>}
    </div>
  );
}

export default Input;
