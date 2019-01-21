var mymap = L.map("mapid").setView([37, -122], 13);
var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

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
        layer.bindTooltip("Ended at: "feature.properties.end_time, {"sticky": true});
        
    }
}

function getLineGeoJson(coords1, coords2){
    var geoJson = {};
    geoJson["type"] = "Feature";
    geoJson["geometry"] = {};
    geoJson["geometry"]["type"] = "LineString";
    geoJson["geometry"]["coordinates"] = [[coords1[0], coords1[1]], [coords2[0], coords2[1]]];
    geoJson["properties"] = {};
    geoJson["properties"]["distance"] = coords1[2];
    geoJson["properties"]["speed"] = coords1[3];
    return geoJson;
}

function getPointGeoJson(coords, time_type, time){
    var geoJson = {};
    geoJson["type"] = "Feature";
    geoJson["geometry"] = {};
    geoJson["geometry"]["type"] = "Point";
    geoJson["geometry"]["coordinates"] = [coords[0], coords[1]];
    geoJson["properties"] = {};
    geoJson["properties"][time_type] = time;
    return geoJson;
}
function getGeoJsons(pathData){
    var all_jsons = [];
    
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
	all_jsons.push(geoJson);
    }
    return all_jsons;
}
$(document).ready(function(){
    console.log("Ready")
    $.ajax({
	url: "/geoJson",
	dataType: "json",
	type: "GET",
	success: function(pathData){
	    console.log(pathData.l.length)
	    var all_jsons = getGeoJsons(pathData);
	    len = all_jsons.length;
	    for(i = 0; i < len; i++){
		console.log("i:" + i);
		L.geoJSON(all_jsons[i],
			  {onEachFeature: onEachFeature}).addTo(mymap);
	    }
	    
	}
    });
});
