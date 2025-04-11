import { Store, Product, Category } from './types';

export const stores: Store[] = [
  {
    id: 'store1',
    name: 'CBD Wellness Bondues',
    address: '123 Rue Principale, Centre-ville',
    phone: '555-0123',
    email: 'centreville@cbdwellness.com',
    vatNumber: 'TVA123456789',
    currency: 'EUR',
    createdAt: new Date('2023-01-01'),
  },
  {
    id: 'store2',
    name: 'CBD Wellness Comines',
    address: '456 Avenue du Parc, Quartier Nord',
    phone: '555-0456',
    email: 'nord@cbdwellness.com',
    vatNumber: 'TVA987654321',
    currency: 'EUR',
    createdAt: new Date('2023-06-01'),
  },
];

export const categories: Category[] = [
  { id: 'huiles', name: 'Huiles CBD', isBulk: false, defaultVatRate: 20 },
  { id: 'comestibles', name: 'Comestibles', isBulk: false, defaultVatRate: 20 },
  { id: 'topiques', name: 'Topiques', isBulk: false, defaultVatRate: 20 },
  { id: 'fleurs', name: 'Fleurs', isBulk: true, defaultUnit: 'g', defaultVatRate: 20 },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Huile CBD Spectre Complet',
    price: 49.99,
    category: 'huiles',
    stockQuantity: 50,
    vatRate: 20
  },
  {
    id: '2',
    name: 'Bonbons au CBD',
    price: 29.99,
    category: 'comestibles',
    stockQuantity: 100,
    vatRate: 20
  },
  {
    id: '3',
    name: 'Crème Anti-douleur',
    price: 39.99,
    category: 'topiques',
    stockQuantity: 30,
    vatRate: 20
  },
  {
    id: '4',
    name: 'Fleur de Chanvre Premium',
    price: null,
    category: 'fleurs',
    stockQuantity: 1000,
    unitSize: 'g',
    vatRate: 20
  },
];