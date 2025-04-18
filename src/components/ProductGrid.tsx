import React, { useState } from 'react';
import { Product, Category } from '../types';
import { ProductSelectionModal } from './ProductSelectionModal';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  onAddToCart: (product: Product, quantity: number, price: number) => void;
}

export function ProductGrid({ products, categories, onAddToCart }: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductClick = (product: Product) => {
    const category = categories.find(c => c.id === product.category);
    
    if (category?.isBulk) {
      setSelectedProduct(product);
    } else {
      onAddToCart(product, 1, product.price || 0);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {products.map((product) => {
          const category = categories.find(c => c.id === product.category);
          const isBulk = category?.isBulk ?? false;
          
          return (
            <div
              key={product.id}
              onClick={() => product.stockQuantity > 0 && handleProductClick(product)}
              className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
                product.stockQuantity > 0 ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
                    {isBulk && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {category?.defaultUnit}
                      </span>
                    )}
                  </div>
                  {!isBulk && (
                    <p className="text-gray-600 text-xl font-semibold">
                      {product.price?.toFixed(2)}€
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <Package size={16} />
                    <span>{product.stockQuantity} {isBulk ? category?.defaultUnit : 'unités'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedProduct && (
        <ProductSelectionModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={onAddToCart}
          isBulk={categories.find(c => c.id === selectedProduct.category)?.isBulk ?? false}
          defaultUnit={categories.find(c => c.id === selectedProduct.category)?.defaultUnit}
        />
      )}
    </>
  );
}