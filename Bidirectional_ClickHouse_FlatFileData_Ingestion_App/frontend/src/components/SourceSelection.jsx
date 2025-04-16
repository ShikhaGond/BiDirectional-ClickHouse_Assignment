import React from 'react';

function SourceSelection({ sourceType, targetType, onSourceChange }) {
  return (
    <div className="card mb-3">
      <div className="card-header">
        <h2>Data Flow Direction</h2>
      </div>
      <div className="card-body">
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="sourceType"
            id="clickhouseToFlatFile"
            checked={sourceType === 'clickhouse'}
            onChange={() => onSourceChange('clickhouse')}
          />
          <label className="form-check-label" htmlFor="clickhouseToFlatFile">
            ClickHouse → Flat File
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="sourceType"
            id="flatFileToClickhouse"
            checked={sourceType === 'flat_file'}
            onChange={() => onSourceChange('flat_file')}
          />
          <label className="form-check-label" htmlFor="flatFileToClickhouse">
            Flat File → ClickHouse
          </label>
        </div>
      </div>
    </div>
  );
}

export default SourceSelection;
