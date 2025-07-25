
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  const baseStyles = "font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-150 ease-in-out inline-flex items-center justify-center";
  
  // Note: focus ring color might need to be a CSS var if indigo-500/slate-500 doesn't work for both themes
  // For now, using direct Tailwind colors for focus rings as they are often distinct.
  const variantStyles = {
    primary: "bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-hover-bg)] text-[var(--button-primary-text)] focus:ring-indigo-500",
    secondary: "bg-[var(--button-secondary-bg)] hover:bg-[var(--button-secondary-hover-bg)] text-[var(--button-secondary-text)] focus:ring-slate-500",
    danger: "bg-[var(--danger-bg)] hover:bg-[var(--danger-bg)]/[0.9] text-[var(--danger-text)] focus:ring-red-500",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const loadingStyles = isLoading ? "opacity-75 cursor-not-allowed" : "";
  const currentVariantStyle = variantStyles[variant] || variantStyles.primary;

  // For loading spinner color, it should contrast with the button background.
  // Primary/Danger buttons usually have light text, so spinner should be light.
  // Secondary button text color is theme-dependent, so spinner needs to adapt or be fixed.
  // Let's make spinner on primary/danger white, and on secondary use text color.
  let spinnerColorClass = "text-white"; // Default for primary/danger
  if (variant === 'secondary') {
    // This is tricky as --button-secondary-text changes. A fixed contrasting color might be better.
    // Or, we assume the spinner SVG itself will be visible enough or use a specific variable for spinner on secondary.
    // For simplicity, let's keep it white, assuming secondary buttons won't be pure white.
    // If secondary buttons can be very light, spinner needs to be dark.
    // Using current text color for spinner might be okay with CSS var.
    // spinnerColorClass = "text-[var(--button-secondary-text)]"; // This won't work directly on svg stroke/fill
  }


  return (
    <button
      className={`${baseStyles} ${currentVariantStyle} ${sizeStyles[size]} ${loadingStyles} ${className || ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg 
            className={`animate-spin -ml-1 mr-3 h-5 w-5 ${spinnerColorClass}`}
            // style={{ color: variant === 'secondary' ? 'var(--button-secondary-text)' : 'white' }} // Alt way for secondary
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
