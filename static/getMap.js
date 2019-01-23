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
};
var defaultPointStyle = {
    radius: 6,
    fillColor: "#FF7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

var startPointStyle = {
    radius: 6,
    fillColor: "#00FF00",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

var endPointStyle = {
    radius: 6,
    fillColor: "#FF0000",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};


// Now add the layer onto the map
mymap.addLayer(layer);

function hsv2rgb(h,s,v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
    }

    return [ r * 255, g * 255, b * 255 ];
}

function getColor(speed){
    var h = speed / 50;
    var rgb = hsv2rgb(h,1,1);
    console.log("rgb: ");
    console.log(rgb);
    var rgb_string = "#";
    for(i = 0;i < 3; i ++)
	{
	    var val = rgb[i];
	    val = val - val % 16;
	    var stri = val.toString(16);
	    if(stri.length < 2){
		stri = "0".concat(stri);
	    }
	    rgb_string = rgb_string.concat(stri);
	}
    return rgb_string;
}
function onEachFeature(feature, layer){
    if(feature.properties && feature.properties.speed){
	var tool_tip_text = "Speed: " + feature.properties.speed.toFixed(1) + " Distance: " + feature.properties.distance.toFixed(1) + " Time elapsed: " + feature.properties.time;
	layer.bindTooltip(tool_tip_text, {"sticky": true});
	console.log(getColor(feature.properties.speed));
	layer.setStyle({color: getColor(feature.properties.speed)});
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

function getProperties(distance, speed, time){
    var properties = {};
    properties["distance"] = distance;
    properties["speed"] = speed;
    properties["time"] = (function(time){
    	    var secs = (time % 60).toString(10);
	    var mins = Math.floor(time / 60).toString(10);
	    return mins + "m " + secs + "s"
	})(time);
    //properties["time"] = time;
    return properties;
}

function getLineGeoJson(coords1, coords2){
    var geoJson = {};
    geoJson["type"] = "Feature";
    geoJson["geometry"] = getLineGeometry(coords1, coords2);
    geoJson["properties"] = getProperties(coords1[2], coords1[3], coords1[4]);
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
	console.log(start_coords);
	geoJson["features"].push(getPointGeoJson(start_coords, "start_time", start_time));
	for(j = 0;j < path.length; j += 5)
	{
	    	        
	    if(j + 5 >= path.length){
		break;
	    }
	    var coords1 = path.slice(j, j + 5);
	    var coords2 = path.slice(j + 5, j + 7);
	    geoJson["features"].push(getLineGeoJson(coords1, coords2));
	}
	var end_coords = path.slice(path.length - 5, path.length - 3);
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
	    for(j = 0;j < path.length; j += 2)
		{

		    if(j + 4 >= path.length){
			break;
		    }
		    var coords1 = path.slice(j, j + 2);
		    var coords2 = path.slice(j + 2, j + 4);
		    geoJson["geometry"]["geometries"].push(getLineGeometry(coords1, coords2));
		}
	    var end_coords = path.slice(path.length - 2, path.length);
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
		console.log(all_feature_collections[0]);
		var path = L.geoJSON(all_feature_collections[0], 
				     {onEachFeature: onEachFeature,
				      pointToLayer: 
				      function (feature, latlng) {
				      	  if(feature.geometry.type == "Point" && feature.properties.start_time){
				      	      return L.circleMarker(latlng, startPointStyle);    
					  }else if(feature.geometry.type == "Point" && feature.properties.end_time){
					      return L.circleMarker(latlng, endPointStyle);
					  }
					  
				      }
				     }
				     );
		path.bringToFront();
                path.on("mouseover", function(e){
			path.bringToFront();
		    });
		featureLayerCurr = path;
		path.addTo(mymap);
		//all_paths.addLayer(path);

	    }
	});
}

function setMouseHandler(layer){
    layer.on("mouseover", function(e){
	    layer.setStyle(highlightStyle);
	    //layer.bringToFront();
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

	    //e.stopPropagation();
	});
}

$(document).ready(function(){
    console.log("Ready")
    $.ajax({
	    url: "/allPaths",
		dataType: "json",
		type: "GET",
		success: function(pathData){
		console.log(pathData.l.length);
		var all_geometry_collections = getGeometryCollections(pathData);
		len = all_geometry_collections.length;
		all_paths = new L.featureGroup();
		all_paths.addTo(mymap);
		for(i = 0; i < len; i++){
		    console.log("i:" + i);
		    var path = L.geoJSON(all_geometry_collections[i], {style: defaultStyle, pointToLayer: function (feature, latlng) {
				return L.circleMarker(latlng, defaultPointStyle);}});
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
		all_paths.bindTooltip("Select for more info");
	    }
	});
    });

