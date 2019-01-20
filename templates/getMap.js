var mymap = L.map("mapid").setView([37, -122], 13);
var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

// Now add the layer onto the map
mymap.addLayer(layer);

function onEachFeature(feature, layer){
    if(feature.properties && feature.properties.speed){
	layer.bindTooltip(feature.properties.speed.toString(10), {"sticky": true});
	console.log("In feature");
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

function getGeoJsons(pathData){
    var all_jsons = [];
    
    var paths = pathData.l;
    for(i = 0; i < paths.length; i++)
    {
	var geoJson = {};
	geoJson["type"] = "FeatureCollection";
	geoJson["features"] = [];
	var path = paths[i].l;
	for(j = 0;j < path.length; j += 4)
	{
	    var coords1 = path.slice(j, j + 4);
	    var coords2 = path.slice(j + 4, j + 6);
	    geoJson["features"].push(getLineGeoJson(coords1, coords2));
	}
	all_jsons.push(geoJson);
    }
}
$(document).ready(function(){
    console.log("Ready")
    $.ajax({
	url: "/geoJson",
	dataType: "json",
	type: "GET",
	success: function(pathData){
	    all_jsons = getGeoJsons(pathData);
	    len = all_jsons.length;
	    for(i = 0; i < len; i++){
		console.log("i:" + i);
		L.geoJSON(all_jsons[i],
			  {onEachFeature: onEachFeature}).addTo(mymap);
	    }
	    
	}
    });
});
