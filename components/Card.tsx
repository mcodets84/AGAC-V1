import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  headerActions?: React.ReactNode; 
}

const Card: React.FC<CardProps> = ({ children, className, title, icon, headerActions }) => {
  return (
    <div className={`bg-[var(--bg-card)] p-4 sm:p-6 rounded-xl card-shadow ${className || ''}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {icon && <span className="mr-3 text-[var(--icon-color)]">{icon}</span>}
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
          </div>
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;