import React from 'react';
import ConfidenceBadge from './ConfidenceBadge';
import CaseActions from './CaseActions';

export default function ResultsTable({ results }) {
  if (!results || !results.results || results.results.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Results for: {results?.query}
        </h2>
        <p className="text-gray-600">
          {results?.message || 'No matches found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Results for: {results.query}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-2 px-3 font-semibold text-gray-700">
                Name
              </th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">
                Type
              </th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">
                Score
              </th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">
                Source
              </th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {results.results.map((result) => {
              // Determine source display based on result type
              let sourceDisplay = '';
              switch (result.sourceType) {
                case 'SANCTIONS':
                  sourceDisplay = result.listSource || '—';
                  break;
                case 'PEP':
                  sourceDisplay = result.organization || '—';
                  break;
                case 'ADVERSE_MEDIA':
                  sourceDisplay = result.source || '—';
                  break;
                default:
                  sourceDisplay = '—';
              }

              return (
                <tr key={result.match_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-3 text-gray-900">{result.name}</td>
                  <td className="py-3 px-3 text-gray-600">{result.sourceType}</td>
                  <td className="py-3 px-3">
                    <ConfidenceBadge score={result.score} />
                  </td>
                  <td className="py-3 px-3 text-gray-600">{sourceDisplay}</td>
                  <td className="py-3 px-3">
                    <CaseActions matchId={result.match_id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        Total matches: {results.results.length}
      </p>
    </div>
  );
}
