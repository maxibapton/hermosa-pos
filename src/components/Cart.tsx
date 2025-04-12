import React, { useState } from 'react';
import { CartItem, Customer, CustomerFormData, PaymentInfo } from '../types';
import { Trash2, Plus, Minus, Users, ShoppingBag, Tag, Percent } from 'lucide-react';
import { CustomerSelectionModal } from './CustomerSelectionModal';
import { PaymentModal } from './PaymentModal';
import { DiscountModal } from './DiscountModal';
import { ReceiptModal } from './ReceiptModal';

const translations = {
  title: "Panier",
  empty: "Le panier est vide",
  selectCustomer: "Sélectionner un Client",
  selectedCustomer: "Client Sélectionné",
  change: "Changer",
  subtotal: "Sous-total",
  itemDiscounts: "Remises Articles",
  totalDiscount: "Remise Totale",
  total: "Total",
  addDiscount: "Ajouter une Remise",
  checkout: "Paiement",
  quantity: "Quantité",
  units: "unités",
  removeDiscount: "Supprimer",
  confirmRemove: "Supprimer l'article"
};

interface CartProps {
  items: CartItem[];
  customers: Customer[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: (customerId: string | undefined, payment: PaymentInfo, totalDiscount?: { type: 'percentage' | 'fixed'; value: number; amount: number }) => void;
  onAddCustomer: (customer: CustomerFormData) => void;
  onApplyDiscount: (itemId: string, discount: { type: 'percentage' | 'fixed'; value: number }) => void;
  onRemoveDiscount: (itemId: string) => void;
}

export function Cart({
  items,
  customers,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onAddCustomer,
  onApplyDiscount,
  onRemoveDiscount,
}: CartProps) {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showTotalDiscountModal, setShowTotalDiscountModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();
  const [totalDiscount, setTotalDiscount] = useState<{ type: 'percentage' | 'fixed'; value: number; amount: number } | undefined>();
  const [lastSale, setLastSale] = useState<{
    items: CartItem[];
    customer?: Customer;
    payment: PaymentInfo;
    subtotal: number;
    itemDiscounts: number;
    totalDiscount?: { type: 'percentage' | 'fixed'; value: number; amount: number };
    totalVat: number;
    total: number;
    date: Date;
    saleId: string;
  } | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const itemDiscounts = items.reduce((sum, item) => sum + (item.discount?.amount || 0), 0);
  const totalDiscountAmount = totalDiscount?.amount || 0;
  const totalVat = items.reduce((sum, item) => sum + (item.vatAmount || 0), 0);
  const total = subtotal - itemDiscounts - totalDiscountAmount;

  const selectedCustomer = selectedCustomerId 
    ? customers.find(c => c.id === selectedCustomerId)
    : undefined;

  const handleCustomerSelect = (customerId?: string) => {
    setSelectedCustomerId(customerId);
    setShowCustomerModal(false);
  };

  const handleCheckout = (payment: PaymentInfo) => {
    const saleId = Math.random().toString(36).substr(2, 9);
    const saleDate = new Date();
    
    setLastSale({
      items,
      customer: selectedCustomer,
      payment,
      subtotal,
      itemDiscounts,
      totalDiscount,
      totalVat,
      total,
      date: saleDate,
      saleId,
    });
    
    onCheckout(selectedCustomerId, payment, totalDiscount);
    setShowPaymentModal(false);
    setSelectedCustomerId(undefined);
    setTotalDiscount(undefined);
  };

  const handleDiscountClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setShowDiscountModal(true);
  };

  const handleTotalDiscountApply = (discount: { type: 'percentage' | 'fixed'; value: number }) => {
    const amount = discount.type === 'percentage'
      ? (subtotal - itemDiscounts) * (discount.value / 100)
      : discount.value;

    setTotalDiscount({
      ...discount,
      amount,
    });
    setShowTotalDiscountModal(false);
  };

