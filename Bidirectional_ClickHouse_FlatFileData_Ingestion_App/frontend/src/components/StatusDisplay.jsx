import React from 'react';

function StatusDisplay({ status }) {
  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return 'Ready to connect';
      case 'connecting':
        return 'Connecting to source...';
      case 'connected':
        return 'Connected. Select table or columns';
      case 'fetching':
        return 'Fetching schema...';
      case 'ready':
        return 'Ready to proceed';
      case 'previewing':
        return 'Loading data preview...';
      case 'ingesting':
        return 'Ingesting data...';
      case 'completed':
        return 'Ingestion completed successfully';
      case 'error':
        return 'Error occurred';
      default:
        return 'Unknown status';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'completed':
        return 'bg-success';
      case 'error':
        return 'bg-danger';
      case 'connecting':
      case 'fetching':
      case 'ingesting':
      case 'previewing':
        return 'bg-warning';
      default:
        return 'bg-info';
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-header">
        <h3>Status</h3>
      </div>
      <div className="card-body">
        <div className={`alert ${getStatusClass()}`}>
          {getStatusText()}
          {(status === 'connecting' || status === 'fetching' || status === 'ingesting' || status === 'previewing') && (
            <div className="progress mt-2">
              <div 
                className="progress-bar progress-bar-striped progress-bar-animated" 
                role="progressbar" 
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatusDisplay;