
import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
}
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  containerClassName?: string;
  rows?: number;
}


export const TextInput: React.FC<TextInputProps> = ({ label, id, containerClassName, className, ...props }) => {
  return (
    <div className={containerClassName}>
      {label && <label htmlFor={id || props.name} className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{label}</label>}
      <input
        id={id || props.name}
        className={`w-full p-2.5 border border-[var(--border-color)] rounded-md bg-[var(--bg-card-secondary)] text-[var(--text-primary)] focus:ring-[var(--border-focus-color)] focus:border-[var(--border-focus-color)] transition-colors placeholder-[var(--placeholder-color)] placeholder-opacity-70 ${className || ''}`}
        {...props}
      />
    </div>
  );
};

export const TextAreaInput: React.FC<TextAreaProps> = ({ label, id, containerClassName, className, rows = 3, ...props }) => {
  return (
    <div className={containerClassName}>
      {label && <label htmlFor={id || props.name} className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{label}</label>}
      <textarea
        id={id || props.name}
        rows={rows}
        className={`w-full p-2.5 border border-[var(--border-color)] rounded-md bg-[var(--bg-card-secondary)] text-[var(--text-primary)] focus:ring-[var(--border-focus-color)] focus:border-[var(--border-focus-color)] transition-colors placeholder-[var(--placeholder-color)] placeholder-opacity-70 ${className || ''}`}
        {...props}
      />
    </div>
  );
};
