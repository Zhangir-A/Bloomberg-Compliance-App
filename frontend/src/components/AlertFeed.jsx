import React, { useState, useEffect, useRef } from 'react';
import client from '../api/client';

export default function AlertFeed({ initialAlerts }) {
  const [alerts, setAlerts] = useState(initialAlerts || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    date_from: '',
    date_to: '',
  });
  const [categories, setCategories] = useState([]);
  const isInitialMount = useRef(true);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
    fetchAlerts();
  }, []);

  // Fetch alerts when filters change (but skip initial render)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchAlerts();
  }, [filters]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      params.append('limit', 100);

      const response = await client.get(`/alerts?${params.toString()}`);
      setAlerts(response.data.alerts);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Alerts fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await client.get('/alerts/categories');
      setCategories(response.data.categories);
    } catch (err) {
      console.error('Categories fetch error:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Corruption': 'border-red-500 bg-red-50',
      'Fraud': 'border-orange-500 bg-orange-50',
      'Sanctions': 'border-purple-500 bg-purple-50',
      'Money Laundering': 'border-yellow-500 bg-yellow-50',
      'Tax Evasion': 'border-pink-500 bg-pink-50',
      'Misconduct': 'border-blue-500 bg-blue-50',
      'Organized Crime': 'border-red-700 bg-red-100',
      'Embezzlement': 'border-amber-500 bg-amber-50',
    };
    return colors[category] || 'border-gray-500 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading alerts...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Error: {error}
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          No alerts match your filters.
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Showing {alerts.length} alert(s)
          </p>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${getCategoryColor(
                alert.category
              )}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 flex-1">
                  {alert.headline}
                </h3>
                <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                  {new Date(alert.date).toLocaleDateString()}
                </span>
              </div>
              {alert.summary && (
                <p className="text-sm text-gray-600 mb-3">{alert.summary}</p>
              )}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">
                    {alert.source}
                  </span>
                  {alert.category && (
                    <span className="text-xs bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded">
                      {alert.category}
                    </span>
                  )}
                </div>
                {alert.url && (
                  <a
                    href={alert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Read more →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
