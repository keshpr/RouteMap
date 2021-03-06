#!flask/bin/python
import sys

from flask import Flask, render_template, request, redirect, Response, jsonify
from flask import json as fl_json
import random, json
import os

PATH_TO_GEOJSONS = './geoJsons'
PATH_TO_MINLIST = "./"
FEATURE_FILE_NAME = "Paths_features.json"
GEOMETRY_FILE_NAME = "Paths_geometries.json"

app = Flask(__name__)

@app.route('/')
def initial_screen():
    return render_template("index3.html", name = "kesh")

def sendGeoData():
    file_names = [os.path.join(PATH_TO_GEOJSONS, file_name) for file_name in os.listdir(PATH_TO_GEOJSONS)]
    response_data = dict()
    response_data['path_list'] = []
    i = 0
    for i in range(len(file_names)):
        print(i)
        if(i >= 10):
            break;
        with open(file_names[i]) as f:
            geoData = json.load(f)
        response_data['path_list'].append(geoData)
    return jsonify(response_data)
    
def findPathFromIndex(i):
    with open(os.path.join(PATH_TO_MINLIST, FEATURE_FILE_NAME)) as f:
        data = json.load(f)
    paths = data['l']
    toReturn = dict()
    toReturn['l'] = []
    for path in paths:
        if path['i'] == i:
            toReturn['l'].append(path)
            break;
    return toReturn

@app.route('/allPaths')
def sendData():
    file_name = os.path.join(PATH_TO_MINLIST, GEOMETRY_FILE_NAME)
    with open(file_name) as f:
        response_data = json.load(f)
    return jsonify(response_data)

@app.route('/pathInfo', methods = ['POST'])
def sendPathInfo():
    data = request.get_json()
    i = data['i']
    return jsonify(findPathFromIndex(i))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
