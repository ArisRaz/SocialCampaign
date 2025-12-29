import React from 'react';

interface OptionSelectorProps<T extends string> {
  label: string;
  options: T[];
  value: T | T[];
  onChange: (value: any) => void;
  icon?: React.ReactNode;
  multiSelect?: boolean;
}

const OptionSelector = <T extends string>({
  label,
  options,
  value,
  onChange,
  icon,
  multiSelect = false
}: OptionSelectorProps<T>) => {

  const handleSelect = (option: T) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(option)) {
        onChange(currentValues.filter(v => v !== option));
      } else {
        onChange([...currentValues, option]);
      }
    } else {
      onChange(option);
    }
  };

  const isSelected = (option: T) => {
    if (multiSelect && Array.isArray(value)) {
      return value.includes(option);
    }
    return value === option;
  };

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4 text-apple-secondaryLabel font-bold text-[12px] uppercase tracking-widest ml-1">
        {icon}
        {label}
      </div>
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => {
          const active = isSelected(option);
          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`
                px-5 py-2.5 rounded-full text-[14px] font-semibold transition-all duration-300 apple-transition border
                ${active
                  ? 'bg-apple-blue text-white border-apple-blue shadow-lg shadow-apple-blue/20'
                  : 'bg-white text-[#636366] border-[#E5E5EA] hover:border-[#D1D1D6] hover:bg-[#F9F9F9]'
                }
              `}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OptionSelector;