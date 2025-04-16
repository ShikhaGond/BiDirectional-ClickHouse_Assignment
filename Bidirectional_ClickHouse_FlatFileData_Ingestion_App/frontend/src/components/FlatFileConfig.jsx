import React from 'react';

function FlatFileConfig({ config, onChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...config,
      [name]: value
    });
  };

  return (
    <div className="card mb-3">
      <div className="card-header">
        <h3>Flat File Configuration</h3>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label htmlFor="file_path" className="form-label">File Path</label>
          <input
            type="text"
            className="form-control"
            id="file_path"
            name="file_path"
            value={config.file_path}
            onChange={handleChange}
            placeholder="/path/to/file.csv"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="delimiter" className="form-label">Delimiter</label>
          <input
            type="text"
            className="form-control"
            id="delimiter"
            name="delimiter"
            value={config.delimiter}
            onChange={handleChange}
            placeholder=","
          />
        </div>
      </div>
    </div>
  );
}

export default FlatFileConfig;