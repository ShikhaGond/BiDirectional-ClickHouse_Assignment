# ClickHouse Data Ingestion Application

A web-based application that facilitates bidirectional data transfer between ClickHouse databases and Flat Files.

## Features

- Bidirectional data flow:
  - ClickHouse → Flat File
  - Flat File → ClickHouse
- JWT token-based authentication for ClickHouse
- Column selection for targeted data transfer
- Data preview functionality
- Multi-table join support for ClickHouse sources
- Progress tracking and completion reporting

## Prerequisites

- Python 3.7+
- Node.js 14+
- npm or yarn
- Access to a ClickHouse database

## Installation

### Backend Setup

1. Create a Python virtual environment (optional but recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install backend dependencies:

```bash
pip install flask flask-cors clickhouse-driver pandas
```

3. Save the backend code as `app.py`

### Frontend Setup

1. Create a new React application:

```bash
npx create-react-app clickhouse-data-ingestion-app
cd clickhouse-data-ingestion-app
```

2. Replace the contents of the `src` directory with the provided frontend files

3. Install additional frontend dependencies:

```bash
npm install
```

## Running the Application

1. Start the backend server:

```bash
python app.py
```

2. In a separate terminal, start the frontend development server:

```bash
npm start
```

3. Access the application at http://localhost:3000

## Usage Guide

1. **Select Data Flow Direction**: Choose whether you want to transfer data from ClickHouse to a Flat File or vice versa.

2. **Configure Source and Target**:
   - For ClickHouse, provide host, port, database, user credentials, and JWT token
   - For Flat File, specify the file path and delimiter

3. **Connect to Source**: Click the "Connect to Source" button to establish a connection.

4. **Select Table and Columns**: 
   - If ClickHouse is the source, select the desired table and then the columns you want to include
   - If Flat File is the source, select the columns to be transferred to ClickHouse

5. **Multi-Table Join (Optional)**: For ClickHouse as source, you can enable joining multiple tables by defining join conditions.

6. **Preview Data**: Click "Preview Data" to see the first 100 records before performing the full ingestion.

7. **Start Ingestion**: Click "Start Ingestion" to begin the data transfer process.

8. **View Results**: Upon completion, the application will display the total number of records processed.

## Troubleshooting

- **Connection Issues**: Ensure your ClickHouse credentials are correct and that the server is accessible from your network.
- **JWT Authentication**: Verify that the JWT token is valid and has not expired.
- **File Access**: Check that the application has read/write permissions for the specified flat file location.
- **Data Type Mismatches**: When transferring from Flat File to ClickHouse, ensure that data types are compatible.

## Advanced Configuration

The application attempts to automatically map data types when transferring between ClickHouse and Flat Files. However, for complex use cases, you may need to customize the data mapping logic in the backend code.

## Security Considerations

- JWT tokens should be kept secure and not stored permanently in the application
- Consider implementing additional authentication for the web interface in production environments
- Ensure that file system permissions are properly configured to prevent unauthorized access to data files





## Application Overview
This web-based application facilitates bidirectional data transfer between ClickHouse databases and flat files. Here's a breakdown of the components and functionality:
Backend (Python/Flask)

Handles all data operations and database connectivity
Implements RESTful API endpoints for the frontend to consume
Uses the official ClickHouse Python driver for database operations
Supports JWT token authentication for ClickHouse connections
Provides schema discovery, data preview, and ingestion capabilities

## Frontend (React)

User-friendly interface for configuring data transfer operations
Interactive component for source/target selection
Forms for entering connection parameters
Visual selection of tables and columns
Real-time status reporting and progress tracking
Data preview functionality for first 100 records
Support for multi-table joins

**Key Features**

Bidirectional Flow: Transfer data from ClickHouse to flat files or from flat files to ClickHouse
Flexible Configuration: Customizable connection parameters for both sources
Column Selection: Choose specific columns to include in the transfer
JWT Authentication: Secure connections to ClickHouse using JWT tokens
Data Preview: View sample data before performing full ingestion
Multi-Table Join: Combine data from multiple ClickHouse tables
Completion Reporting: Track records processed and operation status
