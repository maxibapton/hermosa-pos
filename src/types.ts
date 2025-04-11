// Add new types for analytics
export interface SalesMetrics {
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byStore: Record<string, number>;
  };
  transactions: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byStore: Record<string, number>;
  };
  averageBasket: {
    total: number;
    today: number;
    byStore: Record<string, number>;
  };
  growth: {
    dailyGrowth: number;
    weeklyGrowth: number;
    monthlyGrowth: number;
  };
  discounts: {
    totalAmount: number;
    percentageOfSales: number;
  };
  paymentMethods: {
    cash: number;
    card: number;
    split: number;
  };
  products: {
    topByQuantity: Array<{
      productId: string;
      productName: string;
      quantity: number;
    }>;
    topByRevenue: Array<{
      productId: string;
      productName: string;
      revenue: number;
    }>;
    dormant: Array<{
      productId: string;
      productName: string;
      lastSoldDate: Date;
      daysInStock: number;
    }>;
  };
  crossSelling: Array<{
    product1Id: string;
    product2Id: string;
    frequency: number;
  }>;
  margins?: {
    byProduct: Record<string, number>;
    byCategory: Record<string, number>;
    byStore: Record<string, number>;
  };
  staff?: {
    revenueByStaff: Record<string, number>;
    ticketsByStaff: Record<string, number>;
    averageBasketByStaff: Record<string, number>;
  };
  stores: {
    revenueByStore: Record<string, number>;
    averageBasketByStore: Record<string, number>;
    topProductsByStore: Record<string, Array<{
      productId: string;
      productName: string;
      quantity: number;
      revenue: number;
    }>>;
  };
  inventory: {
    stockTurnover: number;
    lowStockProducts: Array<{
      productId: string;
      productName: string;
      currentStock: number;
      averageDailySales: number;
    }>;
    salesHistory: Record<string, Array<{
      date: Date;
      quantity: number;
      revenue: number;
    }>>;
  };
  customers?: {
    recurring: number;
    new: number;
    averageBasketRecurring: number;
    averageBasketNew: number;
    averagePurchaseFrequency: number;
  };
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  vatNumber?: string;
  currency: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number | null;
  category: string;
  stockQuantity: number;
  unitSize?: string;
  vatRate: number;
}

export interface CartItem extends Product {
  quantity: number;
  price: number;
  vatAmount?: number;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    amount: number;
  };
}

export interface Category {
  id: string;
  name: string;
  isBulk: boolean;
  defaultUnit?: string;
  defaultVatRate?: number;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  lastPurchase?: Date;
  totalPurchases: number;
}

export interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface PaymentInfo {
  method: 'cash' | 'card' | 'split';
  cashAmount?: number;
  cardAmount?: number;
}

export interface SaleRecord {
  id: string;
  storeId: string;
  date: Date;
  customerId?: string;
  customerName?: string;
  payment: PaymentInfo;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    vatRate: number;
    vatAmount: number;
    discount?: {
      type: 'percentage' | 'fixed';
      value: number;
      amount: number;
    };
    unitSize?: string;
  }[];
  subtotal: number;
  itemDiscounts: number;
  totalDiscount?: {
    type: 'percentage' | 'fixed';
    value: number;
    amount: number;
  };
  totalVat: number;
  total: number;
  refunded?: boolean;
  refundDate?: Date;
  refundReason?: string;
}