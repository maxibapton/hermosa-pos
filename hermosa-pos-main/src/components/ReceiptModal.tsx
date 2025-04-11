import React, { useRef, useState } from 'react';
import { X, Printer, Download, Mail, Loader2 } from 'lucide-react';
import { CartItem, Customer, PaymentInfo } from '../types';
import { Receipt } from './Receipt';

interface ReceiptModalProps {
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
  onClose: () => void;
}

export function ReceiptModal(props: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [emailInput, setEmailInput] = useState(props.customer?.email || '');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrint = () => {
    const printContent = receiptRef.current?.innerHTML || '';
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - Hermosa CBD</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; }
              @media print {
                body { padding: 0; margin: 0; }
                @page { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const handleDownload = () => {
    const content = receiptRef.current?.innerHTML || '';
    const blob = new Blob([`
      <html>
        <head>
          <title>Receipt - Hermosa CBD</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `], { type: 'text/html' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${props.saleId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setError('Please enter a valid email address');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const content = receiptRef.current?.innerHTML || '';
      const response = await fetch('/api/send-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailInput,
          subject: `Receipt from Hermosa CBD - Order #${props.saleId}`,
          receiptHtml: `
            <html>
              <head>
                <title>Receipt - Hermosa CBD</title>
                <style>
                  body { font-family: system-ui, -apple-system, sans-serif; }
                </style>
              </head>
              <body>
                ${content}
              </body>
            </html>
          `
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.details || 
          errorData?.error || 
          `Server error: ${response.status}`
        );
      }

      const responseData = await response.json();
      
      if (responseData.error) {
        throw new Error(responseData.details || responseData.error);
      }

      setEmailSent(true);
      setTimeout(() => {
        setShowEmailInput(false);
        setEmailSent(false);
        setError(null);
      }, 3000);
    } catch (error) {
      console.error('Error sending email:', error);
      setError(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Sales Receipt</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Printer size={20} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download size={20} />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={() => setShowEmailInput(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Mail size={20} />
              <span className="hidden sm:inline">Email</span>
            </button>
            <button
              onClick={props.onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div ref={receiptRef}>
          <Receipt {...props} />
        </div>

        {showEmailInput && (
          <div className="p-4 border-t">
            <form onSubmit={handleSendEmail} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Email address"
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <button
                  type="submit"
                  disabled={sending || emailSent}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  {sending ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : emailSent ? (
                    'Sent!'
                  ) : (
                    <>
                      <Mail size={20} />
                      Send
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailInput(false);
                    setError(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}