
import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  containerClassName?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, options, id, containerClassName, className, ...props }) => {
  return (
    <div className={containerClassName}>
      {label && <label htmlFor={id || props.name} className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{label}</label>}
      <select
        id={id || props.name}
        className={`w-full p-2.5 border border-[var(--border-color)] rounded-md bg-[var(--bg-card-secondary)] text-[var(--text-primary)] focus:ring-[var(--border-focus-color)] focus:border-[var(--border-focus-color)] transition-colors ${className || ''}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
