import React from 'react';

function ColumnSelection({ columns, selectedColumns, onColumnsSelect }) {
  const handleSelectAll = () => {
    if (selectedColumns.length === columns.length) {
      onColumnsSelect([]);
    } else {
      onColumnsSelect(columns.map(col => col.name));
    }
  };

  const handleColumnToggle = (columnName) => {
    if (selectedColumns.includes(columnName)) {
      onColumnsSelect(selectedColumns.filter(col => col !== columnName));
    } else {
      onColumnsSelect([...selectedColumns, columnName]);
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-header">
        <h3>Column Selection</h3>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <button 
            className="btn btn-outline-primary mb-3"
            onClick={handleSelectAll}
          >
            {selectedColumns.length === columns.length ? 'Deselect All' : 'Select All'}
          </button>
          
          <div className="row">
            {columns.map((column) => (
              <div className="col-md-4 mb-2" key={column.name}>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`col-${column.name}`}
                    checked={selectedColumns.includes(column.name)}
                    onChange={() => handleColumnToggle(column.name)}
                  />
                  <label className="form-check-label" htmlFor={`col-${column.name}`}>
                    {column.name} <span className="text-muted">({column.type})</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ColumnSelection;
