import React, { useState } from 'react';
import { X, Search, Plus, UserPlus } from 'lucide-react';
import { Customer, CustomerFormData } from '../types';

interface CustomerSelectionModalProps {
  customers: Customer[];
  onClose: () => void;
  onSelect: (customerId?: string) => void;
  onAddCustomer: (customer: CustomerFormData) => void;
}

export function CustomerSelectionModal({
  customers,
  onClose,
  onSelect,
  onAddCustomer,
}: CustomerSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCustomer(formData);
    setShowNewCustomerForm(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Customer</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button
            onClick={() => setShowNewCustomerForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <UserPlus size={18} />
            New Customer
          </button>
        </div>

        {showNewCustomerForm ? (
          <form onSubmit={handleSubmit} className="mb-6 bg-slate-50 p-4 rounded-lg">
            <h4 className="font-medium mb-4">New Customer</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus size={18} />
                Add & Select
              </button>
              <button
                type="button"
                onClick={() => setShowNewCustomerForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-4">
              <button
                onClick={() => onSelect(undefined)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 flex items-center gap-3"
              >
                Continue without customer
              </button>
            </div>

            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => onSelect(customer.id)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50"
                >
                  <div className="font-medium">
                    {customer.firstName} {customer.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {customer.email}
                    {customer.phone && ` • ${customer.phone}`}
                  </div>
                  {customer.address && (
                    <div className="text-sm text-gray-500">{customer.address}</div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}