import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', headerAction }) => {
  return (
    <div className={`bg-app-surface border border-app-border rounded-lg overflow-hidden flex flex-col shadow-sm ${className}`}>
      {title && (
        <div className="px-5 py-4 border-b border-app-border flex justify-between items-center bg-app-bg/30">
          <h3 className="text-sm font-medium text-app-primary uppercase tracking-wider">{title}</h3>
          {headerAction}
        </div>
      )}
      <div className="p-5 flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};