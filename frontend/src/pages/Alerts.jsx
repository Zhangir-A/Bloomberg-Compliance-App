import React from 'react';
import { Link } from 'react-router-dom';
import AlertFeed from '../components/AlertFeed';

export default function Alerts() {
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Adverse Media Alerts
          </h1>
          <p className="text-gray-600 mb-6">
            Monitor news, regulatory actions, and compliance alerts related to Kazakhstan
          </p>

          <AlertFeed />
        </div>
      </div>
    </div>
  );
}
