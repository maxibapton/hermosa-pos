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

export interface AppSettings {
  emailSettings: {
    fromEmail: string;
    fromName: string;
    brevoApiKey: string;
    brevoSmtpKey: string;
  };
  receiptSettings: {
    headerText: string;
    footerText: string;
    showVatNumber: boolean;
    showStoreAddress: boolean;
    showStorePhone: boolean;
  };
  generalSettings: {
    language: string;
    currency: string;
    dateFormat: string;
    timeFormat: string;
  };
}