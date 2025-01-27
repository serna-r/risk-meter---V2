import os
import pandas as pd
from flask import Flask, request, jsonify, render_template
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Ruta al archivo Excel
EXCEL_FILE = os.path.join('flaskr', 'static', 'service_risk_calculation.xlsx')

def load_services():
    try:
        df = pd.read_excel(EXCEL_FILE, sheet_name="Services")
        df = df.fillna(0)  # Replace NaN values with 0
        services = df.to_dict(orient='records')  # Convert to a list of dictionaries
        return services
    except Exception as e:
        print(f"Error loading services: {e}")
        return []
    
# Cargar servicios al iniciar la aplicación
services = load_services()

@app.route('/search', methods=['GET'])
def search_services():
    query = request.args.get('query', '').lower()
    results = [service for service in services if query in service['Website'].lower()]
    return jsonify(results)

@app.route('/')
def index():
    return render_template('meter.html')


