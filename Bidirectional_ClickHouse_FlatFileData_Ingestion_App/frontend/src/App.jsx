import React, { useState } from 'react';
import './App.css';
import SourceSelection from './components/SourceSelection';
import ClickHouseConfig from './components/ClickHouseConfig';
import FlatFileConfig from './components/FlatFileConfig';
import TableSelection from './components/TableSelection';
import ColumnSelection from './components/ColumnSelection';
import ActionPanel from './components/ActionPanel';
import StatusDisplay from './components/StatusDisplay';
import ResultDisplay from './components/ResultDisplay';
import DataPreview from './components/DataPreview';
import MultiTableJoin from './components/MultiTableJoin';

function App() {
  const [sourceType, setSourceType] = useState('clickhouse');
  const [targetType, setTargetType] = useState('flat_file');
  const [clickHouseConfig, setClickHouseConfig] = useState({
    host: '',
    port: '8443',
    database: '',
    user: '',
    jwt_token: ''
  });
  const [flatFileConfig, setFlatFileConfig] = useState({
    file_path: '',
    delimiter: ','
  });
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [availableColumns, setAvailableColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [multiTableJoin, setMultiTableJoin] = useState({
    enabled: false,
    tables: [],
    joinConditions: []
  });

  const handleSourceChange = (type) => {
    setSourceType(type);
    // If source is clickhouse, target must be flat_file and vice versa
    setTargetType(type === 'clickhouse' ? 'flat_file' : 'clickhouse');
    // Reset other state values
    setAvailableTables([]);
    setSelectedTable('');
    setAvailableColumns([]);
    setSelectedColumns([]);
    setStatus('idle');
    setResult(null);
    setPreviewData(null);
    setShowPreview(false);
  };

  const handleClickHouseConfigChange = (config) => {
    setClickHouseConfig(config);
  };

  const handleFlatFileConfigChange = (config) => {
    setFlatFileConfig(config);
  };

  const handleConnect = async () => {
    setStatus('connecting');
    setResult(null);
    
    try {
      if (sourceType === 'clickhouse') {
        const response = await fetch('http://localhost:5000/connect-clickhouse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(clickHouseConfig)
        });
        
        const data = await response.json();
        
        if (data.success) {
          setAvailableTables(data.tables);
          setStatus('connected');
        } else {
          setStatus('error');
          setResult({ error: data.error });
        }
      } else if (sourceType === 'flat_file') {
        const response = await fetch('http://localhost:5000/get-flat-file-schema', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(flatFileConfig)
        });
        
        const data = await response.json();
        
        if (data.success) {
          setAvailableColumns(data.columns);
          setStatus('connected');
        } else {
          setStatus('error');
          setResult({ error: data.error });
        }
      }
    } catch (error) {
      setStatus('error');
      setResult({ error: error.message });
    }
  };

  const handleTableSelect = async (table) => {
    setSelectedTable(table);
    setStatus('fetching');
    
    try {
      const response = await fetch('http://localhost:5000/get-table-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...clickHouseConfig,
          table
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAvailableColumns(data.columns);
        setStatus('ready');
      } else {
        setStatus('error');
        setResult({ error: data.error });
      }
    } catch (error) {
      setStatus('error');
      setResult({ error: error.message });
    }
  };

  const handleColumnsSelect = (columns) => {
    setSelectedColumns(columns);
  };

  const handlePreview = async () => {
    setStatus('previewing');
    
    try {
      const response = await fetch('http://localhost:5000/preview-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_type: sourceType,
          ...(sourceType === 'clickhouse' ? {
            ...clickHouseConfig,
            table: selectedTable,
            selected_columns: selectedColumns
          } : {
            ...flatFileConfig,
            selected_columns: selectedColumns
          })
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPreviewData(data);
        setShowPreview(true);
        setStatus('ready');
      } else {
        setStatus('error');
        setResult({ error: data.error });
      }
    } catch (error) {
      setStatus('error');
      setResult({ error: error.message });
    }
  };

  const handleStartIngestion = async () => {
    setStatus('ingesting');
    setResult(null);
    
    try {
      let endpoint;
      let requestBody = {};
      
      if (sourceType === 'clickhouse' && targetType === 'flat_file') {
        endpoint = '/clickhouse-to-flat-file';
        requestBody = {
          ...clickHouseConfig,
          table: selectedTable,
          file_path: flatFileConfig.file_path,
          delimiter: flatFileConfig.delimiter,
          selected_columns: selectedColumns
        };
      } else if (sourceType === 'flat_file' && targetType === 'clickhouse') {
        endpoint = '/flat-file-to-clickhouse';
        requestBody = {
          ...clickHouseConfig,
          table: selectedTable || 'imported_data', // Default table name if not specified
          file_path: flatFileConfig.file_path,
          delimiter: flatFileConfig.delimiter,
          selected_columns: selectedColumns
        };
      }
      
      // Handle multi-table join
      if (multiTableJoin.enabled && sourceType === 'clickhouse') {
        endpoint = '/multi-table-join';
        requestBody = {
          ...clickHouseConfig,
          tables: multiTableJoin.tables,
          join_conditions: multiTableJoin.joinConditions,
          file_path: flatFileConfig.file_path,
          delimiter: flatFileConfig.delimiter,
          selected_columns: selectedColumns
        };
      }
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus('completed');
        setResult(data);
      } else {
        setStatus('error');
        setResult({ error: data.error });
      }
    } catch (error) {
      setStatus('error');
      setResult({ error: error.message });
    }
  };

  const handleMultiTableJoinChange = (joinConfig) => {
    setMultiTableJoin(joinConfig);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ClickHouse Data Ingestion Tool</h1>
      </header>
      
      <main className="container">
        <div className="row">
          <div className="col">
            <SourceSelection 
              sourceType={sourceType}
              targetType={targetType}
              onSourceChange={handleSourceChange}
            />
          </div>
        </div>
        
        <div className="row">
          <div className="col">
            <h3>Source Configuration</h3>
            {sourceType === 'clickhouse' ? (
              <ClickHouseConfig 
                config={clickHouseConfig}
                onChange={handleClickHouseConfigChange}
              />
            ) : (
              <FlatFileConfig 
                config={flatFileConfig}
                onChange={handleFlatFileConfigChange}
              />
            )}
          </div>
          
          <div className="col">
            <h3>Target Configuration</h3>
            {targetType === 'clickhouse' ? (
              <ClickHouseConfig 
                config={clickHouseConfig}
                onChange={handleClickHouseConfigChange}
              />
            ) : (
              <FlatFileConfig 
                config={flatFileConfig}
                onChange={handleFlatFileConfigChange}
              />
            )}
          </div>
        </div>
        
        <div className="row">
          <div className="col">
            <button 
              className="btn btn-primary"
              onClick={handleConnect}
              disabled={status === 'connecting'}
            >
              Connect to Source
            </button>
          </div>
        </div>
        
        {availableTables.length > 0 && (
          <div className="row">
            <div className="col">
              <TableSelection 
                tables={availableTables}
                selectedTable={selectedTable}
                onTableSelect={handleTableSelect}
              />
            </div>
          </div>
        )}
        
        {availableColumns.length > 0 && (
          <div className="row">
            <div className="col">
              <ColumnSelection 
                columns={availableColumns}
                selectedColumns={selectedColumns}
                onColumnsSelect={handleColumnsSelect}
              />
            </div>
          </div>
        )}
        
        {sourceType === 'clickhouse' && (
          <div className="row">
            <div className="col">
              <MultiTableJoin 
                tables={availableTables}
                config={multiTableJoin}
                onChange={handleMultiTableJoinChange}
              />
            </div>
          </div>
        )}
        
        <div className="row">
          <div className="col">
            <ActionPanel 
              onPreview={handlePreview}
              onStartIngestion={handleStartIngestion}
              disabled={status === 'connecting' || status === 'fetching' || status === 'ingesting'}
            />
          </div>
        </div>
        
        <div className="row">
          <div className="col">
            <StatusDisplay status={status} />
          </div>
        </div>
        
        {result && (
          <div className="row">
            <div className="col">
              <ResultDisplay result={result} />
            </div>
          </div>
        )}
        
        {showPreview && previewData && (
          <div className="row">
            <div className="col">
              <DataPreview data={previewData} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;