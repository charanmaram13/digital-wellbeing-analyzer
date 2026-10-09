import React from 'react';

export function Card({ children, className = '', glow = false, ...props }) {
  return (
    <div
      className={`glass-panel p-5 sm:p-6 transition-all duration-200 ${
        glow ? 'glow-card' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`flex items-center justify-between mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return <p className={`text-xs sm:text-sm text-slate-400 mt-1 ${className}`}>{children}</p>;
}

export default Card;
