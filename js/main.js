/* Map of GeoJSON data from 2015refugees.geojson */
// creating the attributes array to hold the number of refugee applications for each country for each month
var attributes = []
    // the country that has been clicked on - start with null because no country has been clicked on yet
var currentCountry = null
    // the European Refugees data with polygon geometry for the choropleth map
var polygonsDataSource = "data/SamuelIsAwesome.geojson";
// the European Refugees data with point geometry (country centroids) for the proportional symbols map
var pointsDataSource = "data/EuropeRefugees2015.geojson";
// the layer control to toggle between the proportional symbols map and the choropleth map
var layerControl = null;

//function to instantiate the Leaflet map
function createMaps() {
    //create the map
    var map = L.map('map', {
        center: [52, 10],
        zoom: 4
    });
    //add OSM base tilelayer
    createTileLayer(map)
    //adds the layer control to the map
    layerControl = L.control.layers().addTo(map);
    //updates the map each time the view changes from one visual isomorph to the other
    map.on({
        //the visual isomporphs aren't really base layers, but I'm telling the layer control to give me the base map
        //control widget instead of the overlay control widget
        baselayerchange: function() {
            updateMap(map);
        }
    });
    //gets the data
    getData(map);
};
function createTileLayer(map) {
  var mapboxAccessToken = "pk.eyJ1IjoiY2F0aGVyaW5lc3RyZWlmZmVyIiwiYSI6ImNpa3BrOTVlaTEyNmZ0aWo3eDlyaThraGMifQ.bYUxm5s4cRD2iRGqvpNNBA"
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
    attribution: '&copy; <a href="http://mapbox.com/">Mapbox</a>'
}).addTo(map);
}
//returns the current index value
function currentAttributeIndex() {
    if ($('.range-slider').val())
        return $('.range-slider').val()
    else
        return 0
};

function currentUsedAttribute() {
    return attributes[currentAttributeIndex()]
};
//given a feature, returns the number of refugee applications for that feature for the currently selected month
function currentNumberRefugees(feature) {
    return Number(feature.properties[currentUsedAttribute()])
};
//Add circle markers for point features to the map
function createPropsMap(data, map) {
    //create a Leaflet GeoJSON layer and add it to the map: this one adds the attributes
    var layer = L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return pointToLayer(feature, latlng);
        }
    }).addTo(map);
    // tells the layer control which layer this is. Fools the layer control into thinking it is a base layer
    // so I can use the base layer widget instead of the overlay widget
    layerControl.addBaseLayer(layer, "Proportional Symbols")
};

//Resize proportional symbols according to new attribute values OR changes color on choropleth
function updateMap(map) {
    map.eachLayer(function(layer) {
        if (layer.feature && currentNumberRefugees(layer.feature)) {
            // if it is the point layer, then resize the circle markers
            if (layer.feature.geometry.type == "Point") {
                //update each feature's radius based on new attribute values
                var radius = calcPropRadius(currentNumberRefugees(layer.feature));
                layer.setRadius(radius);
            }
            // if it isn't the point layer, then it's the polygon layer. Change the color of
            // the polygons based on the attribute value
            else {
                var color = calcColor(currentNumberRefugees(layer.feature));
                layer.setStyle({
                    fillColor: color
                });
            };
        };
    });
};

// here are the colors to use to classify the choropleth
function calcColor(apps) {
    return apps > 50000 ? '#253494' :
        apps > 40000 ? '#2c7fb8' :
        apps > 30000 ? '#41b6c4' :
        apps > 20000 ? '#7fcdbb' :
        apps > 10000 ? '#c7e9b4' :
        '#ffffcc';
};

//fifth interaction operator
function createChoropleth(data, map) {
    //setting the colors for the ranges of refugee applications
    var layer = L.geoJson(data, {
        style: function(feature) {
            return {
                fillColor: calcColor(currentNumberRefugees(feature)),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            }
        }
    });
    // just look at the layers that have features
    layer.eachLayer(function(layer) {
            if (layer.feature) {
                defineLayerEvents(layer, layer.feature)
            }
        })
        // telling the layer control about the choropleth layer
        // fooling the layer control into thinking that it's a base layer to get the control widget I want
    layerControl.addBaseLayer(layer, "Choropleth")
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 0.04;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area / Math.PI);
    return radius;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng) {
    //create marker options
    var options = {
        fillColor: "#41b6c4",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    //Give each feature's circle marker a radius based on its attribute value
    //    console.log(calcPropRadius(currentNumberRefugees(feature)));
    options.radius = calcPropRadius(currentNumberRefugees(feature));
    //create circle marker layer
    var layer = L.circleMarker(latlng, options);
    //popup content is the country name
    var popupContent = feature.properties.Country;
    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0, -options.radius),
        closeButton: false
    });
    // turn on the country name popup when the circle marker is moused over
    // turn it off when you stop mousing over that circle marker
    layer.on({
        mouseover: function() {
            this.openPopup();
        },
        mouseout: function() {
            this.closePopup();
        }
    });
    // calls the function to update the panel content on country click
    defineLayerEvents(layer, feature, new L.Point(0, -options.radius))
        //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};
