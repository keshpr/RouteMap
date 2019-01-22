var mymap = L.map("mapid").setView([37, -122], 13);
var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});
var highlightStyle = {
    color: "#FFFF00"
};
var defaultStyle = {
    color: "#00BFFF"
};
var infoStyle = {
    color: "#FF8C00"
}

// Now add the layer onto the map
mymap.addLayer(layer);

function onEachFeature(feature, layer){
    if(feature.properties && feature.properties.speed){
	var tool_tip_text = "Speed: " + feature.properties.speed.toString(10) + " Distance: " + feature.properties.distance.toString(10);
	layer.bindTooltip(tool_tip_text, {"sticky": true});
	console.log("In feature");
    }
    if(feature.properties && feature.properties.start_time){
        layer.bindTooltip("Started at: " + feature.properties.start_time, {"sticky": true});
        
    }
    if(feature.properties && feature.properties.end_time){
        layer.bindTooltip("Ended at: " + feature.properties.end_time, {"sticky": true});
        
    }
}

function getLineGeometry(coords1, coords2){
    var geometry = {};
    geometry["type"] = "LineString";
    geometry["coordinates"] = [[coords1[0], coords1[1]], [coords2[0], coords2[1]]];
    return geometry;
}

function getPointGeometry(coords){
    var geometry = {};
    geometry["type"] = "Point";
    geometry["coordinates"] = [coords[0], coords[1]];
    return geometry;
}

function getProperties(distance, speed){
    var properties = {};
    properties["distance"] = distance;
    properties["speed"] = speed;
    return properties;
}

function getLineGeoJson(coords1, coords2){
    var geoJson = {};
    geoJson["type"] = "Feature";
    geoJson["geometry"] = getLineGeometry(coords1, coords2);
    geoJson["properties"] = getProperties(coords1[2], coords1[3]);
    return geoJson;
}

function getPointGeoJson(coords, time_type, time){
    var geoJson = {};
    geoJson["type"] = "Feature";
    geoJson["geometry"] = getPointGeometry(coords);
    geoJson["properties"] = {};
    geoJson["properties"][time_type] = time;
    return geoJson;
}
function getFeatureCollections(pathData){
    var all_feature_collections = [];   
    var paths = pathData.l;
    for(i = 0; i < paths.length; i++)
    {
	var geoJson = {};
	geoJson["type"] = "FeatureCollection";
	geoJson["features"] = [];
	var path = paths[i].l;
	var start_coords = path.slice(0, 2);
	var start_time = paths[i].s;	
		
	geoJson["features"].push(getPointGeoJson(start_coords, "start_time", start_time));
	for(j = 0;j < path.length; j += 4)
	{
	    	        
	    if(j + 4 >= path.length){
		break;
	    }
	    var coords1 = path.slice(j, j + 4);
	    var coords2 = path.slice(j + 4, j + 6);
	    geoJson["features"].push(getLineGeoJson(coords1, coords2));
	}
	var end_coords = path.slice(path.length - 4, path.length - 2);
	var end_time = paths[i].e;
	geoJson["features"].push(getPointGeoJson(end_coords, "end_time", end_time));
	all_feature_collections.push(geoJson);
    }
    return all_feature_collections;
}
function getGeometryCollections(pathData){
    var all_geometry_collections = [];
    var paths = pathData.l;
    for(i = 0; i < paths.length; i++)
	{
	    var geoJson = {};
	    geoJson["type"] = "Feature";
	    geoJson["geometry"] = {};
	    geoJson["geometry"]["type"] = "GeometryCollection";
	    geoJson["properties"] = {};
	    geoJson["properties"]["i"] = paths[i].i;
	    geoJson["properties"]["s"] = paths[i].s;
	    geoJson["properties"]["e"] = paths[i].e;
	    geoJson["geometry"]["geometries"] = [];
	    var path = paths[i].l;
	    var start_coords = path.slice(0, 2);
	    var start_time = paths[i].s;
	    geoJson["geometry"]["geometries"].push(getPointGeometry(start_coords));
	    for(j = 0;j < path.length; j += 4)
		{

		    if(j + 4 >= path.length){
			break;
		    }
		    var coords1 = path.slice(j, j + 4);
		    var coords2 = path.slice(j + 4, j + 6);
		    geoJson["geometry"]["geometries"].push(getLineGeometry(coords1, coords2));
		}
	    var end_coords = path.slice(path.length - 4, path.length - 2);
	    var end_time = paths[i].e;
	    geoJson["geometry"]["geometries"].push(getPointGeometry(end_coords));
	    all_geometry_collections.push(geoJson);
	}
    return all_geometry_collections;

}

var hasClicked = 0;
var featureLayerCurr = null;
var all_paths = null;

function getPathFromServer(i){
    var toReturn;
    $.ajax({
	    url: "/pathInfo",
		type: "POST",
		dataType: "json",
		contentType: "application/json",
		data: JSON.stringify({"i":i}),
		success: function(data){
		var all_feature_collections = getFeatureCollections(data);
		var path = L.geoJSON(all_feature_collections[0], {style: infoStyle, onEachFeature: onEachFeature});
		path.bringToFront();
                featureLayerCurr = path;
		path.addTo(mymap);
		//all_paths.addLayer(path);

	    }
	});
}

function setMouseHandler(layer){
    layer.on("mouseover", function(e){
	    layer.setStyle(highlightStyle);
	    
	});
    layer.on("mouseout", function(e){
	    layer.setStyle(defaultStyle);
	});
    layer.on("click", function(e){
	    if(featureLayerCurr != null){
		featureLayerCurr.remove();
		featureLayerCurr = null;
	    }		
	    var i = null;
	    for (var key in e.target._layers){
		i = e.target._layers[key]["feature"]["properties"]["i"];
		break;
	    }
	    console.log(e.target._layers);
	    getPathFromServer(i);
	    
	});
}

$(document).ready(function(){
    console.log("Ready")
    $.ajax({
	    url: "/allPaths",
		dataType: "json",
		type: "GET",
		success: function(pathData){
		console.log(pathData.l.length)
		    var all_feature_collections = getGeometryCollections(pathData);
		len = all_feature_collections.length;
		all_paths = new L.featureGroup();
		all_paths.addTo(mymap);
		for(i = 0; i < len; i++){
		    console.log("i:" + i);
		var path = L.geoJSON(all_feature_collections[i], {style: defaultStyle});
		all_paths.addLayer(path);
		}
		all_paths.eachLayer(setMouseHandler);
		//all_paths.on("mouseover", function(e){
		//	    e.layer.setStyle(highlightStyle);
		//	    
		//	});
		//all_paths.on("mouseout", function(e){
		//        e.layer.setStyle(defaultStyle);
		//    });
		all_paths.bindTooltip("Click for more info");
	    }
	});
    });
