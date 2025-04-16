import React from 'react';

function ResultDisplay({ result }) {
  if (!result) return null;

  if (result.error) {
    return (
      <div className="card mb-3 border-danger">
        <div className="card-header bg-danger text-white">
          <h3>Error</h3>
        </div>
        <div className="card-body">
          <p className="text-danger">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-3 border-success">
      <div className="card-header bg-success text-white">
        <h3>Success</h3>
      </div>
      <div className="card-body">
        <p><strong>Records Processed:</strong> {result.records_processed}</p>
        {result.message && <p>{result.message}</p>}
      </div>
    </div>
  );
}

export default ResultDisplay;