import React from 'react';

export default function AlertFeed({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">
          No alerts to display. Module coming in Milestone 4.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div key={alert.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900">{alert.headline}</h3>
            <span className="text-xs text-gray-500">
              {new Date(alert.date).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{alert.summary}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">
              {alert.source}
            </span>
            {alert.category && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {alert.category}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
