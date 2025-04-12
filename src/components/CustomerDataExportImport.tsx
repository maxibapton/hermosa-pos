import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { Customer } from '../types';

interface CustomerDataExportImportProps {
  customers: Customer[];
  onImport: (customers: Customer[]) => void;
}

export function CustomerDataExportImport({ customers, onImport }: CustomerDataExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Notes',
      'Created At',
      'Last Purchase',
      'Total Purchases'
    ];

    const csvData = customers.map(customer => [
      customer.firstName,
      customer.lastName,
      customer.email,
      customer.phone || '',
      customer.notes || '',
      customer.createdAt.toISOString(),
      customer.lastPurchase?.toISOString() || '',
      customer.totalPurchases.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');

        const importedCustomers: Customer[] = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(value => 
              value.trim().replace(/^"|"$/g, '')
            );
            
            return {
              id: Math.random().toString(36).substr(2, 9),
              firstName: values[0],
              lastName: values[1],
              email: values[2],
              phone: values[3] || undefined,
              notes: values[4] || undefined,
              createdAt: new Date(values[5]),
              lastPurchase: values[6] ? new Date(values[6]) : undefined,
              totalPurchases: parseInt(values[7])
            };
          });

        onImport(importedCustomers);
        alert(`${importedCustomers.length} customers imported successfully.`);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error importing customers:', error);
        alert('Error importing file. Please check the CSV format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
      >
        <Download size={20} />
        Export CSV
      </button>
      <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer">
        <Upload size={20} />
        Import CSV
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="hidden"
        />
      </label>
    </div>
  );
}