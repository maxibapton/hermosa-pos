import React from 'react';
import { SaleRecord } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryAnalyticsProps {
  sales: SaleRecord[];
}

export function CategoryAnalytics({ sales }: CategoryAnalyticsProps) {
  // Group sales by category
  const categoryData = sales.reduce((acc, sale) => {
    sale.items.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = {
          revenue: 0,
          quantity: 0,
          transactions: 0
        };
      }
      acc[category].revenue += item.price;
      acc[category].quantity += item.quantity;
      acc[category].transactions += 1;
    });
    return acc;
  }, {} as Record<string, { revenue: number; quantity: number; transactions: number }>);

  // Transform data for charts
  const chartData = Object.entries(categoryData).map(([category, data]) => ({
    name: category,
    revenue: Number(data.revenue.toFixed(2)),
    quantity: data.quantity,
    transactions: data.transactions
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-6">Analyse par Catégorie</h3>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" name="CA (€)" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="quantity" name="Quantité" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(categoryData).map(([category, data]) => (
          <div key={category} className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">{category}</h4>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">CA</span>
                <span className="font-medium">{data.revenue.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Quantité</span>
                <span className="font-medium">{data.quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Transactions</span>
                <span className="font-medium">{data.transactions}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}