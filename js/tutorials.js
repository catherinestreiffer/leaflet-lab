//tutorial script from Leaflet Quick Start Guide
//create map with center on London and zoom level 13
var map = L.map('map').setView([51.505, -0.09], 13);
//add mapbox street tile layer with my mapbox access token and project id
/*L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'catherinestreiffer.p624aig7',
    accessToken: 'pk.eyJ1IjoiY2F0aGVyaW5lc3RyZWlmZmVyIiwiYSI6ImNpa3BrOTVlaTEyNmZ0aWo3eDlyaThraGMifQ.bYUxm5s4cRD2iRGqvpNNBA'
}).addTo(map);*/
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);
//add marker with latlon in London
var marker = L.marker([51.5, -0.09]).addTo(map);
//add circle with latlon in London
var circle = L.circle([51.508, -0.11], 500, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
}).addTo(map);
//add polygon with vertices in london
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);
//add popups to the marker, circle, and polygon with text
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");
//add popup that pops up with the latlon coordinates of where you clicked
//on the map using a function onMapClick
var popup = L.popup();
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}
map.on('click', onMapClick);

//Using GeoJSON with Leaflet tutorial script
// creates a geojson object called geojsonFeature of Coors Field, with an attribute, a popup message,
//and its point geometry lat lon.
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};
// this creates a geojson layer and adds the geojsonFeature object to the map
// from the geoJSON layer
L.geoJson(geojsonFeature).addTo(map);
// this is a geojson object made up of an array of geojson linestring objects
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];
//this creates an empty geojson layer and assigns it to a variable (myLayer) and
//adds it to the map so we can add features to it later
var myLayer = L.geoJson().addTo(map);
myLayer.addData(geojsonFeature);
//this is a geojson object that specifies a style
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};
//this makes all the lines in the myLines array have the same style - the one
//we specified above in myStyle
L.geoJson(myLines, {
    style: myStyle
}).addTo(map);
//this styles different features based on their properties
// we use the property "party" and make the Republican state one color and
//the Democrat another color
//first we make a feature that has party property Republican and set it to
//be a polygon with specified coordinates, then another with Democrat
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];
//this is the style part that colors the Republican polygon one specified color and the
//Democrat another and adds those features to the map
L.geoJson(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);
// this creates a circleMarker using the pointToLayer option, and setting its properties
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
//this adds that circleMarker to the map where you point to a spot on the map
L.geoJson(someGeojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);
//this feature gets called on each feature before it gets added to a geojson layer
//this attaches a popup to features when they are clicked
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}
// here's the Coors Field example again, to remember that this is the sort of
//feature that you could attach popup content to with onEachFeature
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};
//this adds the Coors Field feature WITH the onEachFeature to the map
L.geoJson(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);
//this is using someFeatures as a filter option. We are using it to say that
//Coors Field should be shown on the map but Busch Field should not be shown
//first we put in both Fields as features on the map as we have before, but give another property
//to each, namely "show_on_map"
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];
//this uses the filter to only add to the map the features for which the property
//show_on_map is true
L.geoJson(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map);
