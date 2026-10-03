import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'critical' | 'warning' | 'info' | 'success' | 'primary' | 'muted' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'muted',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    critical: 'bg-critical/15 text-critical border border-critical/30 shadow-glow-critical',
    warning: 'bg-warning/15 text-warning border border-warning/30',
    info: 'bg-info/15 text-info border border-info/30',
    success: 'bg-success/15 text-success border border-success/30',
    primary: 'bg-primary/15 text-primary border border-primary/30 shadow-glow-primary',
    muted: 'bg-surface text-muted border border-white/10',
    outline: 'bg-transparent text-white border border-white/20',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 font-bold tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full uppercase transition-all duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: string; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ category, size = 'sm', className }) => {
  const cat = category.toUpperCase();
  let variant: 'critical' | 'warning' | 'info' | 'success' | 'primary' | 'muted' = 'muted';

  if (['EMERGENCY', 'EXAMINATION'].includes(cat)) variant = 'critical';
  else if (['REGISTRATION', 'FEES', 'ATTENDANCE'].includes(cat)) variant = 'warning';
  else if (['PLACEMENT', 'INTERNSHIP', 'SCHOLARSHIP'].includes(cat)) variant = 'primary';
  else if (['RESULT', 'ADMISSION', 'ACADEMIC'].includes(cat)) variant = 'info';
  else if (['WORKSHOP', 'EVENT'].includes(cat)) variant = 'success';

  return <Badge variant={variant} size={size} className={className}>{cat}</Badge>;
};

export const LevelBadge: React.FC<{ level: string; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ level, size = 'sm', className }) => {
  const lvl = level.toUpperCase();
  let variant: 'critical' | 'warning' | 'info' | 'muted' = 'muted';

  if (lvl === 'CRITICAL') variant = 'critical';
  else if (lvl === 'HIGH') variant = 'warning';
  else if (lvl === 'MEDIUM') variant = 'info';
  else variant = 'muted';

  return (
    <Badge variant={variant} size={size} className={className}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        lvl === 'CRITICAL' ? 'bg-critical animate-pulse' :
        lvl === 'HIGH' ? 'bg-warning' :
        lvl === 'MEDIUM' ? 'bg-info' : 'bg-muted'
      }`} />
      {lvl}
    </Badge>
  );
};
