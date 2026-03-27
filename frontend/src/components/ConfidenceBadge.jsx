import React from 'react';

export default function ConfidenceBadge({ score }) {
  let label = '';
  let bgColor = '';
  let textColor = '';

  if (score === 100) {
    label = 'Exact Match';
    bgColor = 'bg-red-100';
    textColor = 'text-red-700';
  } else if (score >= 85) {
    label = 'High Confidence';
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-700';
  } else if (score >= 70) {
    label = 'Medium Confidence';
    bgColor = 'bg-yellow-50';
    textColor = 'text-yellow-600';
  } else if (score >= 50) {
    label = 'Low Confidence';
    bgColor = 'bg-green-50';
    textColor = 'text-green-600';
  } else {
    label = 'No Match';
    bgColor = 'bg-gray-100';
    textColor = 'text-gray-600';
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor}`}>
      {label} ({score}%)
    </span>
  );
}
