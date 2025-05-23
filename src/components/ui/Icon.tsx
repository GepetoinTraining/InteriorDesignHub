import React from 'react';

interface IconProps {
  iconName: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  ariaHidden?: boolean;
  role?: string;
  ariaLabel?: string;
}

const Icon: React.FC<IconProps> = ({
  iconName,
  className = '',
  style,
  onClick,
  ariaHidden = true,
  role = 'img',
  ariaLabel
}) => {
  // Using Material Icons Outlined by default.
  // Ensure you have "Material Icons Outlined" font linked in your HTML.
  // <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
  return (
    <span
      className={`material-icons-outlined ${className}`}
      style={style}
      onClick={onClick}
      aria-hidden={ariaLabel ? undefined : ariaHidden} // Only set aria-hidden if no aria-label
      role={role}
      aria-label={ariaLabel}
    >
      {iconName}
    </span>
  );
};

export default Icon;
