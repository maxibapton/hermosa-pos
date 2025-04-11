import React, { useState } from 'react';
import { Product, Category } from '../types';
import { Search, Package, Edit2, Plus, Minus, Filter } from 'lucide-react';

interface StockManagementProps {
  products: Product[];
  categories: Category[];
  onUpdateProduct: (id: string, product: Product) => void;
}

export function StockManagement({ products, categories, onUpdateProduct }: StockManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showOutOfStock, setShowOutOfStock] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesLowStock = !showLowStock || product.stockQuantity < 10;
    const matchesOutOfStock = !showOutOfStock || product.stockQuantity === 0;
    return matchesSearch && matchesCategory && matchesLowStock && matchesOutOfStock;
  });

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stockQuantity < 10).length;
  const outOfStockCount = products.filter(p => p.stockQuantity === 0).length;
  const totalStockValue = products.reduce((sum, product) => {
    return sum + (product.price || 0) * product.stockQuantity;
  }, 0);

  const handleStockAdjustment = (product: Product, amount: number) => {
    const newQuantity = Math.max(0, product.stockQuantity + amount);
    onUpdateProduct(product.id, { ...product, stockQuantity: newQuantity });
  };

  return (
    <div className="space-y-6">
      {/* Stock Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Produits</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Stock Faible</h3>
          <p className="text-3xl font-bold text-orange-500 mt-2">{lowStockCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Rupture de Stock</h3>
          <p className="text-3xl font-bold text-red-500 mt-2">{outOfStockCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Valeur du Stock</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{totalStockValue.toFixed(2)} €</p>
        </div>
      </div>

      {/* Stock Management */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Stocks</h2>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher des produits..."
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
                  <option value="all">Toutes les Catégories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>Afficher Stock Faible</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOutOfStock}
                onChange={(e) => setShowOutOfStock(e.target.checked)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>Afficher Ruptures</span>
            </label>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <Package size={16} />
                      <span>Produit</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">Catégorie</th>
                  <th className="px-4 py-3 text-center">Bondues</th>
                  <th className="px-4 py-3 text-center">Comines</th>
                  <th className="px-4 py-3 text-center">Liévin</th>
                  <th className="px-4 py-3 text-right">Stock Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const category = categories.find(c => c.id === product.category);
                  const isLowStock = product.stockQuantity < 10;
                  const isOutOfStock = product.stockQuantity === 0;

                  return (
                    <tr key={product.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {product.price ? `${product.price.toFixed(2)} €` : 'Prix Variable'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{category?.name}</span>
                          {category?.isBulk && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              Vrac
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleStockAdjustment(product, -1)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                          >
                            <Minus size={16} />
                          </button>
                          <span className={`font-medium ${
                            isOutOfStock ? 'text-red-600' :
                            isLowStock ? 'text-orange-500' :
                            'text-green-600'
                          }`}>
                            {product.stockQuantity}
                          </span>
                          <button
                            onClick={() => handleStockAdjustment(product, 1)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleStockAdjustment(product, -1)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                          >
                            <Minus size={16} />
                          </button>
                          <span className={`font-medium ${
                            isOutOfStock ? 'text-red-600' :
                            isLowStock ? 'text-orange-500' :
                            'text-green-600'
                          }`}>
                            {product.stockQuantity}
                          </span>
                          <button
                            onClick={() => handleStockAdjustment(product, 1)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleStockAdjustment(product, -1)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                          >
                            <Minus size={16} />
                          </button>
                          <span className={`font-medium ${
                            isOutOfStock ? 'text-red-600' :
                            isLowStock ? 'text-orange-500' :
                            'text-green-600'
                          }`}>
                            {product.stockQuantity}
                          </span>
                          <button
                            onClick={() => handleStockAdjustment(product, 1)}
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-medium">
                          {product.stockQuantity} {category?.isBulk && category.defaultUnit}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">Aucun produit trouvé</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}