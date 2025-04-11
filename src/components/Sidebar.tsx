import React from 'react';
import { ShoppingCart, Package, History, Users, Building2, Archive, Settings } from 'lucide-react';

interface SidebarProps {
  activeSection: 'register' | 'catalog' | 'sales' | 'customers' | 'stores' | 'stock' | 'settings';
  onSectionChange: (section: 'register' | 'catalog' | 'sales' | 'customers' | 'stores' | 'stock' | 'settings') => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <div className="bg-white w-64 min-h-screen shadow-lg flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg text-gray-700">Menu</h2>
      </div>
      <nav className="flex-1 p-2">
        <button
          onClick={() => onSectionChange('register')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
            activeSection === 'register'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ShoppingCart size={20} />
          <span>Caisse</span>
        </button>
        <button
          onClick={() => onSectionChange('catalog')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
            activeSection === 'catalog'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Package size={20} />
          <span>Catalogue</span>
        </button>
        <button
          onClick={() => onSectionChange('stock')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
            activeSection === 'stock'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Archive size={20} />
          <span>Stocks</span>
        </button>
        <button
          onClick={() => onSectionChange('customers')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
            activeSection === 'customers'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Users size={20} />
          <span>Clients</span>
        </button>
        <button
          onClick={() => onSectionChange('sales')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
            activeSection === 'sales'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <History size={20} />
          <span>Ventes</span>
        </button>
        <button
          onClick={() => onSectionChange('stores')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
            activeSection === 'stores'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Building2 size={20} />
          <span>Magasins</span>
        </button>
        <button
          onClick={() => onSectionChange('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
            activeSection === 'settings'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
}