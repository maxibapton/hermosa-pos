import React, { useState } from 'react';
import { SaleRecord, Store } from '../types';
import { Building2, TrendingUp, TrendingDown, Users, ShoppingBag, CreditCard, Wallet, Receipt, Calendar, Search, Filter, ArrowUpDown, ChevronDown, ChevronUp, RotateCcw, Package, AlertTriangle } from 'lucide-react';
import { RefundModal } from './RefundModal';

const translations = {
  title: "Historique des Ventes",
  allStores: "Tous les Magasins",
  daily: "Quotidien",
  weekly: "Hebdomadaire", 
  monthly: "Mensuel",
  revenue: "Chiffre d'Affaires",
  today: "Aujourd'hui",
  thisWeek: "Cette Semaine",
  thisMonth: "Ce Mois",
  transactions: "Transactions",
  total: "Total",
  averageBasket: "Panier Moyen",
  paymentMethods: "Moyens de paiement",
  cash: "Espèces",
  card: "Carte",
  mixed: "Mixte",
  discountedSales: "Ventes avec Remise",
  topProducts: "Top Produits",
  strugglingProducts: "Produits en Difficulté",
  searchSales: "Rechercher par client ou produit...",
  noSales: "Pas de ventes",
  refund: "Rembourser",
  refunded: "Remboursé",
  refundReason: "Motif du remboursement",
  quantity: "Quantité",
  revenue: "CA",
  noSales: "Pas de ventes",
  lowStock: "Stock Faible",
  outOfStock: "Rupture de Stock"
};

interface SalesHistoryProps {
  sales: SaleRecord[];
  stores: Store[];
  onRefundSale: (saleId: string, reason: string) => void;
}

