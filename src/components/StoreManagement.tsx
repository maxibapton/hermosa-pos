import React, { useState } from 'react';
import { Store } from '../types';
import { Plus, Edit2, Trash2, Building2, Mail, Phone, Receipt, Calendar, MapPin } from 'lucide-react';

interface StoreManagementProps {
  stores: Store[];
  selectedStore: Store | null;
  onAddStore: (store: Omit<Store, 'id' | 'createdAt'>) => void;
  onUpdateStore: (id: string, store: Omit<Store, 'id' | 'createdAt'>) => void;
  onDeleteStore: (id: string) => void;
  onSelectStore: (store: Store) => void;
}

export function StoreManagement({
  stores,
  selectedStore,
  onAddStore,
  onUpdateStore,
  onDeleteStore,
  onSelectStore,
}: StoreManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    vatNumber: '',
    currency: 'EUR',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStore) {
      onUpdateStore(editingStore.id, formData);
    } else {
      onAddStore(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setEditingStore(null);
    setShowForm(false);
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      vatNumber: '',
      currency: 'EUR',
    });
  };

  const startEdit = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      address: store.address,
      phone: store.phone || '',
      email: store.email || '',
      vatNumber: store.vatNumber || '',
      currency: store.currency,
    });
    setShowForm(true);
  };

  // Calculate store metrics
  const totalStores = stores.length;
  const activeStores = stores.length; // In a real app, this would be based on actual activity
  const totalRevenue = 0; // In a real app, this would be calculated from sales data

  return (
    <div className="space-y-6">
      {/* Store Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">Total Stores</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{totalStores}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">Active Today</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{activeStores}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">Total Revenue</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">Store Management</h2>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {showForm ? (
                <span className="flex items-center gap-2">
                  <Building2 size={20} />
                  View Stores
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus size={20} />
                  Add Store
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VAT Number
                  </label>
                  <input
                    type="text"
                    value={formData.vatNumber}
                    onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="EUR">EUR - Euro</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  {editingStore ? 'Update Store' : 'Add Store'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                    selectedStore?.id === store.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(store)}
                          className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit store"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this store?')) {
                              onDeleteStore(store.id);
                            }
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete store"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={16} />
                        <span>{store.address}</span>
                      </div>
                      {store.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={16} />
                          <span>{store.phone}</span>
                        </div>
                      )}
                      {store.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={16} />
                          <span>{store.email}</span>
                        </div>
                      )}
                      {store.vatNumber && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Receipt size={16} />
                          <span>VAT: {store.vatNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} />
                        <span>Created: {new Date(store.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectStore(store)}
                      className={`mt-4 w-full px-4 py-2 rounded-lg transition-colors ${
                        selectedStore?.id === store.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedStore?.id === store.id ? 'Selected' : 'Select Store'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}