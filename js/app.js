// the knockout.js code for the neighborhood map project.
var airmeasurements = []; // new measurements
var previousMeasurements = []; // previous airmeasurements
var appViewModel = new AppViewModel(); // app
var airfilter = new Airfilter();
var googleMap = new GoogleMap(); // the map..

function AppViewModel() {
  // These are the initial options
  var self = this;
  // Object airLevel to construct filters with description and level
  var Airlevel = function(description, level) {
          this.description = description;
          this.level = level;
      };
  self.name = "Neighborhood Air Application";
  self.stationList = ko.observableArray();
  self.ozoneSet = false;
  self.no2Set = false;
  self.pm10Set = false;
  self.levelMessage = ko.observable("No Filter Set");
  self.updates = ko.observable(false);
  /*
    List needed to filter nodes with particular levels
    of a particular substance.
    low, medium or high
    */
  self.airFilterList = ko.observableArray(
    [new Airlevel("Stations with low levels of ozone", "oLow"),
     new Airlevel("Stations with medium levels of ozone", "oMed"),
     new Airlevel("Stations with high levels of ozone", "oHigh"),
     new Airlevel("Stations with low levels of no2", "nLow"),
     new Airlevel("Stations with medium levels of no2", "nMed"),
     new Airlevel("Stations with high levels of no2", "nHigh"),
     new Airlevel("Stations with low levels of pm10", "pLow"),
     new Airlevel("Stations with medium levels of pm10", "pMed"),
     new Airlevel("Stations with high levels of pm10", "pHigh"),
   ]);

  /*
     function to filter selected noxious substance
     currently three substances: ozone, no2 and pm10.
  */
  self.filterSelected = function(data, event){
    // re-center the map.
    googleMap.centerMap();
    // reset the zoom level.
    googleMap.resetZoom();
    // reset the filter settings.
    self.resetFilters();
    if(event.target.id === "ozone"){
      self.ozoneSet = true;
      self.setDisplayMessage("ozone");
    }else if(event.target.id === "no2"){
      self.no2Set = true;
      self.setDisplayMessage("no2");
    }else if(event.target.id === "pm10"){
      self.pm10Set = true;
      self.setDisplayMessage("pm10");
    }
    collectAirData();
  };

  /* Display message function the type is filtertype and
     extra is an optional parameter for extra message */
  self.setDisplayMessage = function(type, extra){
    // when displaying then flash the message code should be moved.
    $('#over-map').removeClass("flash");
    setTimeout(function() {
        $("#over-map").addClass("flash");
    }, 1);
    // extra is used to give the amount of nodes displayed.
    if(typeof(extra) === 'undefined'){
      extra = "";
    }
    switch (type) {
      case "ozone":
         self.levelMessage("Displaying Ozone Levels\n" + extra);
        break;
      case "no2":
         self.levelMessage("Displaying NO2 levels\n" + extra);
        break;
      case "pm10":
        self.levelMessage("Displaying Particulate Matter Levels (PM10)\n" + extra);
        break;
      default: self.levelMessage("No Filter Set\n" + extra);
    }
  };

  self.singleUpdate = function(){
    googleMap.centerMap();
    collectAirData();
  };
  /* Reset the map */
  self.reset = function(){
    googleMap.resetZoom();
    googleMap.centerMap();
    self.resetFilters();
    self.setDisplayMessage();
    collectAirData();
  };
  // timed update function.
  self.startUpdating = function(){
    if(self.updates()){
    startAutoUpdate(true);
  }else{
    startAutoUpdate(false);
  }
    return true;
  };

  self.displayStation = function(data, event){

    var station = event.target.value;
    var marker = googleMap.getMarkerByTitle(station);
    googleMap.activateMarker(marker);

  };

 /* helper function to reset filters */
  self.resetFilters = function(){
    self.ozoneSet = false;
    self.pm10Set = false;
    self.no2Set = false;
  };

  /*
    update which stations to display, by setting a filter.
  */
  self.updateFilter = function(data, event){
    googleMap.centerMap();
    var selectedValue = event.target.value;
    var measurements = [];

    // reset filters
    self.resetFilters();
    measurements = updateFilter(selectedValue);
    updateMap(measurements);
  };

  self.openControlPanel = function(){
    $("#controlPanel").css("width", "250px");
    $("#controlMenu").hide();
  };

  self.closeControlPanel = function(){
    $("#controlPanel").css("width", "0px");
    $("#controlMenu").show();
};

  self.displayHelp = function(){
    // close the map and all other divs
    $("#modal").html("");
    $('#map').hide();
    if($("#controlPanel").is(":visible")){
       self.closeControlPanel();
     }
    $('#controlMenu').hide();
    $('#help-btn').hide();
    // reset the content
    var content = $("#help-text").html();
    $('#modal').append(content).slideDown("slow");
  };
} // end knockout class


