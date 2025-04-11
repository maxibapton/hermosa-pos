import React, { useState } from 'react';
import { Customer, CustomerFormData } from '../types';
import { Plus, Edit2, Trash2, Search, Users, Mail, Phone, MapPin, FileText, Calendar, ShoppingBag, ArrowUpDown } from 'lucide-react';
import { CustomerDataExportImport } from './CustomerDataExportImport';

const translations = {
  title: "Gestion des Clients",
  addCustomer: "Ajouter un Client",
  viewCustomers: "Voir les Clients",
  editCustomer: "Modifier le Client",
  firstName: "Prénom",
  lastName: "Nom",
  email: "Email",
  phone: "Téléphone",
  address: "Adresse",
  notes: "Notes",
  update: "Mettre à jour",
  cancel: "Annuler",
  confirmDelete: "Êtes-vous sûr de vouloir supprimer ce client ?",
  searchCustomers: "Rechercher des clients...",
  noCustomers: "Aucun client trouvé",
  totalCustomers: "Total Clients",
  activeCustomers: "Clients Actifs",
  newThisMonth: "Nouveaux ce Mois",
  returningCustomers: "Clients Fidèles",
  exportCsv: "Exporter CSV",
  importCsv: "Importer CSV"
};

interface CustomerManagementProps {
  customers: Customer[];
  onAddCustomer: (customer: CustomerFormData) => void;
  onUpdateCustomer: (id: string, customer: CustomerFormData) => void;
  onDeleteCustomer: (id: string) => void;
  onImportCustomers: (customers: Customer[]) => void;
}

export function CustomerManagement({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onImportCustomers,
}: CustomerManagementProps) {
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'email' | 'purchases' | 'lastPurchase'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      onUpdateCustomer(editingCustomer.id, formData);
    } else {
      onAddCustomer(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setEditingCustomer(null);
    setShowForm(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    });
  };

  const startEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
      notes: customer.notes || '',
    });
    setShowForm(true);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedCustomers = customers
    .filter(
      (customer) =>
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm))
    )
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'name':
          return direction * (`${a.firstName} ${a.lastName}`).localeCompare(`${b.firstName} ${b.lastName}`);
        case 'email':
          return direction * a.email.localeCompare(b.email);
        case 'purchases':
          return direction * (a.totalPurchases - b.totalPurchases);
        case 'lastPurchase':
          if (!a.lastPurchase) return 1;
          if (!b.lastPurchase) return -1;
          return direction * (new Date(a.lastPurchase).getTime() - new Date(b.lastPurchase).getTime());
        default:
          return 0;
      }
    });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.totalPurchases > 0).length;
  const newCustomers = customers.filter(c => 
    c.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;
  const returningCustomers = customers.filter(c => c.totalPurchases > 1).length;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">{translations.totalCustomers}</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{totalCustomers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">{translations.activeCustomers}</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{activeCustomers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">{translations.newThisMonth}</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{newCustomers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">{translations.returningCustomers}</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{returningCustomers}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{translations.title}</h2>
            </div>
            <div className="flex gap-4">
              <CustomerDataExportImport 
                customers={customers}
                onImport={onImportCustomers}
              />
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {showForm ? (
                  <span className="flex items-center gap-2">
                    <Users size={20} />
                    {translations.viewCustomers}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus size={20} />
                    {translations.addCustomer}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingCustomer ? translations.editCustomer : translations.addCustomer}
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.firstName} *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.lastName} *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.email} *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.phone}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.address}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Street address, city, state, zip"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.notes}
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Additional information about the customer..."
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                {editingCustomer ? translations.update : translations.addCustomer}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {translations.cancel}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={translations.searchCustomers}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Customers Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th 
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>Customer</span>
                        {sortField === 'name' && (
                          <ArrowUpDown size={16} className={sortDirection === 'desc' ? 'transform rotate-180' : ''} />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        <span>Contact</span>
                        {sortField === 'email' && (
                          <ArrowUpDown size={16} className={sortDirection === 'desc' ? 'transform rotate-180' : ''} />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('purchases')}
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={16} />
                        <span>Purchases</span>
                        {sortField === 'purchases' && (
                          <ArrowUpDown size={16} className={sortDirection === 'desc' ? 'transform rotate-180' : ''} />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('lastPurchase')}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Last Purchase</span>
                        {sortField === 'lastPurchase' && (
                          <ArrowUpDown size={16} className={sortDirection === 'desc' ? 'transform rotate-180' : ''} />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedCustomers.map((customer) => (
                    <tr key={customer.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </div>
                          {customer.address && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin size={14} />
                              {customer.address}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="flex items-center gap-1">
                            <Mail size={14} className="text-gray-400" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone size={14} />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{customer.totalPurchases}</span>
                          {customer.totalPurchases > 5 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              Loyal Customer
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {customer.lastPurchase ? (
                          <div>
                            <div>{new Date(customer.lastPurchase).toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(customer.lastPurchase).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">No purchases yet</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(customer)}
                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title={translations.editCustomer}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(translations.confirmDelete)) {
                                onDeleteCustomer(customer.id);
                              }
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Customer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAndSortedCustomers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">{translations.noCustomers}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}