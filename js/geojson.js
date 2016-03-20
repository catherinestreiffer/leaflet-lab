/* Map of GeoJSON data from 2015refugees.geojson */
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('map', {
        center: [20, 0],
        zoom: 2
    });
    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
    getData(map)
};

//Step 3: Add circle markers for point features to the map
function createPropSymbols(data, map){
    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    //Step 4: Determine which attribute to visualize with proportional symbols
    var attribute = "2015_total_apps";
    //calculate the radius of each proportional symbol
    function calcPropRadius(attValue) {
        //scale factor to adjust symbol size evenly
        var scaleFactor = 0.002;
        //area based on attribute value and scale factor
        var area = attValue * scaleFactor;
        //radius calculated based on area
        var radius = Math.sqrt(area/Math.PI);
        return radius;
    };
    //create a Leaflet GeoJSON layer and add it to the map
    //Example 1.4 line 8...create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            //Step 5: For each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties[attribute]);
            //Step 6: Give each feature's circle marker a radius based on its attribute value
            geojsonMarkerOptions.radius = calcPropRadius(attValue);
            //create circle markers
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
};

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/2015refugees.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            createPropSymbols(response, map);
        }
    });
};
$(document).ready(createMap);
