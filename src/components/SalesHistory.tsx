import React, { useState } from 'react';
import { SaleRecord } from '../types';
import { Search, Calendar, DollarSign, Users, ShoppingBag, ArrowUpDown, Filter, CreditCard, Wallet, SplitSquareHorizontal, Tag, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Percent, Download, RotateCcw } from 'lucide-react';
import { RefundModal } from './RefundModal';

const translations = {
  title: "Historique des Ventes",
  revenue: "Chiffre d'Affaires",
  transactions: "Transactions",
  paymentMethods: "Moyens de Paiement",
  today: "Aujourd'hui",
  thisWeek: "Cette Semaine",
  thisMonth: "Ce Mois",
  averageValue: "Panier Moyen",
  todayAverage: "Panier Moyen Aujourd'hui",
  cash: "Espèces",
  card: "Carte",
  split: "Mixte",
  discountedSales: "Ventes avec Remise",
  searchSales: "Rechercher par client ou produit...",
  noSales: "Aucune vente trouvée",
  exportCsv: "Exporter CSV",
  refunded: "Remboursé",
  refund: "Rembourser",
  refundReason: "Motif du remboursement"
};

interface SalesHistoryProps {
  sales: SaleRecord[];
  onRefundSale: (saleId: string, reason: string) => void;
}

