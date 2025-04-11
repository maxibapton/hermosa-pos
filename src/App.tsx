import React, { useState, useEffect } from 'react';
import { Logo } from './components/Logo';
import { ProductGrid } from './components/ProductGrid';
import { Cart } from './components/Cart';
import { CategoryFilter } from './components/CategoryFilter';
import { AdminPanel } from './components/AdminPanel';
import { CategoryManagement } from './components/CategoryManagement';
import { CustomerManagement } from './components/CustomerManagement';
import SalesHistory from './components/SalesHistory';
import { Sidebar } from './components/Sidebar';
import { StoreSelector } from './components/StoreSelector';
import { StoreManagement } from './components/StoreManagement';
import { StockManagement } from './components/StockManagement';
import { products as initialProducts, categories as initialCategories, stores as initialStores } from './data';
import { CartItem, Product, ProductFormData, SaleRecord, Category, Customer, CustomerFormData, PaymentInfo, Store } from './types';
import { checkLowStock } from './utils/stockCheck';

function App() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [selectedStore, setSelectedStore] = useState<Store>(stores[0]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'register' | 'catalog' | 'sales' | 'customers' | 'stores' | 'stock'>('register');
  const [catalogSection, setCatalogSection] = useState<'products' | 'categories'>('products');
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    // Check stock levels every hour
    const checkStock = async () => {
      await checkLowStock();
    };

    // Initial check
    checkStock();

    // Set up interval
    const interval = setInterval(checkStock, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = (product: Product, quantity: number, price: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      const newItem: CartItem = {
        ...product,
        quantity,
        price: price * quantity,
        vatAmount: (price * quantity) * (product.vatRate / 100)
      };

      return [...prevItems, newItem];
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const basePrice = item.price / item.quantity;
          const newPrice = basePrice * quantity;
          return {
            ...item,
            quantity: Math.max(0, quantity),
            price: newPrice,
            vatAmount: newPrice * (item.vatRate / 100),
            ...(item.discount && {
              discount: {
                ...item.discount,
                amount: item.discount.type === 'percentage' 
                  ? newPrice * (item.discount.value / 100)
                  : item.discount.value
              }
            })
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const handleCheckout = (customerId: string | undefined, payment: PaymentInfo, totalDiscount?: { type: 'percentage' | 'fixed'; value: number; amount: number }) => {
    const newSale: SaleRecord = {
      id: Math.random().toString(36).substr(2, 9),
      storeId: selectedStore.id,
      date: new Date(),
      customerId,
      customerName: customerId ? customers.find(c => c.id === customerId)?.firstName + ' ' + customers.find(c => c.id === customerId)?.lastName : undefined,
      payment,
      items: cartItems.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        vatRate: item.vatRate,
        vatAmount: item.vatAmount || 0,
        discount: item.discount,
        unitSize: item.unitSize
      })),
      subtotal: cartItems.reduce((sum, item) => sum + item.price, 0),
      itemDiscounts: cartItems.reduce((sum, item) => sum + (item.discount?.amount || 0), 0),
      totalDiscount,
      totalVat: cartItems.reduce((sum, item) => sum + (item.vatAmount || 0), 0),
      total: cartItems.reduce((sum, item) => sum + item.price - (item.discount?.amount || 0), 0) - (totalDiscount?.amount || 0)
    };
    
    setSalesHistory(prev => [...prev, newSale]);
    setCartItems([]);

    if (customerId) {
      setCustomers(prev => prev.map(customer => 
        customer.id === customerId
          ? {
              ...customer,
              lastPurchase: new Date(),
              totalPurchases: customer.totalPurchases + 1
            }
          : customer
      ));
    }

    setProducts(prev => prev.map(product => {
      const cartItem = cartItems.find(item => item.id === product.id);
      if (cartItem) {
        return {
          ...product,
          stockQuantity: product.stockQuantity - cartItem.quantity
        };
      }
      return product;
    }));
  };

  const handleAddProduct = (productData: ProductFormData) => {
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: productData.name,
      price: productData.price,
      category: productData.category,
      stockQuantity: productData.stockQuantity,
      unitSize: productData.unitSize,
      vatRate: productData.vatRate
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const handleUpdateProduct = (id: string, productData: ProductFormData) => {
    setProducts(prev => prev.map(product => 
      product.id === id
        ? { ...product, ...productData }
        : product
    ));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const handleAddCustomer = (customer: CustomerFormData) => {
    const newCustomer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      ...customer,
      createdAt: new Date(),
      totalPurchases: 0
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const handleUpdateCustomer = (id: string, customer: CustomerFormData) => {
    setCustomers(prev => prev.map(c => 
      c.id === id
        ? { ...c, ...customer }
        : c
    ));
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  const handleImportCustomers = (importedCustomers: Customer[]) => {
    setCustomers(prev => [...prev, ...importedCustomers]);
  };

  const handleApplyDiscount = (id: string, discount: { type: 'percentage' | 'fixed'; value: number }) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const discountAmount = discount.type === 'percentage'
            ? item.price * (discount.value / 100)
            : Math.min(discount.value, item.price);
          
          return {
            ...item,
            discount: {
              type: discount.type,
              value: discount.value,
              amount: discountAmount
            }
          };
        }
        return item;
      })
    );
  };

  const handleRemoveDiscount = (id: string) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, discount: undefined } 
          : item
      )
    );
  };

  const handleRefundSale = (saleId: string, reason: string) => {
    setSalesHistory(prev => prev.map(sale => 
      sale.id === saleId
        ? { ...sale, refunded: true, refundDate: new Date(), refundReason: reason }
        : sale
    ));
  };

  const handleAddStore = (storeData: Omit<Store, 'id' | 'createdAt'>) => {
    const newStore: Store = {
      ...storeData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setStores(prev => [...prev, newStore]);
  };

  const handleUpdateStore = (id: string, storeData: Omit<Store, 'id' | 'createdAt'>) => {
    setStores(prev =>
      prev.map(store =>
        store.id === id
          ? { ...store, ...storeData }
          : store
      )
    );
  };

  const handleDeleteStore = (id: string) => {
    if (stores.length <= 1) {
      alert('Cannot delete the last store');
      return;
    }
    if (selectedStore.id === id) {
      const remainingStore = stores.find(s => s.id !== id);
      if (remainingStore) {
        setSelectedStore(remainingStore);
      }
    }
    setStores(prev => prev.filter(store => store.id !== id));
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="flex-1">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4">
            <div className="flex items-center gap-4">
              <Logo />
            </div>
          </div>
          {activeSection !== 'stores' && (
            <StoreSelector
              stores={stores}
              selectedStore={selectedStore}
              onSelectStore={setSelectedStore}
            />
          )}
        </header>

        <main className="p-6">
          {activeSection === 'register' && (
            <div className="grid grid-cols-[65%_35%] gap-6">
              <div>
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
                <ProductGrid
                  products={selectedCategory
                    ? products.filter(p => p.category === selectedCategory)
                    : products}
                  categories={categories}
                  onAddToCart={handleAddToCart}
                />
              </div>
              <div>
                <Cart
                  items={cartItems}
                  customers={customers}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onCheckout={handleCheckout}
                  onAddCustomer={handleAddCustomer}
                  onApplyDiscount={handleApplyDiscount}
                  onRemoveDiscount={handleRemoveDiscount}
                />
              </div>
            </div>
          )}

          {activeSection === 'catalog' && (
            <>
              <div className="mb-6 flex gap-4">
                <button
                  onClick={() => setCatalogSection('products')}
                  className={`px-4 py-2 rounded-lg ${
                    catalogSection === 'products'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Produits
                </button>
                <button
                  onClick={() => setCatalogSection('categories')}
                  className={`px-4 py-2 rounded-lg ${
                    catalogSection === 'categories'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Catégories
                </button>
              </div>
              
              {catalogSection === 'products' && (
                <AdminPanel
                  products={products}
                  categories={categories}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}
              {catalogSection === 'categories' && (
                <CategoryManagement
                  categories={categories}
                  onUpdateCategories={setCategories}
                />
              )}
            </>
          )}

          {activeSection === 'customers' && (
            <CustomerManagement
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onImportCustomers={handleImportCustomers}
            />
          )}

          {activeSection === 'sales' && (
            <SalesHistory 
              sales={salesHistory}
              stores={stores}
              onRefundSale={handleRefundSale}
            />
          )}

          {activeSection === 'stores' && (
            <StoreManagement
              stores={stores}
              selectedStore={selectedStore}
              onAddStore={handleAddStore}
              onUpdateStore={handleUpdateStore}
              onDeleteStore={handleDeleteStore}
              onSelectStore={setSelectedStore}
            />
          )}

          {activeSection === 'stock' && (
            <StockManagement
              products={products}
              categories={categories}
              onUpdateProduct={handleUpdateProduct}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;