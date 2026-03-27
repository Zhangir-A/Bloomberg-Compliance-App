import React, { useState } from 'react';
import client from '../api/client';

export default function ScreeningForm({ onResults }) {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    nationality: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await client.post('/screen', {
        name: formData.name,
        dob: formData.dob || null,
        nationality: formData.nationality || null,
      });

      onResults(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Screening failed';
      setError(errorMessage);
      console.error('Screening error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Screening Form
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Alimov Nurlan"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nationality
            </label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              placeholder="e.g., KZ"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Screening...' : 'Screen'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
    </div>
  );
}
