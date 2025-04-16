import React from 'react';

function TableSelection({ tables, selectedTable, onTableSelect }) {
  return (
    <div className="card mb-3">
      <div className="card-header">
        <h3>Table Selection</h3>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label htmlFor="tableSelect" className="form-label">Select Table</label>
          <select
            className="form-select"
            id="tableSelect"
            value={selectedTable}
            onChange={(e) => onTableSelect(e.target.value)}
          >
            <option value="">-- Select a table --</option>
            {tables.map((table) => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default TableSelection;