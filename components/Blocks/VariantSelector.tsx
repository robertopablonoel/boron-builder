'use client';

import { useState } from 'react';

interface VariantOption {
  label: string;
  value: string;
  priceDiff?: number;
  badge?: string;
}

interface VariantSelectorProps {
  label: string;
  options: VariantOption[];
  defaultValue?: string;
}

export function VariantSelector({
  label,
  options,
  defaultValue,
}: VariantSelectorProps) {
  const [selected, setSelected] = useState(defaultValue || options[0]?.value);

  return (
    <div className="py-6 px-6 max-w-2xl mx-auto">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label}
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setSelected(option.value)}
              className={`relative p-4 border-2 rounded-lg text-center transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{option.label}</div>
              {option.priceDiff !== undefined && option.priceDiff !== 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  {option.priceDiff > 0 ? '+' : ''}${option.priceDiff.toFixed(2)}
                </div>
              )}
              {option.badge && (
                <span className="absolute top-1 right-1 px-2 py-0.5 text-xs font-semibold bg-yellow-400 text-yellow-900 rounded">
                  {option.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
