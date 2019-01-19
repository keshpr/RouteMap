import json, os


GEO_TYPE = "LineString"
PATH_TO_TRIPS = "./trips"
PATH_TO_GEOJSONS = "./geoJsons"

def getFeature(coords, geo_type, properties):
    feature = dict()
    feature["type"] = "Feature"
    feature["geometry"] = dict({"type":geo_type, "coordinates":coords})
    feature["properties"] = properties
    return feature

def getProperties(speed, distance):
    properties = dict()
    properties["speed"] = speed
    properties["distance"] = distance
    return properties

def getPath(filename):
    with open(filename) as jf:
        path_data = json.load(jf)
    coords = path_data['coords']
    feature_collection = dict()
    feature_collection["type"] = "FeatureCollection"
    feature_collection["features"] = []
    curr = coords[0]
    for i in range(1, len(coords)):
        nex = coords[i]
        properties = getProperties(curr['speed'], curr['dist'])
        latlng = [[curr['lat'], curr['lng']], [nex['lat'], nex['lng']]]
        feature = getFeature(latlng, GEO_TYPE, properties)
        feature_collection["features"].append(feature)
        curr = nex

    return feature_collection

def getFiles():
    file_names = [os.path.join(PATH_TO_TRIPS, file_name) for file_name in os.listdir(PATH_TO_TRIPS)]

    for file_name in file_names:
        feature_collection = getPath(file_name)
        name = file_name.split('/')[-1]
        new_file = os.path.join(PATH_TO_GEOJSONS, name)
        with open(new_file, 'w') as outfile:
            json.dump(feature_collection, outfile)
    
    return

if(__name__ == "__main__"):
    getFiles()