// clicking on the country updates the panel content
function defineLayerEvents(layer, feature, offset) {
    //event listeners to open popup on hover and fill panel on click
    layer.on({
        click: function() {
            if (currentCountry == feature)
                currentCountry = null;
            else
                currentCountry = feature;
            updatePanelContent();
        }
    });
};
function updateAll(map) {
  updateMap(map);
  updatePanelContent();
  updateLegendContent();
}
// updates the panel content with the country selected, and the month and refugee apps for the month
//selected from the slider
function updatePanelContent() {
    //build html
    var panelContent;
    if (currentCountry) {
        panelContent = "<p><b>Country:</b> " + currentCountry.properties.Country + "</p>";
        // create array to hold month names (plus year total)
        monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        currentMonth = monthArray[currentAttributeIndex()];
        //add formatted attribute to panel content string
        panelContent += "<p><b>Refugee applications in </b>" + currentMonth + "<p><b>2015: </b>" + currentNumberRefugees(currentCountry);
    }
    // if no country is selected, the panel content goes back to the general information
    else {
        panelContent = "<p><b>In 2015, due mostly to escalation of the conflict in Syria, more than one million refugees arrived in Europe. Most were trying to get to Germany, since Germany was more welcome to the refugees than some of the other countries.</b>";
    }
    //set panel
    $("#info").html(panelContent)
};
function createLegendContent(map) {
  var LegendControl = L.Control.extend({
      options: {
          position: 'bottomleft'
      },
      onAdd: function (map) {
          // create the control container with a particular class name
          var container = L.DomUtil.create('div', 'legend-control-container');
          return container;
        }
    });
  map.addControl(new LegendControl());
};
function updateLegendContent() {
  //build html
  var legendContent;
  // create array to hold month names (plus year total)
  monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  currentMonth = monthArray[currentAttributeIndex()];
  //add formatted attribute to panel content string
  legendContent = currentMonth + "<p><b> 2015</b>";
  //set legend
  $(".legend-control-container").html(legendContent)
}

//Create sequence controls
function createSequenceControls(map) {
  var SequenceControl = L.Control.extend({
    options: {
        position: 'bottomleft'
    },

    onAdd: function (map) {
        // create the control container div with a particular class name
        var container = L.DomUtil.create('div', 'sequence-control-container');
    //create range input element (slider)
    $(container).append('<input class="range-slider" type="range" id="slider">');
    $(container).append('<button class="skip" id="reverse">Reverse</button>');
    $(container).append('<button class="skip" id="forward">Skip</button>');
    //set slider attributes. 12 months in an array is 0 to 11
    $('.range-slider', container).attr({
        max: 11,
        min: 0,
        value: 0,
        step: 1
    });
    //add skip buttons
    //replace button content with images
  //  $('#reverse', container).html('<img src="img/reverse.png">');
//    $('#forward', container).html('<img src="img/forward.png">');
    //click listener for skip buttons
    $('.skip',container).click(function() {
        //get index value
        var index = $('.range-slider').val();
        //increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward') {
            index++;
            //if past the last attribute, wrap around to first attribute
            index = index > 11 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse') {
            index--;
            //if past the first attribute, wrap around to last attribute
            index = index < 0 ? 11 : index;
        };
        //update slider
        $('.range-slider').val(index);
        //Called in both skip button and slider event listener handlers
        //pass new attribute to update symbols
        updateAll(map);
    });
    //input listener for slider
    $('#slider',container).on('input', function() {
        //get the new index value
        var index = $(this).val();
        //Called in both skip button and slider event listener handlers
        //pass new attribute to update symbols
        updateAll(map);
    });
    //kill any mouse event listeners on the map
    $(container).on('mousedown dblclick', function(e){
        L.DomEvent.stopPropagation(e);
    });
    return container;
    }
    });
    map.addControl(new SequenceControl());
};


//build an attributes array from the data
function processData(data) {
    //empty array to hold attributes
    attributes = [];
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;
    //push each attribute name into attributes array
    for (var attribute in properties) {
        //only take attributes with refugee APPlication values
        if (attribute.indexOf("app") > -1) {
            attributes.push(attribute);
        };
    };
    return attributes;
};

//Import GeoJSON data
function getData(map) {
    //load the data from the point geojson
    $.ajax(pointsDataSource, {
        dataType: "json",
        success: function(response) {
            //create an attributes array
            processData(response);
            //call function to create proportional symbols
            createPropsMap(response, map);


        }
    });
    //load the data from the polygon geojson
    $.ajax(polygonsDataSource, {
        dataType: "json",
        success: function(response) {
            //call funtion to create the choropleth map
            createChoropleth(response, map);
        }
    });
    //call function to create sequence controls
    createSequenceControls(map);
    //call function to create panel content
    updatePanelContent();
    //call function to create temporal legend
    createLegendContent(map);
    updateLegendContent()
};
// create the map - this starts everything off
$(document).ready(createMaps);
