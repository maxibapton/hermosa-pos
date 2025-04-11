import React from 'react';
import { CartItem, Customer, PaymentInfo } from '../types';
import { Store, Phone, Mail, Receipt as ReceiptIcon } from 'lucide-react';

const translations = {
  title: "Reçu de Paiement",
  date: "Date",
  receiptNumber: "N° de Reçu",
  customer: "Client",
  item: "Article",
  quantity: "Qté",
  price: "Prix",
  subtotal: "Sous-total",
  itemDiscounts: "Remises Articles",
  totalDiscount: "Remise Totale",
  vat: "TVA",
  total: "Total",
  payment: "Paiement",
  cash: "Espèces",
  card: "Carte",
  thankYou: "Merci de votre achat !",
  visitAgain: "À bientôt chez CBD Wellness"
};

interface ReceiptProps {
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
}

export function Receipt({
  items,
  customer,
  payment,
  subtotal,
  itemDiscounts,
  totalDiscount,
  totalVat,
  total,
  date,
  saleId,
}: ReceiptProps) {
  return (
    <div className="bg-white p-6 max-w-md mx-auto text-sm" id="receipt">
      {/* Store Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-2">
          <Store className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold">CBD Wellness</h1>
        <p className="text-gray-600">123 Main Street</p>
        <div className="flex items-center justify-center gap-1 text-gray-600">
          <Phone size={14} />
          <span>555-0123</span>
        </div>
        <div className="flex items-center justify-center gap-1 text-gray-600">
          <Mail size={14} />
          <span>info@cbdwellness.com</span>
        </div>
        <div className="flex items-center justify-center gap-1 text-gray-600">
          <ReceiptIcon size={14} />
          <span>VAT: FR123456789</span>
        </div>
      </div>

      {/* Receipt Details */}
      <div className="border-t border-b py-2 mb-4">
        <div className="flex justify-between">
          <span>{translations.date}:</span>
          <span>{date.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>{translations.receiptNumber}:</span>
          <span>{saleId}</span>
        </div>
        {customer && (
          <div className="mt-2">
            <div className="font-medium">{translations.customer}:</div>
            <div>{customer.firstName} {customer.lastName}</div>
            <div className="text-gray-600">{customer.email}</div>
            {customer.phone && <div className="text-gray-600">{customer.phone}</div>}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="mb-4">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">{translations.item}</th>
              <th className="text-right py-2">{translations.quantity}</th>
              <th className="text-right py-2">{translations.price}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td className="py-1">{item.name}</td>
                  <td className="text-right">{item.quantity} {item.unitSize}</td>
                  <td className="text-right">
                    {item.discount ? (
                      <>
                        <span className="line-through text-gray-500">
                          ${item.price.toFixed(2)}
                        </span>
                        <br />
                        <span>
                          ${(item.price - item.discount.amount).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span>${item.price.toFixed(2)}</span>
                    )}
                  </td>
                </tr>
                {item.discount && (
                  <tr className="text-sm text-green-600">
                    <td colSpan={2}>Discount ({
                      item.discount.type === 'percentage'
                        ? `${item.discount.value}%`
                        : `$${item.discount.value}`
                    })</td>
                    <td className="text-right">-${item.discount.amount.toFixed(2)}</td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="space-y-1 mb-4">
        <div className="flex justify-between">
          <span>{translations.subtotal}:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {itemDiscounts > 0 && (
          <div className="flex justify-between text-green-600">
            <span>{translations.itemDiscounts}:</span>
            <span>-${itemDiscounts.toFixed(2)}</span>
          </div>
        )}
        {totalDiscount && (
          <div className="flex justify-between text-green-600">
            <span>{translations.totalDiscount} ({
              totalDiscount.type === 'percentage'
                ? `${totalDiscount.value}%`
                : `$${totalDiscount.value}`
            }):</span>
            <span>-${totalDiscount.amount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>{translations.vat}:</span>
          <span>${totalVat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>{translations.total}:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="text-center border-t pt-4">
        <div className="font-medium mb-1">{translations.payment}</div>
        {payment.method === 'cash' && (
          <div>{translations.cash}: ${payment.cashAmount?.toFixed(2)}</div>
        )}
        {payment.method === 'card' && (
          <div>{translations.card}: ${payment.cardAmount?.toFixed(2)}</div>
        )}
        {payment.method === 'split' && (
          <>
            <div>{translations.cash}: ${payment.cashAmount?.toFixed(2)}</div>
            <div>{translations.card}: ${payment.cardAmount?.toFixed(2)}</div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-xs mt-6">
        <p>{translations.thankYou}</p>
        <p>{translations.visitAgain}</p>
      </div>
    </div>
  );
}