import React from 'react';

function ActionPanel({ onPreview, onStartIngestion, disabled }) {
  return (
    <div className="card mb-3">
      <div className="card-header">
        <h3>Actions</h3>
      </div>
      <div className="card-body">
        <div className="d-flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={onPreview}
            disabled={disabled}
          >
            Preview Data (First 100 Records)
          </button>
          <button
            className="btn btn-success"
            onClick={onStartIngestion}
            disabled={disabled}
          >
            Start Ingestion
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActionPanel;
