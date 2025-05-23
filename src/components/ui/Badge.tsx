
import React from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';
type BadgeSize = 'standard' | 'small';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'primary', // Default variant
  size = 'standard',   // Default size
  children,
  className = '',
}) => {
  const baseClasses = 'badge';
  
  const variantClasses: Record<BadgeVariant, string> = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
  };

  const sizeClasses: Record<BadgeSize, string> = {
    standard: '', // Standard size doesn't need an extra class if base .badge styles are for standard
    small: 'badge-small',
  };

  const combinedClassName = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className, // Allow for additional custom classes
  ].filter(Boolean).join(' ');

  return (
    <span className={combinedClassName}>
      {children}
    </span>
  );
};

export default Badge;
