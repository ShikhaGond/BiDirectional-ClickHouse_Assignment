from flask import Flask, request, jsonify
from flask_cors import CORS
import clickhouse_driver
import pandas as pd
import csv
import json
import os

app = Flask(__name__)
CORS(app)

@app.route('/connect-clickhouse', methods=['POST'])
def connect_clickhouse():
    try:
        data = request.json
        host = data.get('host')
        port = data.get('port')
        database = data.get('database')
        user = data.get('user')
        jwt_token = data.get('jwt_token')
        
        # Connect to ClickHouse with JWT token
        client = clickhouse_driver.Client(
            host=host,
            port=port,
            database=database,
            user=user,
            token=jwt_token,
            secure=True if int(port) in [9440, 8443] else False
        )
        
        # Test connection by fetching tables
        tables = client.execute("SHOW TABLES")
        tables_list = [table[0] for table in tables]
        
        return jsonify({"success": True, "tables": tables_list})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/get-table-schema', methods=['POST'])
def get_table_schema():
    try:
        data = request.json
        host = data.get('host')
        port = data.get('port')
        database = data.get('database')
        user = data.get('user')
        jwt_token = data.get('jwt_token')
        table = data.get('table')
        
        # Connect to ClickHouse
        client = clickhouse_driver.Client(
            host=host,
            port=port,
            database=database,
            user=user,
            token=jwt_token,
            secure=True if int(port) in [9440, 8443] else False
        )
        
        # Get table schema
        schema = client.execute(f"DESCRIBE TABLE {table}")
        columns = [{"name": col[0], "type": col[1]} for col in schema]
        
        return jsonify({"success": True, "columns": columns})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/get-flat-file-schema', methods=['POST'])
def get_flat_file_schema():
    try:
        file_path = request.json.get('file_path')
        delimiter = request.json.get('delimiter', ',')
        
        if not os.path.exists(file_path):
            return jsonify({"success": False, "error": "File not found"})
        
        # Read first row to get column names
        with open(file_path, 'r') as f:
            reader = csv.reader(f, delimiter=delimiter)
            headers = next(reader)
        
        columns = [{"name": col, "type": "string"} for col in headers]
        
        return jsonify({"success": True, "columns": columns})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/clickhouse-to-flat-file', methods=['POST'])
def clickhouse_to_flat_file():
    try:
        data = request.json
        # ClickHouse connection details
        host = data.get('host')
        port = data.get('port')
        database = data.get('database')
        user = data.get('user')
        jwt_token = data.get('jwt_token')
        table = data.get('table')
        
        # Flat file details
        file_path = data.get('file_path')
        delimiter = data.get('delimiter', ',')
        
        # Selected columns
        selected_columns = data.get('selected_columns', [])
        
        # Connect to ClickHouse
        client = clickhouse_driver.Client(
            host=host,
            port=port,
            database=database,
            user=user,
            token=jwt_token,
            secure=True if int(port) in [9440, 8443] else False
        )
        
        # Create query based on selected columns
        columns_str = ", ".join(selected_columns) if selected_columns else "*"
        query = f"SELECT {columns_str} FROM {table}"
        
        # Execute query and get data
        result = client.execute(query, with_column_types=True)
        rows, column_types = result
        
        # Write to flat file
        with open(file_path, 'w', newline='') as f:
            writer = csv.writer(f, delimiter=delimiter)
            
            # Write headers
            headers = [col[0] for col in column_types]
            writer.writerow(headers)
            
            # Write data
            writer.writerows(rows)
        
        return jsonify({
            "success": True, 
            "records_processed": len(rows),
            "message": f"Successfully exported {len(rows)} records to {file_path}"
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/flat-file-to-clickhouse', methods=['POST'])
def flat_file_to_clickhouse():
    try:
        data = request.json
        # ClickHouse connection details
        host = data.get('host')
        port = data.get('port')
        database = data.get('database')
        user = data.get('user')
        jwt_token = data.get('jwt_token')
        table = data.get('table')
        
        # Flat file details
        file_path = data.get('file_path')
        delimiter = data.get('delimiter', ',')
        
        # Selected columns
        selected_columns = data.get('selected_columns', [])
        
        # Read data from flat file
        df = pd.read_csv(file_path, delimiter=delimiter)
        
        # Filter only selected columns if specified
        if selected_columns:
            df = df[selected_columns]
        
        # Connect to ClickHouse
        client = clickhouse_driver.Client(
            host=host,
            port=port,
            database=database,
            user=user,
            token=jwt_token,
            secure=True if int(port) in [9440, 8443] else False
        )
        
        # Check if table exists, if not create it
        table_exists = client.execute(f"EXISTS TABLE {table}")
        if not table_exists[0][0]:
            # Generate CREATE TABLE query
            columns_def = []
            for col in df.columns:
                dtype = df[col].dtype
                if pd.api.types.is_integer_dtype(dtype):
                    ch_type = "Int64"
                elif pd.api.types.is_float_dtype(dtype):
                    ch_type = "Float64"
                elif pd.api.types.is_datetime64_dtype(dtype):
                    ch_type = "DateTime"
                elif pd.api.types.is_bool_dtype(dtype):
                    ch_type = "UInt8"
                else:
                    ch_type = "String"
                columns_def.append(f"`{col}` {ch_type}")
            
            create_query = f"CREATE TABLE {table} ({', '.join(columns_def)}) ENGINE = MergeTree() ORDER BY tuple()"
            client.execute(create_query)
        
        # Insert data
        data_to_insert = df.to_dict('records')
        client.execute(f"INSERT INTO {table} VALUES", data_to_insert)
        
        return jsonify({
            "success": True,
            "records_processed": len(data_to_insert),
            "message": f"Successfully imported {len(data_to_insert)} records to ClickHouse table {table}"
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/preview-data', methods=['POST'])
def preview_data():
    try:
        data = request.json
        source_type = data.get('source_type')
        
        if source_type == 'clickhouse':
            # ClickHouse connection details
            host = data.get('host')
            port = data.get('port')
            database = data.get('database')
            user = data.get('user')
            jwt_token = data.get('jwt_token')
            table = data.get('table')
            selected_columns = data.get('selected_columns', [])
            
            # Connect to ClickHouse
            client = clickhouse_driver.Client(
                host=host,
                port=port,
                database=database,
                user=user,
                token=jwt_token,
                secure=True if int(port) in [9440, 8443] else False
            )
            
            # Create query based on selected columns
            columns_str = ", ".join(selected_columns) if selected_columns else "*"
            query = f"SELECT {columns_str} FROM {table} LIMIT 100"
            
            # Execute query and get data
            result = client.execute(query, with_column_types=True)
            rows, column_types = result
            
            # Format the preview data
            headers = [col[0] for col in column_types]
            preview_data = []
            for row in rows:
                row_dict = {}
                for i, value in enumerate(row):
                    row_dict[headers[i]] = value
                preview_data.append(row_dict)
            
            return jsonify({
                "success": True,
                "headers": headers,
                "data": preview_data
            })
            
        elif source_type == 'flat_file':
            file_path = data.get('file_path')
            delimiter = data.get('delimiter', ',')
            selected_columns = data.get('selected_columns', [])
            
            if not os.path.exists(file_path):
                return jsonify({"success": False, "error": "File not found"})
            
            # Read data from flat file
            df = pd.read_csv(file_path, delimiter=delimiter)
            
            # Filter only selected columns if specified
            if selected_columns:
                df = df[selected_columns]
            
            # Get only first 100 rows
            df = df.head(100)
            
            # Format the preview data
            headers = df.columns.tolist()
            preview_data = df.to_dict('records')
            
            return jsonify({
                "success": True,
                "headers": headers,
                "data": preview_data
            })
        
        else:
            return jsonify({"success": False, "error": "Invalid source type"})
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/multi-table-join', methods=['POST'])
def multi_table_join():
    try:
        data = request.json
        # ClickHouse connection details
        host = data.get('host')
        port = data.get('port')
        database = data.get('database')
        user = data.get('user')
        jwt_token = data.get('jwt_token')
        
        # Join details
        tables = data.get('tables', [])
        join_conditions = data.get('join_conditions', [])
        file_path = data.get('file_path')
        delimiter = data.get('delimiter', ',')
        selected_columns = data.get('selected_columns', [])
        
        if len(tables) < 2:
            return jsonify({"success": False, "error": "At least two tables required for join"})
        
        if len(join_conditions) < len(tables) - 1:
            return jsonify({"success": False, "error": "Insufficient join conditions"})
        
        # Connecting to ClickHouse
        client = clickhouse_driver.Client(
            host=host,
            port=port,
            database=database,
            user=user,
            token=jwt_token,
            secure=True if int(port) in [9440, 8443] else False
        )
        
        # Construct the JOIN query
        columns_str = ", ".join(selected_columns) if selected_columns else "*"
        
        # Base query with first table
        query = f"SELECT {columns_str} FROM {tables[0]} AS t0"
        
        # Adding joins
        for i in range(1, len(tables)):
            query += f" JOIN {tables[i]} AS t{i} ON {join_conditions[i-1]}"
        
        # Execute query and get data
        result = client.execute(query, with_column_types=True)
        rows, column_types = result
        
        # Write to flat file
        with open(file_path, 'w', newline='') as f:
            writer = csv.writer(f, delimiter=delimiter)
            
            # Headers
            headers = [col[0] for col in column_types]
            writer.writerow(headers)
            
            # Data
            writer.writerows(rows)
        
        return jsonify({
            "success": True,
            "records_processed": len(rows),
            "message": f"Successfully exported {len(rows)} joined records to {file_path}"
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=5000)