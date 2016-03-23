/* Map of GeoJSON data from 2015refugees.geojson */
//function to instantiate the Leaflet map
var attributes = []
var currentCountry = null

function createMap(){
    //create the map
    var map = L.map('map', {
        center: [50, 10],
        zoom: 4
    });
    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
    getData(map)
};
/*function createChoropleth {
    //making the geojson polygon layer accessible through this variable
    var geojson;
    //setting the colors for the ranges of refugee applications
    L.geoJson(data).addTo(map);(){function getColor(d) {
          return  d > 60000 ? '#253494' :
                  d > 50000  ? '#2c7fb8' :
                  d > 40000  ? '#41b6c4' :
                  d > 30000 ? '#7fcdbb' :
                  d > 20000   ? '#c7e9b4' :
                  d > 10000  ? '#ffffcc' :
                              '#FFEDA0'; //why is this here? do I need it?
    }
  };
//define a styling function for geojson layer so that its fillcolor depends
//on the number of refugee applications for that month
  function style(feature) {
    return {
        fillColor: getColor(feature.properties.density), //need to change from density
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
  };
};
  //get access to the layer that was hovered through e.target
  function highlightFeature(e) {
    var layer = e.target;
//set a thick grey border on the layer as a highlight effect
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
//bring the layer that was hovered over through e.target to front so that the
//border doesn't clash with nearby countries, except for IE or Opera because
//they have problems doing bringToFront on mouseover
    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
  };
//what happens on mouseout: reset the layer style to its default state
    function resetHighlight(e) {
      geojson.resetStyle(e.target);
    }
    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
//            click: zoomToFeature  //I don't want it to zoom to the country
        });
    }
    //I also want to be able to get the slider and infopanel to work on the choropleth
    geojson = L.geoJson(data, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
    geojson = L.geoJson(data, {style: style}).addTo(map);
};*/


    //calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 0.04;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);
    return radius;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    //Step 4: Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];
    //check
    console.log(attribute);
    //create marker options
    var options = {
        fillColor: "#41b6c4",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);
    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);
    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //popup content is now just the country name
    var popupContent = feature.properties.Country;

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius),
        closeButton: false
    });

    //event listeners to open popup on hover and fill panel on click
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
          if (currentCountry == feature)
            currentCountry = null;
          else
            currentCountry = feature;
          updatePanelContent();
        }
    });
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};
function updatePanelContent() {
    //build html
    var panelContent;


    if (currentCountry) {
      var attribute=attributes[$('.range-slider').val()];

      panelContent = "<p><b>Country:</b> " + currentCountry.properties.Country + "</p>";
      // create array to hold month names (plus year total)
      //    monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "Total for"];
      //add formatted attribute to panel content string
      panelContent += "<p><b>Refugee applications in</b>" + "<p><b>2015: </b>" + Number(currentCountry.properties[attribute]);;
    }
    else {
      panelContent = "<p><b>This is the intro panel information.</b>";
    }
    //set panel
    $("#info").html(panelContent)
};


//Add circle markers for point features to the map
function createPropSymbols(data, map){
    //create a Leaflet GeoJSON layer and add it to the map: this one adds the attributes
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};
//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
      if (layer.feature && layer.feature.properties[attribute]){
          //access feature properties
          var props = layer.feature.properties;

          //update each feature's radius based on new attribute values
          var radius = calcPropRadius(props[attribute]);
          layer.setRadius(radius);

/*          //add country to popup content string
          var popupContent = "<p><b>Country:</b> " + props.Country + "</p>";

          //add formatted attribute to panel content string
         var year = attribute.split("_")[1];
       popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " million</p>";

          //replace the layer popup
          layer.bindPopup(popupContent, {
             offset: new L.Point(0,-radius)
          });*/
      };
    });
};
//Step 1: Create new sequence controls
function createSequenceControls(map){
    //create range input element (slider)
    $('#controls').append('<input class="range-slider" type="range" id="slider">');
    //set slider attributes
    $('.range-slider').attr({
        max: 12,
        min: 0,
        value: 0,
        step: 1
    });
    //below Example 3.4...add skip buttons
$('#controls').append('<button class="skip" id="reverse">Reverse</button>');
$('#controls').append('<button class="skip" id="forward">Skip</button>');
  //Below Example 3.5...replace button content with images
    $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');
    //Step 5: click listener for buttons
    $('.skip').click(function(){
      //get the old index value
      var index = $('.range-slider').val();
      //Step 6: increment or decrement depending on button clicked
      if ($(this).attr('id') == 'forward'){
          index++;
          //Step 7: if past the last attribute, wrap around to first attribute
          index = index > 11 ? 0 : index;
      } else if ($(this).attr('id') == 'reverse'){
          index--;
          //Step 7: if past the first attribute, wrap around to last attribute
          index = index < 0 ? 11 : index;
      };

      //Step 8: update slider
      $('.range-slider').val(index);
      //Called in both skip button and slider event listener handlers
      //Step 9: pass new attribute to update symbols
      updatePropSymbols(map, attributes[index]);
      updatePanelContent();
  });

    //Step 5: input listener for slider
    $('#slider').on('input', function(){
      //Step 6: get the new index value
      var index = $(this).val();
    //Called in both skip button and slider event listener handlers
    //Step 9: pass new attribute to update symbols
    updatePropSymbols(map, attributes[index]);
    updatePanelContent();
    });
};

//Above Example 3.8...Step 3: build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("app") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};
//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/EuropeRefugees2015.geojson", {
        dataType: "json",
        success: function(response){
            //create an attributes array
            processData(response);
            //call function to create proportional symbols
            createPropSymbols(response, map);
            //call function to create sequence controls
            createSequenceControls(map);

            updatePanelContent();
        }
    });
};
$(document).ready(createMap);
