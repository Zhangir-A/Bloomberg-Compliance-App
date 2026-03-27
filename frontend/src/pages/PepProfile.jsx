import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function PepProfile() {
  const { pepId } = useParams();
  const navigate = useNavigate();

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
          PEP Profile: {pepId}
        </h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            PEP detail page coming in Milestone 3 (Weeks 5-6)
          </p>
        </div>
      </div>
    </div>
  );
}
