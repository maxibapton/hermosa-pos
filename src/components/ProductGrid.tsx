import React, { useState } from 'react';
import { Product, Category } from '../types';
import { ProductSelectionModal } from './ProductSelectionModal';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  onAddToCart: (product: Product, quantity: number, price: number) => void;
}

function ProductGrid({ products, categories, onAddToCart }: ProductGridProps) {
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {products.map((product) => {
          const category = categories.find(c => c.id === product.category);
          const isBulk = category?.isBulk ?? false;
          
          return (
            <div
              key={product.id}
              onClick={() => product.stockQuantity > 0 && handleProductClick(product)}
              className={`bg-white rounded-lg p-6 hover:shadow-lg transition-shadow ${
                product.stockQuantity > 0 ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h3 className="font-black text-primary text-xl mb-2">{product.name}</h3>
                  <p className="text-accent text-2xl font-bold mb-2">
                    ${product.price?.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Package size={16} />
                    <span>Stock: {product.stockQuantity} {isBulk ? category?.defaultUnit : 'unités'}</span>
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

export default ProductGrid;

export { ProductGrid };