/*
   function to do autoupdates is only useful for longer time intervals
   the measurements are not real time they are updated about every 10 minutes
*/
var autoUpdates;
function startAutoUpdate(go){
if(go){
  autoUpdates = setInterval(function () {
  collectAirData();
}, 20000, true);
 }else{
   clearInterval(autoUpdates);
  }
 }

function collectAirData(){
  // the locations must come from the json file, load the data in the map.
  // store previous data first.
  storePreviousMeasurements();
  // then delete the current airmeasurements
  airmeasurements = [];
  // do the data collection.
  $.getJSON("http://data.aireas.com/api/v1/?airboxid=*")
    .done(function(data) {

      $.each(data, function(key, value) {

          var airObject = data[key];
          /* reading variables from the json */
          var ambHum = airObject.AMBHUM;
          var ambTemp = airObject.AMBTEMP;
          var no2 = airObject.NO2;
          var ozon = airObject.OZON;
          var pm1 = airObject.PM1;
          var pm10 = airObject.PM10;
          var pm25 = airObject.PM25;
          var relHum = airObject.RELHUM;
          var temp = airObject.TEMP;
          var ufp = airObject.UFP;
          var gps = airObject.gps;
          var name = airObject.name;
          var utctimestamp = airObject.utctimestamp;

   var airmeasurement = new Airmeasurement(ambHum, ambTemp, no2,
                                           ozon, pm1, pm10, pm25,
                                           relHum, temp, ufp,
                                           gps, name, utctimestamp);
    airmeasurements.push(airmeasurement);

  });
    updateMap(airmeasurements);
})
  .fail(function( jqxhr, textStatus, error ) {
    var err = textStatus + ", " + error;
    $("#error").append("Airmeasurement Data Could Not Be Loaded.");
    console.log( "Request Failed: " + err );
});
}

/* update function checks if there are filters */
function updateMap(airmeasurements){

    // Before updating check the settings of the filters.
    var markers = [];
    googleMap.removeAllMarkers();
    appViewModel.stationList(["-- Stations --"]);

    $.each(airmeasurements, function(key, measurement){
       // create basic marker via position.
       var position = measurement.getLatLng();
       var title = "Station: " + measurement.getName().split(".")[0];
       var marker = googleMap.createMarker(position, title);
       // create the infoWindow for the marker.
       googleMap.createMarkerInfoWindow(measurement, marker);
       // add marker to map.
       checkFilters(measurement, marker);
       googleMap.putMarkerOnMap(marker);
       markers.push(marker);
       appViewModel.stationList.push(marker.getTitle());
    });
      // sort the stations
      var sortedList = sortStationSelectList(appViewModel.stationList());
      appViewModel.stationList(sortedList);
}

/*
   Helper function to sort the station select list.
   The list has to be sorted by ending number.
*/
function sortStationSelectList(unsortedList){
  // Need a list with the amount of stations (1 is the -- Stations -- entry)
  var sortedList = [unsortedList.length-1];
  // split the listitems in text and number.
  for(var index = 0; index < unsortedList.length; index++){
    if(unsortedList[index] === '-- Stations --'){
        sortedList[0] = '-- Stations --';
    }
    var number = parseInt(unsortedList[index].split(" ")[1]);
    // put the number at the index-1;
    for(var index2 = 0; index2 < unsortedList.length; index2++){

      if(number === index2){
        sortedList[index2] = unsortedList[index];
      }
    }
  }
  return sortedList;
}

