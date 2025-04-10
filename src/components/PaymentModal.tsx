import React, { useState } from 'react';
import { X, CreditCard, Wallet, SplitSquareHorizontal, Check, DollarSign, Calculator } from 'lucide-react';
import { PaymentInfo } from '../types';

const translations = {
  title: "Détails du Paiement",
  totalAmount: "Montant Total",
  paymentMethod: "Moyen de Paiement",
  cash: "Espèces",
  card: "Carte",
  split: "Mixte",
  cashAmount: "Montant en Espèces",
  cardAmount: "Montant en Carte",
  receivedAmount: "Montant Reçu",
  changeDue: "Monnaie à Rendre",
  complete: "Finaliser le Paiement",
  cancel: "Annuler"
};

interface PaymentModalProps {
  total: number;
  onClose: () => void;
  onConfirm: (payment: PaymentInfo) => void;
}

export function PaymentModal({ total, onClose, onConfirm }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'split'>('cash');
  const [cashAmount, setCashAmount] = useState<string>(total.toFixed(2));
  const [cardAmount, setCardAmount] = useState<string>('0.00');
  const [cashReceived, setCashReceived] = useState<string>(total.toFixed(2));
  const [splitMode, setSplitMode] = useState<'amount' | 'percentage'>('amount');
  const [splitPercentage, setSplitPercentage] = useState<string>('50');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let paymentInfo: PaymentInfo;

    if (paymentMethod === 'split') {
      const cash = parseFloat(cashAmount);
      const card = parseFloat(cardAmount);
      
      if (isNaN(cash) || isNaN(card) || Math.abs(cash + card - total) > 0.01) {
        alert('Split payment amounts must equal the total');
        return;
      }
      
      paymentInfo = {
        method: 'split',
        cashAmount: cash,
        cardAmount: card,
      };
    } else {
      paymentInfo = {
        method: paymentMethod,
        ...(paymentMethod === 'cash' ? { cashAmount: total } : { cardAmount: total }),
      };
    }

    onConfirm(paymentInfo);
  };

  const handleCashReceivedChange = (value: string) => {
    setCashReceived(value);
  };

  const calculateChange = () => {
    const received = parseFloat(cashReceived) || 0;
    return Math.max(0, received - (paymentMethod === 'split' ? parseFloat(cashAmount) : total));
  };

  const handleSplitCashChange = (value: string) => {
    const cash = parseFloat(value) || 0;
    if (cash <= total) {
      setCashAmount(value);
      setCardAmount((total - cash).toFixed(2));
      setCashReceived(value);
    }
  };

  const handleSplitCardChange = (value: string) => {
    const card = parseFloat(value) || 0;
    if (card <= total) {
      setCardAmount(value);
      setCashAmount((total - card).toFixed(2));
    }
  };

  const handleSplitPercentageChange = (value: string) => {
    const percentage = Math.min(100, Math.max(0, parseFloat(value) || 0));
    setSplitPercentage(percentage.toString());
    const cashPortion = (total * percentage) / 100;
    setCashAmount(cashPortion.toFixed(2));
    setCardAmount((total - cashPortion).toFixed(2));
    setCashReceived(cashPortion.toFixed(2));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">{translations.title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Total Amount Display */}
          <div className="bg-indigo-50 p-4 rounded-lg text-center">
            <p className="text-sm text-indigo-600 font-medium">{translations.totalAmount}</p>
            <p className="text-3xl font-bold text-indigo-700">${total.toFixed(2)}</p>
          </div>

          {/* Payment Method Selection */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'cash'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-200'
              }`}
            >
              <Wallet
                size={24}
                className={paymentMethod === 'cash' ? 'text-indigo-600' : 'text-gray-400'}
              />
              <span className={`block mt-2 text-sm font-medium ${
                paymentMethod === 'cash' ? 'text-indigo-600' : 'text-gray-600'
              }`}>{translations.cash}</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'card'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-200'
              }`}
            >
              <CreditCard
                size={24}
                className={paymentMethod === 'card' ? 'text-indigo-600' : 'text-gray-400'}
              />
              <span className={`block mt-2 text-sm font-medium ${
                paymentMethod === 'card' ? 'text-indigo-600' : 'text-gray-600'
              }`}>{translations.card}</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('split')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'split'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-200'
              }`}
            >
              <SplitSquareHorizontal
                size={24}
                className={paymentMethod === 'split' ? 'text-indigo-600' : 'text-gray-400'}
              />
              <span className={`block mt-2 text-sm font-medium ${
                paymentMethod === 'split' ? 'text-indigo-600' : 'text-gray-600'
              }`}>{translations.split}</span>
            </button>
          </div>

          {/* Split Payment Mode Selection */}
          {paymentMethod === 'split' && (
            <div className="flex rounded-lg border-2 p-1">
              <button
                type="button"
                onClick={() => setSplitMode('amount')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  splitMode === 'amount'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <DollarSign size={16} />
                  Amount
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSplitMode('percentage')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  splitMode === 'percentage'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Calculator size={16} />
                  Percentage
                </div>
              </button>
            </div>
          )}

          {/* Payment Details */}
          <div className="space-y-4">
            {(paymentMethod === 'cash' || paymentMethod === 'split') && (
              <div className="space-y-4">
                {paymentMethod === 'split' && (
                  <>
                    {splitMode === 'percentage' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {translations.cashAmount}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={splitPercentage}
                            onChange={(e) => handleSplitPercentageChange(e.target.value)}
                            className="flex-1"
                          />
                          <div className="w-16">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={splitPercentage}
                              onChange={(e) => handleSplitPercentageChange(e.target.value)}
                              className="w-full px-2 py-1 border rounded-md text-center"
                            />
                          </div>
                          <span className="text-gray-500">%</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg text-sm">
                          <div>
                            <span className="text-gray-500">{translations.cash}:</span>
                            <span className="ml-2 font-medium">${cashAmount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{translations.card}:</span>
                            <span className="ml-2 font-medium">${cardAmount}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {translations.cashAmount}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={total}
                            value={cashAmount}
                            onChange={(e) => handleSplitCashChange(e.target.value)}
                            className="w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">{translations.cardAmount}:</span>
                            <span className="font-medium">${cardAmount}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translations.receivedAmount}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min={paymentMethod === 'split' ? parseFloat(cashAmount) : total}
                      value={cashReceived}
                      onChange={(e) => handleCashReceivedChange(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {parseFloat(cashReceived) > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center text-green-700">
                      <span className="font-medium">{translations.changeDue}:</span>
                      <span className="text-lg font-bold">${calculateChange().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {translations.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={18} />
              {translations.complete}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}