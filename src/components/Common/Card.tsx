import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-2xl transition-all duration-300 relative ${
        hoverEffect ? 'hover:border-indigo-500/30 hover:shadow-indigo-500/10 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
