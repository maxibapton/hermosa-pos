import React, { useState } from 'react';
import { Category } from '../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface CategoryManagementProps {
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
}

export function CategoryManagement({ categories, onUpdateCategories }: CategoryManagementProps) {
  const [newCategory, setNewCategory] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [isBulk, setIsBulk] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editIsBulk, setEditIsBulk] = useState(false);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    const newId = Math.random().toString(36).substr(2, 9);
    onUpdateCategories([
      ...categories,
      {
        id: newId,
        name: newCategory.trim(),
        isBulk,
        ...(isBulk && newUnit ? { defaultUnit: newUnit } : {}),
      },
    ]);
    setNewCategory('');
    setNewUnit('');
    setIsBulk(false);
  };

  const handleUpdateCategory = (id: string) => {
    if (!editName.trim()) return;
    onUpdateCategories(
      categories.map((cat) =>
        cat.id === id
          ? {
              ...cat,
              name: editName.trim(),
              isBulk: editIsBulk,
              ...(editIsBulk && editUnit ? { defaultUnit: editUnit } : {}),
            }
          : cat
      )
    );
    setEditingId(null);
    setEditName('');
    setEditUnit('');
    setEditIsBulk(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      onUpdateCategories(categories.filter((cat) => cat.id !== id));
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditUnit(category.defaultUnit || '');
    setEditIsBulk(category.isBulk);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Category Management</h2>

      <form onSubmit={handleAddCategory} className="mb-8 bg-slate-50 p-4 rounded-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isBulk}
                onChange={(e) => setIsBulk(e.target.checked)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>Bulk Category (sold by weight/volume)</span>
            </label>
          </div>

          {isBulk && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Unit (e.g., g, ml)
              </label>
              <input
                type="text"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                placeholder="Enter unit"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
          >
            {editingId === category.id ? (
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editIsBulk}
                      onChange={(e) => setEditIsBulk(e.target.checked)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Bulk Category</span>
                  </label>
                </div>

                {editIsBulk && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Unit
                    </label>
                    <input
                      type="text"
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateCategory(category.id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-lg">{category.name}</span>
                  {category.isBulk && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Bulk ({category.defaultUnit})
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(category)}
                    className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-full"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}