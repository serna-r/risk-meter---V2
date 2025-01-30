import os
import pandas as pd
from flask import Flask, request, jsonify, render_template
from config import Config
import numpy as np

app = Flask(__name__)
app.config.from_object(Config)

# Ruta al archivo Excel
EXCEL_FILE = os.path.join('flaskr', 'static', 'services.xlsx')

def load_services():
    try:
        # Load the Services sheet
        services_df = pd.read_excel(EXCEL_FILE, sheet_name="Services").fillna(0)  # Replace NaN values with 0

         # Capitalize the 'Website' column
        if 'Website' in services_df.columns:
            services_df['Website'] = services_df['Website'].astype(str).str.capitalize()

        # Load the Privacy values median sheet
        privacy_values_df = pd.read_excel(EXCEL_FILE, sheet_name="Privacy values median", index_col=0)

        # Ensure numeric data only: convert non-numeric columns to 0 in services_df
        services_numeric = services_df.apply(pd.to_numeric, errors="coerce").fillna(0)

        # Ensure column alignment between services and privacy values
        aligned_services_df = services_numeric.reindex(columns=privacy_values_df.columns, fill_value=0)

        # Calculate risks for all services at once using matrix multiplication
        risks_df = aligned_services_df.dot(privacy_values_df.T)  # Matrix multiplication

        # Calculate Dexp for each service with the updated formula
        risks_sum = risks_df.sum(axis=1)  # Sum of calculated risks for each service
        Dexp_values = 1+ (((np.sqrt(risks_sum ** 2)) - 1) * 19) / ((17 * 7 * 7) - 1)

        # Add the calculated risks and Dexp to the services DataFrame
        services_df["Calculated Risks"] = risks_df.to_dict(orient="records")  # Convert risks to a list of dicts
        services_df['Risks sum'] = risks_sum
        services_df["Dexp"] = Dexp_values

        # Calculate Service Risk for each service
        def calculate_service_risk(row):
            # Check if min mask contains letters beyond "l"
            min_mask_check = 1 if isinstance(row["min mask"], str) and set(row["min mask"]) - {"l"} else 0
            
            # Extra security check
            extra_sec_check = 1 if row["extra sec"] == 0 else 0

            # Min length checks
            min_length_check = 1 if row["min length"] < 7 else 0
            min_length_check += 1 if row["min length"] < 9 else 0

            # Penalty for 2FA
            penalty_2fa = 0.99 if row["2fa"] == 1 else 0

            # Calculate Service Risk
            score = min_mask_check + extra_sec_check + min_length_check
            service_risk = score * (1 - penalty_2fa)/2

            return service_risk

        services_df["Service Risk"] = services_df.apply(calculate_service_risk, axis=1)


        # Convert the final services DataFrame to a list of dictionaries
        services = services_df.to_dict(orient="records")
        print(services)
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
    return render_template('meter.html', show_risk_indicators=False, spacer_size="50px")

@app.route('/simple')
def simple():
    return render_template('meter.html', show_risk_indicators=False, spacer_size="50px")

@app.route('/extra')
def extra_info():
    return render_template('meter.html', show_risk_indicators=True, spacer_size="50px")
