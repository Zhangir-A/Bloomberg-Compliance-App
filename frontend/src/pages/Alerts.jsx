import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertFeed from '../components/AlertFeed';

export default function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Adverse Media Alerts
        </h1>

        <AlertFeed alerts={alerts} />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-blue-800">
            Alerts module coming in Milestone 4 (Weeks 7-8)
          </p>
        </div>
      </div>
    </div>
  );
}
