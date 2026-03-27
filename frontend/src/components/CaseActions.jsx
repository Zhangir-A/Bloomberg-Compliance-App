import React, { useState } from 'react';

export default function CaseActions({ matchId }) {
  const [decision, setDecision] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (value) => {
    setDecision(value);
    // POST to /api/v1/case will be implemented in M5
    console.log('Case decision:', {
      matchId,
      decision: value,
      notes,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <span className="text-sm text-green-600 font-medium">
        ✓ {decision === 'true_positive' ? 'Confirmed' : decision === 'false_positive' ? 'False Positive' : 'Needs Review'}
      </span>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleSubmit('true_positive')}
        className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
        title="Mark as confirmed hit"
      >
        ✓ Hit
      </button>
      <button
        onClick={() => handleSubmit('false_positive')}
        className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
        title="Mark as false positive"
      >
        ✗ FP
      </button>
      <button
        onClick={() => handleSubmit('needs_review')}
        className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded hover:bg-yellow-200"
        title="Mark for review"
      >
        ? Review
      </button>
    </div>
  );
}