export function SalesHistory({ sales, stores, onRefundSale }: SalesHistoryProps) {
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'customer'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set());
  const [refundingSale, setRefundingSale] = useState<SaleRecord | null>(null);

  // Filter sales by selected store
  const filteredSales = sales.filter(sale => 
    selectedStore === 'all' || sale.storeId === selectedStore
  ).filter(sale =>
    searchTerm === '' || 
    sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate time periods
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  // Get sales for different periods
  const getPeriodSales = (start: Date, end: Date = new Date()) => 
    filteredSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate < end;
    });

  const todaySales = getPeriodSales(today);
  const weekSales = getPeriodSales(lastWeek);
  const monthSales = getPeriodSales(lastMonth);

  // Calculate today's metrics
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const todayHT = todaySales.reduce((sum, sale) => sum + sale.subtotal, 0);
  const todayTVA = todaySales.reduce((sum, sale) => sum + sale.totalVat, 0);
  const todayTransactions = todaySales.length;
  const todayAvgBasket = todayTransactions > 0 ? todayRevenue / todayTransactions : 0;

  // Calculate weekly metrics
  const weekRevenue = weekSales.reduce((sum, sale) => sum + sale.total, 0);
  const weekTransactions = weekSales.length;
  const weekAvgBasket = weekTransactions > 0 ? weekRevenue / weekTransactions : 0;

  // Calculate monthly metrics
  const monthRevenue = monthSales.reduce((sum, sale) => sum + sale.total, 0);
  const monthTransactions = monthSales.length;
  const monthAvgBasket = monthTransactions > 0 ? monthRevenue / monthTransactions : 0;

  // Calculate payment methods for today
  const todayPayments = todaySales.reduce((acc, sale) => {
    if (sale.payment.method === 'cash') {
      acc.cash += sale.total;
    } else if (sale.payment.method === 'card') {
      acc.card += sale.total;
    } else if (sale.payment.method === 'split') {
      acc.cash += sale.payment.cashAmount || 0;
      acc.card += sale.payment.cardAmount || 0;
      acc.mixed += sale.total;
    }
    return acc;
  }, { cash: 0, card: 0, mixed: 0 });

  const totalRevenue = todayPayments.cash + todayPayments.card + todayPayments.mixed;
  const cashPercentage = totalRevenue > 0 ? (todayPayments.cash / totalRevenue) * 100 : 0;
  const cardPercentage = totalRevenue > 0 ? (todayPayments.card / totalRevenue) * 100 : 0;
  const mixedPercentage = totalRevenue > 0 ? (todayPayments.mixed / totalRevenue) * 100 : 0;

  // Calculate discounted sales
  const discountedSales = todaySales.filter(sale => 
    sale.itemDiscounts > 0 || sale.totalDiscount
  ).length;
  const discountPercentage = todayTransactions > 0 ? (discountedSales / todayTransactions) * 100 : 0;

  // Calculate product metrics
  const productMetrics = filteredSales.reduce((acc, sale) => {
    sale.items.forEach(item => {
      if (!acc[item.productId]) {
        acc[item.productId] = {
          name: item.productName,
          quantity: 0,
          revenue: 0,
          transactions: 0
        };
      }
      acc[item.productId].quantity += item.quantity;
      acc[item.productId].revenue += item.price;
      acc[item.productId].transactions += 1;
    });
    return acc;
  }, {} as Record<string, { name: string; quantity: number; revenue: number; transactions: number }>);

  // Get top 5 products by revenue
  const topProducts = Object.values(productMetrics)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Get bottom 5 products by revenue (with at least one sale)
  const strugglingProducts = Object.values(productMetrics)
    .filter(product => product.revenue > 0)
    .sort((a, b) => a.revenue - b.revenue)
    .slice(0, 5);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedSales);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSales(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Store Selection and Time Range */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Building2 className="text-indigo-600" size={24} />
            </div>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-medium"
            >
              <option value="all">{translations.allStores}</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('daily')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'daily'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {translations.daily}
            </button>
            <button
              onClick={() => setTimeRange('weekly')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'weekly'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {translations.weekly}
            </button>
            <button
              onClick={() => setTimeRange('monthly')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'monthly'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {translations.monthly}
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700">Chiffre d'Affaires</h3>
          <div className="mt-2">
            <p className="text-3xl font-bold">{todayRevenue.toFixed(2)}€</p>
            <p className="text-sm text-gray-500">total</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Aujourd'hui</span>
              <span className="text-blue-600">{todayRevenue.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cette Semaine</span>
              <span className="text-blue-600">{weekRevenue.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ce Mois</span>
              <span className="text-blue-600">{monthRevenue.toFixed(2)}€</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between">
              <span className="text-gray-600">HT</span>
              <span className="text-blue-600">{todayHT.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">TVA</span>
              <span className="text-blue-600">{todayTVA.toFixed(2)}€</span>
            </div>
          </div>
        </div>

        {/* Transactions Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700">Transactions</h3>
          <div className="mt-2">
            <p className="text-3xl font-bold">{todayTransactions}</p>
            <p className="text-sm text-gray-500">total</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Aujourd'hui</span>
              <span className="text-blue-600">{todayTransactions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Panier Moyen</span>
              <span className="text-blue-600">{todayAvgBasket.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Panier Moyen Aujourd'hui</span>
              <span className="text-blue-600">{todayAvgBasket.toFixed(2)}€</span>
            </div>
          </div>
        </div>

        {/* Payment Methods Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700">Moyens de Paiement</h3>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Espèces</span>
              <span className="text-blue-600">{todayPayments.cash.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Carte</span>
              <span className="text-blue-600">{todayPayments.card.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mixte</span>
              <span className="text-blue-600">{todayPayments.mixed.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ventes avec Remise</span>
              <span className="text-blue-600">{discountedSales} ventes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Today vs Yesterday */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Today vs Yesterday</span>
            <span className="text-green-600">+12%</span>
          </div>
        </div>

        {/* Average Basket Size */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Panier Moyen</span>
            <span className="font-medium">{todayAvgBasket.toFixed(2)}€</span>
          </div>
        </div>

        {/* Total Discounts */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Remises Totales</span>
            <span className="font-medium">{(todaySales.reduce((sum, sale) => 
              sum + sale.itemDiscounts + (sale.totalDiscount?.amount || 0), 0)).toFixed(2)}€</span>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Top Produits</span>
            <span className="font-medium">Voir détails</span>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Package className="text-green-600" size={20} />
          <h3 className="text-lg font-medium text-gray-900">{translations.topProducts}</h3>
        </div>
        <div className="space-y-3">
          {topProducts.map((product, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-500">
                  {product.quantity} unités • {product.transactions} ventes
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{product.revenue.toFixed(2)}€</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Struggling Products */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-orange-600" size={20} />
          <h3 className="text-lg font-medium text-gray-900">{translations.strugglingProducts}</h3>
        </div>
        <div className="space-y-3">
          {strugglingProducts.map((product, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-500">
                  {product.quantity} unités • {product.transactions} ventes
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{product.revenue.toFixed(2)}€</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="text-indigo-600" size={20} />
          <h3 className="text-lg font-medium text-gray-900">{translations.paymentMethods}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Wallet size={20} className="text-gray-500" />
              <span className="text-gray-600">{translations.cash}</span>
            </div>
            <div className="text-right">
              <div className="font-medium">{todayPayments.cash.toFixed(2)}€</div>
              <div className="text-sm text-gray-500">
                {cashPercentage.toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CreditCard size={20} className="text-gray-500" />
              <span className="text-gray-600">{translations.card}</span>
            </div>
            <div className="text-right">
              <div className="font-medium">{todayPayments.card.toFixed(2)}€</div>
              <div className="text-sm text-gray-500">
                {cardPercentage.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={translations.searchSales}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Table */}
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
                      <span>Client</span>
                      {sortField === 'customer' && (
                        <ArrowUpDown size={16} className={sortDirection === 'desc' ? 'transform rotate-180' : ''} />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} />
                      <span>Paiement</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center gap-2">
                      <Receipt size={16} />
                      <span>Montant</span>
                      {sortField === 'amount' && (
                        <ArrowUpDown size={16} className={sortDirection === 'desc' ? 'transform rotate-180' : ''} />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <RotateCcw size={16} />
                      <span>Remboursement</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
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
                          <span>{sale.customerName || 'Client occasionnel'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {sale.payment.method === 'cash' && <Wallet size={16} className="text-green-500" />}
                          {sale.payment.method === 'card' && <CreditCard size={16} className="text-blue-500" />}
                          <span className="capitalize">{sale.payment.method}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{sale.total.toFixed(2)}€</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {sale.refunded ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                              {translations.refunded}
                            </span>
                          ) : (
                            <button
                              onClick={() => setRefundingSale(sale)}
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
                                  <th className="px-4 py-2 text-left">Produit</th>
                                  <th className="px-4 py-2 text-left">Quantité</th>
                                  <th className="px-4 py-2 text-left">Prix unitaire</th>
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
                                    <td className="px-4 py-2">{(item.price / item.quantity).toFixed(2)}€</td>
                                    <td className="px-4 py-2">{item.price.toFixed(2)}€</td>
                                  </tr>
                                ))}
                                <tr className="border-t border-gray-300">
                                  <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
                                  <td className="px-4 py-2 font-medium">{sale.total.toFixed(2)}€</td>
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

            {filteredSales.length === 0 && (
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
          onConfirm={(reason) => {
            onRefundSale(refundingSale.id, reason);
            setRefundingSale(null);
          }}
        />
      )}
    </div>
  );
}