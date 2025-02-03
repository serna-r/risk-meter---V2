import os
import pandas as pd
from flask import Flask, request, jsonify, render_template
from config import Config
import numpy as np
import json

app = Flask(__name__)
app.config.from_object(Config)

# Path to the single Excel file
EXCEL_FILE = os.path.join('flaskr', 'static', 'services.xlsx')

# Norma de Frobenius de matriz de riesgo
FROBENIUS_RISK_MATRIX = 533

def load_translation(lang):
    """Load language translations from JSON file."""
    translation_path = os.path.join("flaskr", "static", "json", "translations", f"{lang}.json")
    
    if os.path.exists(translation_path):  
        with open(translation_path, "r", encoding="utf-8") as file:
            return json.load(file)
    else:
        return load_translation("en")  # Fallback to English if not found

def load_all_services():
    """Load services once into memory from both language sheets."""
    try:
        # Load both sheets into separate dataframes
        services_en_df = pd.read_excel(EXCEL_FILE, sheet_name="Services_en").fillna(0)
        services_es_df = pd.read_excel(EXCEL_FILE, sheet_name="Services_es").fillna(0)

        # Capitalize 'Website' column for both languages
        if 'Website' in services_en_df.columns:
            services_en_df['Website'] = services_en_df['Website'].astype(str).str.capitalize()
        if 'Website' in services_es_df.columns:
            services_es_df['Website'] = services_es_df['Website'].astype(str).str.capitalize()

        # Load privacy values for risk calculations
        privacy_values_df = pd.read_excel(EXCEL_FILE, sheet_name="Privacy values median", index_col=0)

        def process_services(services_df):
            """Applies risk calculations and transformations."""
            services_numeric = services_df.apply(pd.to_numeric, errors="coerce").fillna(0)
            aligned_services_df = services_numeric.reindex(columns=privacy_values_df.columns, fill_value=0)
            risks_df = aligned_services_df.dot(privacy_values_df.T)
            risks_sum = risks_df.sum(axis=1)
            Dexp_values = 1 + (((np.sqrt(risks_sum ** 2)) - 1) * 19) / ((FROBENIUS_RISK_MATRIX) - 1)

            services_df["Calculated Risks"] = risks_df.to_dict(orient="records")
            services_df['Risks sum'] = risks_sum
            services_df["Dexp"] = Dexp_values

            def calculate_service_risk(row):
                min_mask_check = 1 if isinstance(row["min mask"], str) and set(row["min mask"]) - {"l"} else 0
                extra_sec_check = 1 if row["extra sec"] == 0 else 0
                min_length_check = 1 if row["min length"] < 7 else 0
                min_length_check += 1 if row["min length"] < 9 else 0
                penalty_2fa = 0.99 if row["2fa"] == 1 else 0
                score = min_mask_check + extra_sec_check + min_length_check
                return score * (1 - penalty_2fa) / 2

            services_df["Service Risk"] = services_df.apply(calculate_service_risk, axis=1)
            return services_df.to_dict(orient="records")

        return {
            "en": process_services(services_en_df),
            "es": process_services(services_es_df)
        }

    except Exception as e:
        print(f"Error loading services: {e}")
        return {"en": [], "es": []}

# 🔹 Load services into memory on startup
services_memory = load_all_services()

@app.route('/search', methods=['GET'])
def search_services():
    """Search for services in memory based on query and language."""
    lang = request.args.get('lang', 'en')
    query = request.args.get('query', '').lower()
    selected_services = services_memory.get(lang, [])

    results = [service for service in selected_services if query in service['Website'].lower()]
    return jsonify(results)

@app.route('/')
def index():
    """Render the main page with the correct language and translations."""
    lang = request.args.get('lang', 'en')  
    texts = load_translation(lang)
    
    return render_template('meter.html', lang=lang, texts=texts)

if __name__ == "__main__":
    app.run(debug=True)
