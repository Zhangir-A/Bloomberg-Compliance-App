import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AlertFeed from '../components/AlertFeed';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">CARIP</h1>
          <div className="flex gap-6">
            <Link to="/" className="text-gray-700 hover:text-primary font-medium">
              Dashboard
            </Link>
            <Link to="/alerts" className="text-gray-700 hover:text-primary font-medium font-bold">
              Alerts
            </Link>
            <Link to="/pep/PEP-KZ-00001" className="text-gray-700 hover:text-primary font-medium">
              Sample PEP Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto">

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
    </div>
  );
}
