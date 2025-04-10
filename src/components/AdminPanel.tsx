import React, { useState } from 'react';
import { Product, Category, ProductFormData } from '../types';
import { Plus, Edit2, Trash2, Package, Search, Filter, ArrowUpDown } from 'lucide-react';

const translations = {
  title: "Gestion des Produits",
  addProduct: "Ajouter un Produit",
  viewProducts: "Voir les Produits",
  editProduct: "Modifier le Produit",
  productName: "Nom du Produit",
  category: "Catégorie",
  price: "Prix",
  stockQuantity: "Quantité en Stock",
  vatRate: "Taux de TVA",
  bulk: "Vrac",
  update: "Mettre à jour",
  cancel: "Annuler",
  confirmDelete: "Êtes-vous sûr de vouloir supprimer ce produit ?",
  searchProducts: "Rechercher des produits...",
  noProducts: "Aucun produit trouvé",
  totalProducts: "Total Produits",
  lowStock: "Stock Faible",
  outOfStock: "Rupture de Stock",
  vatRates: {
    zero: "0% - Taux Zéro",
    reduced: "5.5% - Taux Réduit",
    standard: "20% - Taux Standard"
  }
};

interface AdminPanelProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (product: ProductFormData) => void;
  onUpdateProduct: (id: string, product: ProductFormData) => void;
  onDeleteProduct: (id: string) => void;
}

export function AdminPanel({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}: AdminPanelProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [sortField, setSortField] = useState<'name' | 'category' | 'price' | 'stock'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: null,
    category: categories[0]?.id || '',
    stockQuantity: 0,
    unitSize: '',
    vatRate: 20,
  });

  const selectedCategoryDetails = categories.find(c => c.id === formData.category);
  const isBulkCategory = selectedCategoryDetails?.isBulk ?? false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || formData.stockQuantity < 0) {
      alert('Please fill in all required fields');
      return;
    }

    if (!isBulkCategory && !formData.price) {
      alert('Price is required for non-bulk products');
      return;
    }

    const productData = {
      ...formData,
      price: isBulkCategory ? null : formData.price,
      unitSize: isBulkCategory ? selectedCategoryDetails?.defaultUnit : undefined,
    };

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, productData);
    } else {
      onAddProduct(productData);
    }
    resetForm();
  };

  const resetForm = () => {
    setEditingProduct(null);
    setShowForm(false);
    setFormData({
      name: '',
      price: null,
      category: categories[0]?.id || '',
      stockQuantity: 0,
      unitSize: '',
      vatRate: 20,
    });
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      stockQuantity: product.stockQuantity,
      unitSize: product.unitSize,
      vatRate: product.vatRate,
    });
    setShowForm(true);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedProducts = products
    .filter(product => 
      (selectedCategory === 'all' || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'category':
          const catA = categories.find(c => c.id === a.category)?.name || '';
          const catB = categories.find(c => c.id === b.category)?.name || '';
          return direction * catA.localeCompare(catB);
        case 'price':
          return direction * ((a.price || 0) - (b.price || 0));
        case 'stock':
          return direction * (a.stockQuantity - b.stockQuantity);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">{translations.totalProducts}</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">{translations.category}</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{categories.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">{translations.lowStock}</h3>
          <p className="text-3xl font-bold text-orange-500 mt-2">
            {products.filter(p => p.stockQuantity < 10).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">{translations.outOfStock}</h3>
          <p className="text-3xl font-bold text-red-500 mt-2">
            {products.filter(p => p.stockQuantity === 0).length}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md">
        {/* Toolbar */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{translations.title}</h2>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {showForm ? (
                <span className="flex items-center gap-2">
                  <Package size={20} />
                  {translations.viewProducts}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus size={20} />
                  {translations.addProduct}
                </span>
              )}
            </button>
          </div>
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingProduct ? translations.editProduct : translations.addProduct}
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.productName} *
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
                  {translations.category} *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} {category.isBulk ? `(${translations.bulk} - ${category.defaultUnit})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {!isBulkCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translations.price} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full pl-7 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.stockQuantity} *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  {isBulkCategory && (
                    <span className="text-gray-500">{selectedCategoryDetails?.defaultUnit}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.vatRate} *
                </label>
                <select
                  value={formData.vatRate}
                  onChange={(e) => setFormData({ ...formData, vatRate: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value={0}>{translations.vatRates.zero}</option>
                  <option value={5.5}>{translations.vatRates.reduced}</option>
                  <option value={20}>{translations.vatRates.standard}</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                {editingProduct ? translations.update : translations.addProduct}
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
            {/* Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={translations.searchProducts}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-2.5 text-gray-400" size={20} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-2">
                        <span>{translations.productName}</span>
                        {sortField === 'name' && (
                          <ArrowUpDown size={16} className={sortDirection === 'desc' ? 'transform rotate-180' : ''} />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('category')}>
                      <div className="flex items-center gap-2">
                        <span>{translations.category}</span>
                        {sortField === 'category' && (
                          <ArrowUpDown size={16} className={sortDirection === 'desc' ? 'transform rotate-180' : ''} />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('price')}>
                      <div className="flex items-center gap-2">
                        <span>{translations.price}</span>
                        {sortField === 'price' && (
                          <ArrowUpDown size={16} className={sortDirection === 'desc' ? 'transform rotate-180' : ''} />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left">{translations.vatRate}</th>
                    <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('stock')}>
                      <div className="flex items-center gap-2">
                        <span>{translations.stockQuantity}</span>
                        {sortField === 'stock' && (
                          <ArrowUpDown size={16} className={sortDirection === 'desc' ? 'transform rotate-180' : ''} />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedProducts.map((product) => {
                    const category = categories.find((c) => c.id === product.category);
                    const isLowStock = product.stockQuantity < 10;
                    const isOutOfStock = product.stockQuantity === 0;

                    return (
                      <tr key={product.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{product.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span>{category?.name}</span>
                            {category?.isBulk && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {translations.bulk}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {category?.isBulk ? (
                            <span className="text-gray-500">Variable</span>
                          ) : (
                            <span className="font-medium">${product.price?.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.vatRate === 0 ? 'bg-gray-100 text-gray-800' :
                            product.vatRate === 5.5 ? 'bg-blue-100 text-blue-800' :
                            'bg-indigo-100 text-indigo-800'
                          }`}>
                            {product.vatRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              isOutOfStock ? 'text-red-600' :
                              isLowStock ? 'text-orange-500' :
                              'text-green-600'
                            }`}>
                              {product.stockQuantity}
                            </span>
                            {category?.isBulk && (
                              <span className="text-gray-500">{category.defaultUnit}</span>
                            )}
                            {isOutOfStock && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {translations.outOfStock}
                              </span>
                            )}
                            {isLowStock && !isOutOfStock && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                {translations.lowStock}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(product)}
                              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title={translations.editProduct}
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(translations.confirmDelete)) {
                                  onDeleteProduct(product.id);
                                }
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredAndSortedProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">{translations.noProducts}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}