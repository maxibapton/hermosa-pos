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
    <div className="flex flex-wrap gap-2 p-4">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-full ${
          selectedCategory === null
            ? 'bg-primary text-[#F7F4DF]'
            : 'bg-accent/80 text-[#F7F4DF] hover:bg-accent'
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`px-4 py-2 rounded-full ${
            selectedCategory === category.id
              ? 'bg-primary text-[#F7F4DF]'
              : 'bg-accent/80 text-[#F7F4DF] hover:bg-accent'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}