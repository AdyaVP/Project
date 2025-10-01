import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  extra?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconBg,
  title,
  value,
  trend,
  subtitle,
  extra,
}) => {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center text-2xl`}>
              {icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{title}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
          
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              <span className={trend.isPositive ? 'text-success' : 'text-danger'}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-gray-500">{subtitle || 'this month'}</span>
            </div>
          )}
        </div>
        
        {extra && <div>{extra}</div>}
      </div>
    </div>
  );
};
