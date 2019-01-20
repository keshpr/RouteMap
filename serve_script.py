#!flask/bin/python
import sys

from flask import Flask, render_template, request, redirect, Response, jsonify
from flask import json as fl_json
import random, json
import os

PATH_TO_GEOJSONS = './geoJsons'
PATH_TO_MINLIST = "./"

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
    

@app.route('/geoJson')
def sendData():
    file_name = os.path.join(PATH_TO_MINLIST, "Paths.json")
    with open(file_name) as f:
        response_data = json.load(f)
    return jsonify(response_data)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
