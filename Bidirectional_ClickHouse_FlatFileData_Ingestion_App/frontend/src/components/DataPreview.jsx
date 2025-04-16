import React from 'react';

function DataPreview({ data }) {
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="card mb-3">
        <div className="card-header">
          <h3>Data Preview</h3>
        </div>
        <div className="card-body">
          <p>No data to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-3">
      <div className="card-header">
        <h3>Data Preview (First 100 Records)</h3>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                {data.headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.data.map((row, index) => (
                <tr key={index}>
                  {data.headers.map((header) => (
                    <td key={`${index}-${header}`}>
                      {row[header] !== null && row[header] !== undefined 
                        ? String(row[header]) 
                        : 'NULL'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DataPreview;