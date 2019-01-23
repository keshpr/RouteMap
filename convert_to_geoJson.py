import json, os


GEO_TYPE = "LineString"
PATH_TO_TRIPS = "./trips"
PATH_TO_GEOJSONS = "./geoJsons"
PATH_TO_MINLIST = "."
FEATURE_FILE_NAME = "Paths_features.json"
GEOMETRY_FILE_NAME = "Paths_geometries.json"


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
        latlng = [[curr['lng'], curr['lat']], [nex['lng'], nex['lat']]]
        feature = getFeature(latlng, GEO_TYPE, properties)
        feature_collection["features"].append(feature)
        curr = nex

    return feature_collection


def getTimeString(seconds):
    mins = int(seconds / 60)
    seconds_rem = seconds % 60
    return str(min) + "m " + str(seconds_rem) + "s"

NUM_TO_SKIP = 6;
def getPath_features(filename, i):
    with open(filename) as jf:
        path_data = json.load(jf)
    coords = path_data['coords']
    path = dict()
    path['s'] = path_data['start_time']
    path['e'] = path_data['end_time']
    path['i'] = i
    path['l'] = []
    avg_speed = coords[0]['speed']
    tot_speed = 0.0
    num_added = 0
    for i in range(len(coords)):
        if(i % NUM_TO_SKIP == 0 or i == len(coords) - 1):
            tot_speed += coords[i]['speed']
            time_since = coords[i]['index']
            num_added += 1
            path['l'].append(coords[i]['lng'])
            path['l'].append(coords[i]['lat'])
            path['l'].append(coords[i]['dist'])
            path['l'].append(tot_speed / float(num_added))
            path['l'].append(time_since)
            tot_speed = coords[i]['speed']
            num_added = 1
        else:
            tot_speed += coords[i]['speed']
            num_added += 1
    
    return path

def getPath_geometries(filename, i):
    with open(filename) as jf:
        path_data = json.load(jf)
    coords = path_data['coords']
    path = dict()
    path['s'] = path_data['start_time']
    path['e'] = path_data['end_time']
    path['i'] = i
    path['l'] = []
    for i in range(len(coords)):
        if(i % NUM_TO_SKIP == 0 or i == len(coords) - 1):
            path['l'].append(coords[i]['lng'])
            path['l'].append(coords[i]['lat'])
            
    return path

def getFiles():
    file_names = [os.path.join(PATH_TO_TRIPS, file_name) for file_name in os.listdir(PATH_TO_TRIPS)]

    for file_name in file_names:
        feature_collection = getPath(file_name)
        name = file_name.split('/')[-1]
        new_file = os.path.join(PATH_TO_GEOJSONS, name)
        with open(new_file, 'w') as outfile:
            json.dump(feature_collection, outfile)
    
    return

def getFile(name):
    file_names = sorted([os.path.join(PATH_TO_TRIPS, file_name) for file_name in os.listdir(PATH_TO_TRIPS)])

    paths = dict()
    paths['l'] = []
    i = 0
    for file_name in file_names:
        if(name == FEATURE_FILE_NAME):
            collection = getPath_features(file_name, i)
        else:
            collection = getPath_geometries(file_name, i)
        paths['l'].append(collection)
        i += 1
    
    new_file = os.path.join(PATH_TO_MINLIST, name)
    with open(new_file, 'w') as outfile:
        json.dump(paths, outfile)
    return

        
if(__name__ == "__main__"):
    getFile(FEATURE_FILE_NAME)
    getFile(GEOMETRY_FILE_NAME)

