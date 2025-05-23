import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // You can add any custom props here if needed
}

const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={`block w-full rounded-lg border border-slate-300 bg-slate-50 h-12 px-4 text-sm text-slate-900 placeholder-slate-400 
                 focus:outline-none focus:border-[#0b80ee] focus:ring-2 focus:ring-[#0b80ee]/20
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors duration-200 ${className}`}
      {...props}
    />
  );
};

export default Input;