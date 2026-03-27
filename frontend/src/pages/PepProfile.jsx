import React from 'react';
import { Link, useParams } from 'react-router-dom';

export default function PepProfile() {
  const { pepId } = useParams();

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
            <Link to="/alerts" className="text-gray-700 hover:text-primary font-medium">
              Alerts
            </Link>
            <Link to="/pep/PEP-KZ-00001" className="text-gray-700 hover:text-primary font-medium font-bold">
              Sample PEP Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          PEP Profile: {pepId}
        </h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            PEP detail page coming in Milestone 3 (Weeks 5-6)
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
