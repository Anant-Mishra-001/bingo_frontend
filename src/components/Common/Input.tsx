import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2 w-full text-left">
      {label && (
        <label htmlFor={id} className="text-xs uppercase tracking-wider font-bold text-slate-400">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`px-4 py-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[var(--text-primary)] placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 focus:shadow-[0_0_12px_rgba(99,102,241,0.2)] transition-all duration-300 ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
