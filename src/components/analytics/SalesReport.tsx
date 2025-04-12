import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { utils, writeFile } from 'xlsx';
import { SaleRecord } from '../../types';
import { FileDown, FileSpreadsheet } from 'lucide-react';

interface SalesReportProps {
  sales: SaleRecord[];
  period: {
    start: Date;
    end: Date;
  };
}

export function SalesReport({ sales, period }: SalesReportProps) {
  const generatePDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text('Rapport des Ventes', 14, 22);

    // Add period
    doc.setFontSize(12);
    doc.text(`Période: ${period.start.toLocaleDateString()} - ${period.end.toLocaleDateString()}`, 14, 32);

    // Add summary table
    const summaryData = [
      ['Chiffre d\'affaires', `${sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}€`],
      ['Nombre de ventes', sales.length.toString()],
      ['Panier moyen', `${(sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length).toFixed(2)}€`]
    ];

    autoTable(doc, {
      head: [['Métrique', 'Valeur']],
      body: summaryData,
      startY: 40
    });

    // Add sales details
    const salesData = sales.map(sale => [
      new Date(sale.date).toLocaleDateString(),
      sale.customerName || 'Client occasionnel',
      sale.items.map(item => item.productName).join(', '),
      `${sale.total.toFixed(2)}€`
    ]);

    autoTable(doc, {
      head: [['Date', 'Client', 'Produits', 'Total']],
      body: salesData,
      startY: doc.lastAutoTable.finalY + 10
    });

    doc.save('rapport-ventes.pdf');
  };

  const generateExcel = () => {
    const wb = utils.book_new();

    // Summary sheet
    const summaryData = [
      ['Métrique', 'Valeur'],
      ['Chiffre d\'affaires', `${sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}€`],
      ['Nombre de ventes', sales.length],
      ['Panier moyen', `${(sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length).toFixed(2)}€`]
    ];
    const summaryWs = utils.aoa_to_sheet(summaryData);
    utils.book_append_sheet(wb, summaryWs, 'Résumé');

    // Sales details sheet
    const salesData = [
      ['Date', 'Client', 'Produits', 'Total', 'Mode de paiement']
    ];
    sales.forEach(sale => {
      salesData.push([
        new Date(sale.date).toLocaleDateString(),
        sale.customerName || 'Client occasionnel',
        sale.items.map(item => item.productName).join(', '),
        `${sale.total.toFixed(2)}€`,
        sale.payment.method
      ]);
    });
    const salesWs = utils.aoa_to_sheet(salesData);
    utils.book_append_sheet(wb, salesWs, 'Détails');

    writeFile(wb, 'rapport-ventes.xlsx');
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={generatePDF}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
      >
        <FileDown size={20} />
        Exporter PDF
      </button>
      <button
        onClick={generateExcel}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
      >
        <FileSpreadsheet size={20} />
        Exporter Excel
      </button>
    </div>
  );
}