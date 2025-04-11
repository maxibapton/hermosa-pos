import { SaleRecord, SalesMetrics, Store } from '../types';

export function calculateSalesMetrics(sales: SaleRecord[], stores: Store[] = []): SalesMetrics {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Initialize store-specific metrics
  const storeMetrics: Record<string, { revenue: number; transactions: number }> = {};
  if (stores) {
    stores.forEach(store => {
      storeMetrics[store.id] = { revenue: 0, transactions: 0 };
    });
  }

  // Filter sales by time periods
  const todaySales = sales.filter(sale => new Date(sale.date) >= today);
  const yesterdaySales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate >= yesterday && saleDate < today;
  });
  const weekSales = sales.filter(sale => new Date(sale.date) >= weekAgo);
  const monthSales = sales.filter(sale => new Date(sale.date) >= monthAgo);

  // Calculate revenue metrics
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.total, 0);
  const weekRevenue = weekSales.reduce((sum, sale) => sum + sale.total, 0);
  const monthRevenue = monthSales.reduce((sum, sale) => sum + sale.total, 0);

  // Calculate store-specific metrics
  sales.forEach(sale => {
    if (storeMetrics[sale.storeId]) {
      storeMetrics[sale.storeId].revenue += sale.total;
      storeMetrics[sale.storeId].transactions += 1;
    }
  });

  // Calculate payment method distribution
  const paymentMethods = sales.reduce(
    (acc, sale) => {
      acc[sale.payment.method]++;
      return acc;
    },
    { cash: 0, card: 0, split: 0 } as Record<string, number>
  );

  // Calculate product metrics
  const productSales = new Map<string, { quantity: number; revenue: number }>();
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const existing = productSales.get(item.productId) || { quantity: 0, revenue: 0 };
      productSales.set(item.productId, {
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.price,
      });
    });
  });

  // Sort products by quantity and revenue
  const topByQuantity = Array.from(productSales.entries())
    .map(([productId, data]) => ({
      productId,
      productName: sales.find(sale => 
        sale.items.find(item => item.productId === productId)
      )?.items.find(item => item.productId === productId)?.productName || '',
      quantity: data.quantity,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const topByRevenue = Array.from(productSales.entries())
    .map(([productId, data]) => ({
      productId,
      productName: sales.find(sale => 
        sale.items.find(item => item.productId === productId)
      )?.items.find(item => item.productId === productId)?.productName || '',
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Calculate growth metrics
  const dailyGrowth = yesterdayRevenue > 0 
    ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
    : 0;

  // Calculate discount metrics
  const totalDiscounts = sales.reduce(
    (sum, sale) => sum + sale.itemDiscounts + (sale.totalDiscount?.amount || 0),
    0
  );
  const salesWithDiscount = sales.filter(
    sale => sale.itemDiscounts > 0 || sale.totalDiscount
  ).length;

  return {
    revenue: {
      total: totalRevenue,
      today: todayRevenue,
      thisWeek: weekRevenue,
      thisMonth: monthRevenue,
      byStore: Object.fromEntries(
        Object.entries(storeMetrics).map(([id, data]) => [id, data.revenue])
      ),
    },
    transactions: {
      total: sales.length,
      today: todaySales.length,
      thisWeek: weekSales.length,
      thisMonth: monthSales.length,
      byStore: Object.fromEntries(
        Object.entries(storeMetrics).map(([id, data]) => [id, data.transactions])
      ),
    },
    averageBasket: {
      total: totalRevenue / (sales.length || 1),
      today: todayRevenue / (todaySales.length || 1),
      byStore: Object.fromEntries(
        Object.entries(storeMetrics).map(([id, data]) => [
          id,
          data.revenue / (data.transactions || 1),
        ])
      ),
    },
    growth: {
      dailyGrowth,
      weeklyGrowth: 0, // Calculate based on previous week
      monthlyGrowth: 0, // Calculate based on previous month
    },
    discounts: {
      totalAmount: totalDiscounts,
      percentageOfSales: (salesWithDiscount / sales.length) * 100,
    },
    paymentMethods: {
      cash: (paymentMethods.cash / sales.length) * 100,
      card: (paymentMethods.card / sales.length) * 100,
      split: (paymentMethods.split / sales.length) * 100,
    },
    products: {
      topByQuantity,
      topByRevenue,
      dormant: [], // Calculate based on product inventory and last sale date
    },
    crossSelling: [], // Calculate based on items frequently bought together
    stores: {
      revenueByStore: Object.fromEntries(
        Object.entries(storeMetrics).map(([id, data]) => [id, data.revenue])
      ),
      averageBasketByStore: Object.fromEntries(
        Object.entries(storeMetrics).map(([id, data]) => [
          id,
          data.revenue / (data.transactions || 1),
        ])
      ),
      topProductsByStore: {},
    },
    inventory: {
      stockTurnover: 0, // Calculate based on average inventory value
      lowStockProducts: [], // Calculate based on current stock levels and sales velocity
      salesHistory: {},
    },
    customers: sales.some(sale => sale.customerId)
      ? {
          recurring: 0, // Calculate based on customer purchase history
          new: 0,
          averageBasketRecurring: 0,
          averageBasketNew: 0,
          averagePurchaseFrequency: 0,
        }
      : undefined,
  };
}