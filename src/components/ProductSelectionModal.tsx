import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Product } from '../types';

interface ProductSelectionModalProps {
  product: Product;
  isBulk: boolean;
  defaultUnit?: string;
  onClose: () => void;
  onConfirm: (product: Product, quantity: number, price: number) => void;
}

export function ProductSelectionModal({
  product,
  isBulk,
  defaultUnit,
  onClose,
  onConfirm,
}: ProductSelectionModalProps) {
  const [quantity, setQuantity] = useState(isBulk ? '0.1' : '1');
  const [price, setPrice] = useState(isBulk ? '' : (product.price?.toString() ?? ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedQuantity = parseFloat(quantity);
    const parsedPrice = parseFloat(price);
    
    if (!parsedQuantity || parsedQuantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    if (!parsedPrice || parsedPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }
    if (parsedQuantity > product.stockQuantity) {
      alert('Not enough stock available');
      return;
    }
    onConfirm(product, parsedQuantity, parsedPrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity {defaultUnit && `(${defaultUnit})`}
              </label>
              <input
                type="number"
                min={isBulk ? "0.001" : "1"}
                step={isBulk ? "0.001" : "1"}
                max={product.stockQuantity}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Available stock: {product.stockQuantity} {defaultUnit || 'units'}
              </p>
            </div>
            
            {isBulk && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Price per {defaultUnit}: ${((parseFloat(price) || 0) / (parseFloat(quantity) || 1)).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add to Cart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}