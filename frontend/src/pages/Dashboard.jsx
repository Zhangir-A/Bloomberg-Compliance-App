import React, { useEffect, useState } from 'react';
import client from '../api/client';
import NavBar from '../components/NavBar';
import ScreeningForm from '../components/ScreeningForm';
import ResultsTable from '../components/ResultsTable';

export default function Dashboard() {
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [screeningResults, setScreeningResults] = useState(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const response = await client.get('/health');
      setDbStatus(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend');
      setDbStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleScreening = (results) => {
    setScreeningResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CARIP Dashboard
          </h1>
          <p className="text-gray-600">
            Central Asia Risk Intelligence Platform
          </p>
        </div>

        {/* Health Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            System Status
          </h2>
          {loading ? (
            <div className="text-gray-500">Checking connection...</div>
          ) : error ? (
            <div className="text-red-600">
              ✗ Connection Failed: {error}
            </div>
          ) : dbStatus ? (
            <div>
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-2xl">✓</span>
                <div>
                  <p className="text-gray-900 font-medium">Backend Connected</p>
                  <p className="text-sm text-gray-500">
                    DB: {dbStatus.db} | Updated: {new Date(dbStatus.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          <button
            onClick={checkHealth}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:opacity-90"
          >
            Refresh Status
          </button>
        </div>

        {/* Screening Form */}
        {dbStatus?.db === 'connected' && (
          <>
            <ScreeningForm onResults={handleScreening} />
            {screeningResults && (
              <ResultsTable results={screeningResults} />
            )}
          </>
        )}

        {/* Not Connected Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              Backend is not available. Please ensure the server is running on port 3000.
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
