import React from 'react';
import { LayoutGrid, History, Tags } from 'lucide-react';

interface AdminNavProps {
  activeSection: 'products' | 'categories' | 'sales';
  onSectionChange: (section: 'products' | 'categories' | 'sales') => void;
}

export function AdminNav({ activeSection, onSectionChange }: AdminNavProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg mb-6">
      <div className="flex border-b">
        <button
          onClick={() => onSectionChange('products')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'products'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <LayoutGrid size={18} />
          Products
        </button>
        <button
          onClick={() => onSectionChange('categories')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'categories'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Tags size={18} />
          Categories
        </button>
        <button
          onClick={() => onSectionChange('sales')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'sales'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <History size={18} />
          Sales History
        </button>
      </div>
    </div>
  );
}