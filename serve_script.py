#!flask/bin/python
import sys

from flask import Flask, render_template, request, redirect, Response, jsonify
from flask import json as fl_json
import random, json

app = Flask(__name__, template_folder="./templates")

@app.route('/')
def initial_screen():
    return render_template("index2.html", name = "kesh")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
