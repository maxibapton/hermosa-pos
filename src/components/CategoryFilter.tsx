import React from 'react';
import { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-4 p-4">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-6 py-2 rounded-full text-lg transition-colors ${
          selectedCategory === null
            ? 'bg-[#0013FF] text-white'
            : 'bg-white text-[#0013FF] hover:bg-gray-50'
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`px-6 py-2 rounded-full text-lg transition-colors ${
            selectedCategory === category.id
              ? 'bg-[#0013FF] text-white'
              : 'bg-white text-[#0013FF] hover:bg-gray-50'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}