/*
  A function to color markers on the map according to the level
  of noxious substance in the air, there are three levels so far.
  @param: airmeasurement = the measurement coming in.
  @param: marker = the marker to be set.
  side effect is that the marker icon is changed according to level.
 */
function checkFilters(airmeasurement, marker){

  var level = "";

  if(appViewModel.ozoneSet === true ){
    var ozon = airmeasurement.getOzon();
    level = airfilter.getOzoneLevel(ozon);
    googleMap.setMarkerIcon(marker, level);
  }

  if(appViewModel.no2Set === true ){
    var no2 = airmeasurement.getNo2();
    level = airfilter.getNo2Level(no2);
    googleMap.setMarkerIcon(marker, level);
  }

  if(appViewModel.pm10Set === true){
    var pm10 = airmeasurement.getPm10();
    level = airfilter.getPm10Level(pm10);
    googleMap.setMarkerIcon(marker, level);
  }
}

/* store previous measurements for reference */
function storePreviousMeasurements(){
      previousMeasurements = airmeasurements.slice();
}

function initMap(){
  googleMap.initMap();
}

function updateFilter(selectedValue){

  var firstChar = selectedValue[0];
  var measurements = [];
  var extra = "";
  var level = "";

  switch(selectedValue){

     case 'oLow':
      measurements = airfilter.filterLevel(airmeasurements, "ozone", "low");
      level = "low ozone levels";
      break;

     case 'oMed':
      measurements = airfilter.filterLevel(airmeasurements, "ozone", "medium");
      level = "medium ozone levels";
      break;

     case 'oHigh':
      measurements = airfilter.filterLevel(airmeasurements, "ozone", "high");
      level = "high ozone levels";
      break;

     case 'nLow':
      measurements = airfilter.filterLevel(airmeasurements, "no2", "low");
      level = "low no2 levels";
      break;

     case 'nMed':
      measurements = airfilter.filterLevel(airmeasurements, "no2", "medium");
      level = "medium no2 levels";
      break;

     case 'nHigh':
      measurements = airfilter.filterLevel(airmeasurements, "no2", "high");
      level = "high no2 levels";
      break;

     case 'pLow':
      measurements = airfilter.filterLevel(airmeasurements, "pm10", "low");
      level = "low particulate matter levels";
      break;

     case 'pMed':
      measurements = airfilter.filterLevel(airmeasurements, "pm10", "medium");
      level = "medium particulate matter levels";
      break;

     case 'pHigh':
      measurements = airfilter.filterLevel(airmeasurements, "pm10", "high");
      level = "high particulate matter levels";
      break;
    }

    // Produce extra message.
    var stations = measurements.length;
    if(stations === 0){
      extra = "No stations could be found with " + level;
    } else if(stations === 1) {
      extra = stations + " station found with " + level;
    } else{
      extra = stations + " stations found with " + level;
    }
    // calculate the amount of returned nodes as extra information...
    if(firstChar === 'o'){
      appViewModel.ozoneSet = true;
      appViewModel.setDisplayMessage("ozone", extra);
    }
    if(firstChar === 'n'){
      appViewModel.no2Set = true;
      appViewModel.setDisplayMessage("no2", extra);
    }
    if(firstChar === 'p'){
      appViewModel.pm10Set = true;
      appViewModel.setDisplayMessage("pm10", extra);
    }
    return measurements;
}

/* Failed to do this with ko.js it will not bind to span set display none*/
function closeHelp(){
 $('#map').show();
 $("#modal").slideUp("slow");
 $('#controlMenu').show();
 $('#help-btn').show();
}


ko.applyBindings(appViewModel); // Activates knockout.js
collectAirData(); // initial collecting of data.