  return (
    <>
      <div className="bg-blue-600 rounded-lg shadow-md p-4 h-full flex flex-col text-[#F7F4DF]">
        <h2 className="text-xl font-semibold mb-4 text-[#F7F4DF]">{translations.title}</h2>

        {/* Customer Selection */}
        <div className="mb-4 p-3 bg-blue-700 rounded-lg">
          {selectedCustomer ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[#F7F4DF]">{translations.selectedCustomer}</h3>
                  <p className="text-sm text-[#F7F4DF]/80">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </p>
                </div>
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="text-[#F7F4DF] hover:text-[#F7F4DF]/80 text-sm"
                >
                  {translations.change}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCustomerModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-[#F7F4DF]/20 rounded-md text-[#F7F4DF] hover:bg-blue-800"
            >
              <Users size={18} />
              {translations.selectCustomer}
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto">
          {items.length === 0 ? (
            <div className="text-center py-8 text-[#F7F4DF]/80">
              <ShoppingBag className="mx-auto h-12 w-12 text-[#F7F4DF]/60" />
              <p className="mt-2">{translations.empty}</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 bg-blue-700 p-3 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-[#F7F4DF]">{item.name}</h3>
                    <p className="text-[#F7F4DF]/80">
                      {item.quantity} {item.unitSize || translations.units} × ${(item.price / item.quantity).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`font-semibold ${item.discount ? 'text-[#F7F4DF]/40 line-through' : 'text-[#F7F4DF]'}`}>
                        ${item.price.toFixed(2)}
                      </p>
                      {item.discount && (
                        <>
                          <span className="text-[#F7F4DF] font-semibold">
                            ${(item.price - item.discount.amount).toFixed(2)}
                          </span>
                          <span className="text-xs bg-green-500/20 text-[#F7F4DF] px-2 py-0.5 rounded-full">
                            {item.discount.type === 'percentage' 
                              ? `${item.discount.value}% off`
                              : `$${item.discount.value} off`
                            }
                          </span>
                          <button
                            onClick={() => onRemoveDiscount(item.id)}
                            className="text-xs text-red-300 hover:text-red-200"
                          >
                            {translations.removeDiscount}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - (item.unitSize ? 0.1 : 1))}
                      className="p-1 rounded-full hover:bg-blue-600"
                    >
                      <Minus size={16} className="text-[#F7F4DF]" />
                    </button>
                    <span className="w-16 text-center text-[#F7F4DF]">{item.quantity.toFixed(item.unitSize ? 3 : 0)}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + (item.unitSize ? 0.1 : 1))}
                      className="p-1 rounded-full hover:bg-blue-600"
                    >
                      <Plus size={16} className="text-[#F7F4DF]" />
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDiscountClick(item.id)}
                        className="p-1 text-[#F7F4DF] hover:bg-blue-600 rounded-full"
                        title="Apply Item Discount"
                      >
                        <Tag size={16} />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 text-red-300 hover:bg-red-500/20 rounded-full"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Total and Checkout */}
        <div className="mt-4 pt-4 border-t border-[#F7F4DF]/20 space-y-2">
          <div className="flex justify-between text-sm text-[#F7F4DF]/80">
            <span>{translations.subtotal}:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {itemDiscounts > 0 && (
            <div className="flex justify-between text-sm text-green-300">
              <span>{translations.itemDiscounts}:</span>
              <span>-${itemDiscounts.toFixed(2)}</span>
            </div>
          )}
          {totalDiscount && (
            <div className="flex justify-between items-center text-sm text-green-300">
              <div className="flex items-center gap-2">
                <span>{translations.totalDiscount}:</span>
                <span className="text-xs bg-green-500/20 text-[#F7F4DF] px-2 py-0.5 rounded-full">
                  {totalDiscount.type === 'percentage' 
                    ? `${totalDiscount.value}%`
                    : `$${totalDiscount.value}`
                  }
                </span>
                <button
                  onClick={() => setTotalDiscount(undefined)}
                  className="text-xs text-red-300 hover:text-red-200"
                >
                  {translations.removeDiscount}
                </button>
              </div>
              <span>-${totalDiscount.amount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold text-[#F7F4DF]">
            <span>{translations.total}:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTotalDiscountModal(true)}
              disabled={items.length === 0}
              className="px-4 py-2 border border-[#F7F4DF] text-[#F7F4DF] rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Percent size={18} />
              {translations.addDiscount}
            </button>
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={items.length === 0}
              className="flex-1 bg-[#F7F4DF] text-blue-600 py-2 px-4 rounded-md hover:bg-[#F7F4DF]/90 disabled:bg-[#F7F4DF]/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} />
              {translations.checkout}
            </button>
          </div>
        </div>
      </div>

      {showCustomerModal && (
        <CustomerSelectionModal
          customers={customers}
          onClose={() => setShowCustomerModal(false)}
          onSelect={handleCustomerSelect}
          onAddCustomer={onAddCustomer}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          total={total}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handleCheckout}
        />
      )}

      {showDiscountModal && selectedItemId && (
        <DiscountModal
          item={items.find(item => item.id === selectedItemId)!}
          onClose={() => {
            setShowDiscountModal(false);
            setSelectedItemId(null);
          }}
          onApply={(discount) => {
            onApplyDiscount(selectedItemId, discount);
            setShowDiscountModal(false);
            setSelectedItemId(null);
          }}
          mode="item"
        />
      )}

      {showTotalDiscountModal && (
        <DiscountModal
          subtotal={subtotal - itemDiscounts}
          onClose={() => setShowTotalDiscountModal(false)}
          onApply={handleTotalDiscountApply}
          mode="total"
        />
      )}

      {lastSale && (
        <ReceiptModal
          {...lastSale}
          onClose={() => setLastSale(null)}
        />
      )}
    </>
  );
}