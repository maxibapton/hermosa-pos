import React, { useState } from 'react';
import { AppSettings } from '../types';
import { Save, Mail, Receipt, Settings as SettingsIcon } from 'lucide-react';

interface SettingsManagementProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export function SettingsManagement({ settings, onSaveSettings }: SettingsManagementProps) {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'email' | 'receipt' | 'general'>('email');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Application Settings</h2>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="border-b mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('email')}
                className={`px-4 py-2 border-b-2 transition-colors ${
                  activeTab === 'email'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail size={18} />
                  <span>Email Settings</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('receipt')}
                className={`px-4 py-2 border-b-2 transition-colors ${
                  activeTab === 'receipt'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Receipt size={18} />
                  <span>Receipt Settings</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('general')}
                className={`px-4 py-2 border-b-2 transition-colors ${
                  activeTab === 'general'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <SettingsIcon size={18} />
                  <span>General Settings</span>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Email
                  </label>
                  <input
                    type="email"
                    value={formData.emailSettings.fromEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emailSettings: {
                          ...formData.emailSettings,
                          fromEmail: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={formData.emailSettings.fromName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emailSettings: {
                          ...formData.emailSettings,
                          fromName: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brevo API Key
                  </label>
                  <input
                    type="password"
                    value={formData.emailSettings.brevoApiKey}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emailSettings: {
                          ...formData.emailSettings,
                          brevoApiKey: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brevo SMTP Key
                  </label>
                  <input
                    type="password"
                    value={formData.emailSettings.brevoSmtpKey}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emailSettings: {
                          ...formData.emailSettings,
                          brevoSmtpKey: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Receipt Settings */}
            {activeTab === 'receipt' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Header Text
                  </label>
                  <textarea
                    value={formData.receiptSettings.headerText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        receiptSettings: {
                          ...formData.receiptSettings,
                          headerText: e.target.value,
                        },
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Footer Text
                  </label>
                  <textarea
                    value={formData.receiptSettings.footerText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        receiptSettings: {
                          ...formData.receiptSettings,
                          footerText: e.target.value,
                        },
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.receiptSettings.showVatNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          receiptSettings: {
                            ...formData.receiptSettings,
                            showVatNumber: e.target.checked,
                          },
                        })
                      }
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Show VAT Number</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.receiptSettings.showStoreAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          receiptSettings: {
                            ...formData.receiptSettings,
                            showStoreAddress: e.target.checked,
                          },
                        })
                      }
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Show Store Address</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.receiptSettings.showStorePhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          receiptSettings: {
                            ...formData.receiptSettings,
                            showStorePhone: e.target.checked,
                          },
                        })
                      }
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Show Store Phone</span>
                  </label>
                </div>
              </div>
            )}

            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    value={formData.generalSettings.language}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        generalSettings: {
                          ...formData.generalSettings,
                          language: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.generalSettings.currency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        generalSettings: {
                          ...formData.generalSettings,
                          currency: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="EUR">EUR - Euro</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Format
                  </label>
                  <select
                    value={formData.generalSettings.dateFormat}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        generalSettings: {
                          ...formData.generalSettings,
                          dateFormat: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Format
                  </label>
                  <select
                    value={formData.generalSettings.timeFormat}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        generalSettings: {
                          ...formData.generalSettings,
                          timeFormat: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="24">24-hour</option>
                    <option value="12">12-hour</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}