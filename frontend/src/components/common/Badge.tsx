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
    success: 'bg-success-light text-success-dark',
    danger: 'bg-danger-light text-danger-dark',
    warning: 'bg-warning-light text-warning-dark',
    info: 'bg-blue-100 text-blue-700',
    default: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
