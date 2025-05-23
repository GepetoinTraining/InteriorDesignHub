

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'outlined'; 
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  fullWidth = false,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseStyle = "flex items-center justify-center rounded-lg h-11 px-4 text-sm font-semibold tracking-wide transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  let variantStyle = '';
  switch (variant) {
    case 'primary':
      // Uses CSS variables for theming
      variantStyle = 'bg-[var(--color-primary)] text-[var(--button-text-color)] hover:bg-[var(--color-primary-dark)] focus:ring-[var(--color-primary-light)] border border-[var(--color-primary)] hover:border-[var(--color-primary-dark)]';
      break;
    case 'secondary':
      variantStyle = 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400';
      break;
    case 'outlined':
      variantStyle = 'bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary-dark)] focus:ring-[var(--color-primary)]';
      break;
    default:
      variantStyle = 'bg-[var(--color-primary)] text-[var(--button-text-color)] hover:bg-[var(--color-primary-dark)] focus:ring-[var(--color-primary-light)] border border-[var(--color-primary)] hover:border-[var(--color-primary-dark)]';
  }

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${fullWidth ? 'w-full' : ''} ${
        isLoading || props.disabled ? 'opacity-70 cursor-not-allowed' : ''
      } ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
