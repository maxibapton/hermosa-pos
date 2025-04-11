import React, { useState } from 'react';
import { X, Percent, DollarSign } from 'lucide-react';
import { CartItem } from '../types';

interface DiscountModalProps {
  item?: CartItem;
  subtotal?: number;
  mode: 'item' | 'total';
  onClose: () => void;
  onApply: (discount: { type: 'percentage' | 'fixed'; value: number }) => void;
}

export function DiscountModal({ item, subtotal, mode, onClose, onApply }: DiscountModalProps) {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(discountValue);
    
    if (isNaN(value) || value <= 0) {
      alert('Please enter a valid discount value');
      return;
    }

    if (discountType === 'percentage' && value > 100) {
      alert('Percentage discount cannot exceed 100%');
      return;
    }

    const maxAmount = mode === 'item' ? item!.price : subtotal!;
    if (discountType === 'fixed' && value >= maxAmount) {
      alert('Fixed discount cannot exceed the total amount');
      return;
    }

    onApply({ type: discountType, value });
  };

  const calculateDiscountedPrice = () => {
    const value = parseFloat(discountValue) || 0;
    const amount = mode === 'item' ? item!.price : subtotal!;
    
    if (discountType === 'percentage') {
      return amount * (1 - value / 100);
    } else {
      return Math.max(0, amount - value);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            {mode === 'item' ? 'Apply Item Discount' : 'Apply Total Discount'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          {mode === 'item' ? (
            <>
              <h4 className="font-medium">{item!.name}</h4>
              <p className="text-gray-600">Current Price: ${item!.price.toFixed(2)}</p>
            </>
          ) : (
            <p className="text-gray-600">Subtotal: ${subtotal!.toFixed(2)}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex rounded-lg border-2 p-1">
            <button
              type="button"
              onClick={() => setDiscountType('percentage')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                discountType === 'percentage'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Percent size={16} />
                Percentage
              </div>
            </button>
            <button
              type="button"
              onClick={() => setDiscountType('fixed')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                discountType === 'fixed'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <DollarSign size={16} />
                Fixed Amount
              </div>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">
                {discountType === 'percentage' ? '%' : '$'}
              </span>
              <input
                type="number"
                step={discountType === 'percentage' ? '1' : '0.01'}
                min="0"
                max={discountType === 'percentage' ? '100' : mode === 'item' ? item!.price : subtotal}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
              />
            </div>
          </div>

          {discountValue && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Original Price:</span>
                <span>${(mode === 'item' ? item!.price : subtotal!).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600 mt-1">
                <span>Discount:</span>
                <span>
                  {discountType === 'percentage'
                    ? `${discountValue}%`
                    : `$${discountValue}`
                  }
                </span>
              </div>
              <div className="flex justify-between font-medium mt-2 pt-2 border-t">
                <span>Final Price:</span>
                <span>${calculateDiscountedPrice().toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
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
              Apply Discount
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}