export function SalesHistory({ sales, onRefundSale }: SalesHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'customer'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set());
  const [refundingSale, setRefundingSale] = useState<SaleRecord | null>(null);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedSales);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSales(newExpanded);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filterSalesByDate = (sale: SaleRecord) => {
    const saleDate = new Date(sale.date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (dateFilter) {
      case 'today':
        return saleDate >= today;
      case 'week':
        return saleDate >= weekAgo;
      case 'month':
        return saleDate >= monthAgo;
      default:
        return true;
    }
  };

  const filteredAndSortedSales = sales
    .filter((sale) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        filterSalesByDate(sale) &&
        (sale.customerName?.toLowerCase().includes(searchLower) ||
          sale.items.some((item) => item.productName.toLowerCase().includes(searchLower)))
      );
    })
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'date':
          return direction * (new Date(a.date).getTime() - new Date(b.date).getTime());
        case 'amount':
          return direction * (a.total - b.total);
        case 'customer':
          return direction * ((a.customerName || 'Guest').localeCompare(b.customerName || 'Guest'));
        default:
          return 0;
      }
    });

  // Enhanced statistics calculations
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const todaySales = sales.filter(sale => 
    new Date(sale.date).toDateString() === new Date().toDateString()
  );
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  
  // Calculate week and month metrics
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const weekSales = sales.filter(sale => new Date(sale.date) >= weekStart);
  const monthSales = sales.filter(sale => new Date(sale.date) >= monthStart);
  
  const weekRevenue = weekSales.reduce((sum, sale) => sum + sale.total, 0);
  const monthRevenue = monthSales.reduce((sum, sale) => sum + sale.total, 0);
  
  // Average transaction value
  const averageTransaction = sales.length > 0 ? totalRevenue / sales.length : 0;
  const todayAverageTransaction = todaySales.length > 0 ? todayRevenue / todaySales.length : 0;
  
  // Payment method distribution
  const paymentMethods = sales.reduce((acc, sale) => {
    acc[sale.payment.method] = (acc[sale.payment.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalTransactions = sales.length;
  const cashPercentage = ((paymentMethods.cash || 0) / totalTransactions) * 100;
  const cardPercentage = ((paymentMethods.card || 0) / totalTransactions) * 100;
  const splitPercentage = ((paymentMethods.split || 0) / totalTransactions) * 100;

  // Discount metrics
  const totalDiscounts = sales.reduce((sum, sale) => 
    sum + sale.itemDiscounts + (sale.totalDiscount?.amount || 0), 0
  );
  const discountPercentage = totalRevenue > 0 ? (totalDiscounts / (totalRevenue + totalDiscounts)) * 100 : 0;

  const handleExportSales = () => {
    // Prepare the headers for the CSV
    const headers = [
      'Date',
      'Time',
      'Sale ID',
      'Customer Name',
      'Payment Method',
      'Subtotal',
      'Item Discounts',
      'Total Discount',
      'VAT',
      'Total',
      'Items',
      'Item Details',
      'Refund Status',
      'Refund Reason'
    ];

    // Prepare the data rows
    const csvData = sales.map(sale => {
      const saleDate = new Date(sale.date);
      const itemsList = sale.items.map(item => item.productName).join('; ');
      const itemDetails = sale.items.map(item => 
        `${item.productName} (${item.quantity}${item.unitSize ? item.unitSize : ''} @ $${(item.price / item.quantity).toFixed(2)}${item.discount ? ` -${item.discount.type === 'percentage' ? item.discount.value + '%' : '$' + item.discount.value}` : ''})`
      ).join('; ');

      return [
        saleDate.toLocaleDateString(),
        saleDate.toLocaleTimeString(),
        sale.id,
        sale.customerName || 'Guest',
        sale.payment.method === 'split' 
          ? `Split (Cash: $${sale.payment.cashAmount?.toFixed(2)}, Card: $${sale.payment.cardAmount?.toFixed(2)})`
          : sale.payment.method,
        sale.subtotal.toFixed(2),
        sale.itemDiscounts.toFixed(2),
        sale.totalDiscount ? sale.totalDiscount.amount.toFixed(2) : '0.00',
        sale.totalVat.toFixed(2),
        sale.total.toFixed(2),
        itemsList,
        itemDetails,
        sale.refunded ? 'Refunded' : '',
        sale.refundReason || ''
      ];
    });

    // Combine headers and data
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefund = (sale: SaleRecord) => {
    setRefundingSale(sale);
  };

  const handleConfirmRefund = (reason: string) => {
    if (refundingSale) {
      onRefundSale(refundingSale.id, reason);
      setRefundingSale(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">{translations.revenue}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
            <p className="ml-2 text-sm text-gray-500">total</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{translations.today}</span>
              <span className="font-medium">${todayRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{translations.thisWeek}</span>
              <span className="font-medium">${weekRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{translations.thisMonth}</span>
              <span className="font-medium">${monthRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">{translations.transactions}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-bold text-gray-900">{totalTransactions}</p>
            <p className="ml-2 text-sm text-gray-500">total</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{translations.today}</span>
              <span className="font-medium">{todaySales.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{translations.averageValue}</span>
              <span className="font-medium">${averageTransaction.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{translations.todayAverage}</span>
              <span className="font-medium">${todayAverageTransaction.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">{translations.paymentMethods}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-bold text-gray-900">{Math.round(cardPercentage)}%</p>
            <p className="ml-2 text-sm text-gray-500">{translations.card}</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{translations.cash}</span>
              <span className="font-medium">{Math.round(cashPercentage)}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{translations.split}</span>
              <span className="font-medium">{Math.round(splitPercentage)}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{translations.discountedSales}</span>
              <span className="font-medium">{Math.round(discountPercentage)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today vs Yesterday</p>
              <h4 className="text-xl font-semibold text-gray-900">+12%</h4>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Basket Size</p>
              <h4 className="text-xl font-semibold text-gray-900">${averageTransaction.toFixed(2)}</h4>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Discounts</p>
              <h4 className="text-xl font-semibold text-gray-900">${totalDiscounts.toFixed(2)}</h4>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <Percent className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <h4 className="text-xl font-semibold text-gray-900">68%</h4>
            </div>
            <div className="bg-yellow-100 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{translations.title}</h2>
            </div>
            <button
              onClick={handleExportSales}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download size={20} />
              {translations.exportCsv}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={translations.searchSales}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                >
                  <option value="all">All Time</option>
                  <option value="today">{translations.today}</option>
                  <option value="week">{translations.thisWeek}</option>
                  <option value="month">{translations.thisMonth}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="w-8 px-4 py-3"></th>
                  <th 
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Date</span>
                      {sortField === 'date' && (
                        <ArrowUpDown size={16} className={sortDirection === 'desc' ? 'transform rotate-180' : ''} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('customer')}
                  >
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>Customer</span>
                      {sortField === 'customer' && (
                        <ArrowUpDown size={16} className={sortDirection === 'desc' ? 'transform rotate-180' : ''} />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} />
                      <span>Payment</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} />
                      <span>Amount</span>
                      {sortField === 'amount' && (
                        <ArrowUpDown size={16} className={sortDirection === 'desc' ? 'transform rotate-180' : ''} />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <RotateCcw size={16} />
                      <span>Refund</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedSales.map((sale) => (
                  <React.Fragment key={sale.id}>
                    <tr className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleExpand(sale.id)}
                          className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                        >
                          {expandedSales.has(sale.id) ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div>{new Date(sale.date).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(sale.date).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          <span>{sale.customerName || 'Guest'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {sale.payment.method === 'cash' && <Wallet size={16} className="text-green-500" />}
                          {sale.payment.method === 'card' && <CreditCard size={16} className="text-blue-500" />}
                          {sale.payment.method === 'split' && <SplitSquareHorizontal size={16} className="text-purple-500" />}
                          <span className="capitalize">{sale.payment.method}</span>
                          {sale.payment.method === 'split' && (
                            <span className="text-sm text-gray-500">
                              (${sale.payment.cashAmount?.toFixed(2)} / ${sale.payment.cardAmount?.toFixed(2)})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">${sale.total.toFixed(2)}</div>
                          {(sale.itemDiscounts > 0 || sale.totalDiscount) && (
                            <div className="flex items-center gap-1 text-sm text-green-600">
                              <Tag size={14} />
                              <span>-${(sale.itemDiscounts + (sale.totalDiscount?.amount || 0)).toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {sale.refunded ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                              {translations.refunded}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRefund(sale)}
                              className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <RotateCcw size={16} />
                              {translations.refund}
                            </button>
                          )}
                        </div>
                        {sale.refunded && sale.refundReason && (
                          <div className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">{translations.refundReason}:</span> {sale.refundReason}
                          </div>
                        )}
                      </td>
                    </tr>
                    {expandedSales.has(sale.id) && (
                      <tr className="border-t">
                        <td className="bg-gray-50" colSpan={6}>
                          <div className="px-4 py-3">
                            <table className="w-full text-sm">
                              <thead>
                                <tr>
                                  <th className="px-4 py-2 text-left">Product</th>
                                  <th className="px-4 py-2 text-left">Quantity</th>
                                  <th className="px-4 py-2 text-left">Unit Price</th>
                                  <th className="px-4 py-2 text-left">Discount</th>
                                  <th className="px-4 py-2 text-left">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sale.items.map((item, index) => (
                                  <tr key={index} className="border-t border-gray-200">
                                    <td className="px-4 py-2">{item.productName}</td>
                                    <td className="px-4 py-2">
                                      {item.quantity} {item.unitSize}
                                    </td>
                                    <td className="px-4 py-2">${(item.price / item.quantity).toFixed(2)}</td>
                                    <td className="px-4 py-2">
                                      {item.discount ? (
                                        <span className="text-green-600">
                                          {item.discount.type === 'percentage'
                                            ? `${item.discount.value}%`
                                            : `$${item.discount.value}`
                                          }
                                        </span>
                                      ) : (
                                        '-'
                                      )}
                                    </td>
                                    <td className="px-4 py-2">
                                      {item.discount && (
                                        <span className="text-sm text-gray-500 line-through mr-2">
                                          ${item.price.toFixed(2)}
                                        </span>
                                      )}
                                      ${(item.price - (item.discount?.amount || 0)).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="border-t border-gray-300">
                                  <td colSpan={4} className="px-4 py-2 text-right">Subtotal:</td>
                                  <td className="px-4 py-2">${sale.subtotal.toFixed(2)}</td>
                                </tr>
                                {sale.itemDiscounts > 0 && (
                                  <tr>
                                    <td colSpan={4} className="px-4 py-2 text-right text-green-600">Item Discounts:</td>
                                    <td className="px-4 py-2 text-green-600">-${sale.itemDiscounts.toFixed(2)}</td>
                                  </tr>
                                )}
                                {sale.totalDiscount && (
                                  <tr>
                                    <td colSpan={4} className="px-4 py-2 text-right text-green-600">
                                      Total Discount ({sale.totalDiscount.type === 'percentage' 
                                        ? `${sale.totalDiscount.value}%` 
                                        : `$${sale.totalDiscount.value}`}):
                                    </td>
                                    <td className="px-4 py-2 text-green-600">-${sale.totalDiscount.amount.toFixed(2)}</td>
                                  </tr>
                                )}
                                <tr className="border-t border-gray-300 font-medium">
                                  <td colSpan={4} className="px-4 py-2 text-right">Total:</td>
                                  <td className="px-4 py-2">${sale.total.toFixed(2)}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {filteredAndSortedSales.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">{translations.noSales}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {refundingSale && (
        <RefundModal
          saleTotal={refundingSale.total}
          onClose={() => setRefundingSale(null)}
          onConfirm={handleConfirmRefund}
        />
      )}
    </div>
  );
}