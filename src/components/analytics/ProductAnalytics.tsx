import React from 'react';
import { SaleRecord } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ProductAnalyticsProps {
  sales: SaleRecord[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ProductAnalytics({ sales }: ProductAnalyticsProps) {
  // Group sales by product
  const productData = sales.reduce((acc, sale) => {
    sale.items.forEach(item => {
      if (!acc[item.productName]) {
        acc[item.productName] = {
          revenue: 0,
          quantity: 0,
          transactions: 0
        };
      }
      acc[item.productName].revenue += item.price;
      acc[item.productName].quantity += item.quantity;
      acc[item.productName].transactions += 1;
    });
    return acc;
  }, {} as Record<string, { revenue: number; quantity: number; transactions: number }>);

  // Sort products by revenue
  const topProducts = Object.entries(productData)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(([name, data]) => ({
      name,
      value: data.revenue,
      quantity: data.quantity,
      transactions: data.transactions
    }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-6">Top 5 Produits</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="CA (€)" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topProducts}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {topProducts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topProducts.map((product, index) => (
          <div key={product.name} className="bg-gray-50 p-4 rounded-lg border-l-4" style={{ borderColor: COLORS[index % COLORS.length] }}>
            <h4 className="font-medium text-gray-900">{product.name}</h4>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">CA</span>
                <span className="font-medium">{product.value.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Quantité</span>
                <span className="font-medium">{product.quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Transactions</span>
                <span className="font-medium">{product.transactions}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}