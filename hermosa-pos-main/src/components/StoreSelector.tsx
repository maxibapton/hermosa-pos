import React from 'react';
import { Store } from '../types';
import { Building2 } from 'lucide-react';

interface StoreSelectorProps {
  stores: Store[];
  selectedStore: Store;
  onSelectStore: (store: Store) => void;
}

export function StoreSelector({ stores, selectedStore, onSelectStore }: StoreSelectorProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-indigo-600" />
            <select
              value={selectedStore.id}
              onChange={(e) => {
                const store = stores.find(s => s.id === e.target.value);
                if (store) onSelectStore(store);
              }}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden md:block text-sm text-gray-500">
            {selectedStore.address} • {selectedStore.phone}
          </div>
        </div>
      </div>
    </div>
  );
}