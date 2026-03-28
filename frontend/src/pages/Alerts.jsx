import React from 'react';
import NavBar from '../components/NavBar';
import AlertFeed from '../components/AlertFeed';

export default function Alerts() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

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
