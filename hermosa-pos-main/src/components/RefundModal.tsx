import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const translations = {
  title: "Confirmer le Remboursement",
  warning: "Vous êtes sur le point de rembourser une vente de",
  warningNote: "Cette action ne peut pas être annulée.",
  reason: "Motif du Remboursement *",
  reasonPlaceholder: "Veuillez indiquer le motif du remboursement...",
  cancel: "Annuler",
  confirm: "Confirmer le Remboursement"
};

interface RefundModalProps {
  saleTotal: number;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function RefundModal({ saleTotal, onClose, onConfirm }: RefundModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Veuillez indiquer un motif pour le remboursement');
      return;
    }
    onConfirm(reason);
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

        <div className="mb-6">
          <div className="flex items-center gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
            <AlertTriangle className="flex-shrink-0" />
            <p className="text-sm">
              {translations.warning} {saleTotal.toFixed(2)}€.
              {translations.warningNote}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translations.reason}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              required
              placeholder={translations.reasonPlaceholder}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {translations.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              {translations.confirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}