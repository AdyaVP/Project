import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variantClasses = {
    success: 'bg-success-light dark:bg-success-dark/20 text-success-dark dark:text-success-light',
    danger: 'bg-danger-light dark:bg-danger-dark/20 text-danger-dark dark:text-danger-light',
    warning: 'bg-warning-light dark:bg-warning-dark/20 text-warning-dark dark:text-warning-light',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
