#!flask/bin/python
import sys

from flask import Flask, render_template, request, redirect, Response, jsonify
from flask import json as fl_json
import random, json
import os

PATH_TO_GEOJSONS = './geoJsons'

app = Flask(__name__, template_folder="./templates")

@app.route('/')
def initial_screen():
    return render_template("index2.html", name = "kesh")

@app.route('/geoJson')
def sendGeoData():
    file_name = os.path.join(PATH_TO_GEOJSONS, os.listdir(PATH_TO_GEOJSONS)[0])
    with open(file_name) as f:
        geoData = json.load(f)
    return jsonify(geoData)
    

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
