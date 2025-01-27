import os

class Config:
    GENERATED_IMAGE_FOLDER = os.path.join('flaskr', 'static', 'images', 'generated')
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'sample'