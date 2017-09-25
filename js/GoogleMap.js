/*jshint esversion: 6 */
/* class Map to hold all google map items and encapsulate it
  from the evil world  */
  class GoogleMap {

    // the list that holds marker items that are on the map the
    // key is location so marker can be easily found.

    constructor() {
      this.markers = new Map();
      this.infowindows = [];
      this.map = null;
      this.centrum = {lat: 51.441642, lng: 5.4697225};
    }

    // initiate map with default center.
    initMap() {

           this.map = new google.maps.Map(document.getElementById('map'),
                 { zoom: 11,
                   center: this.centrum
                 });

           var centrum_marker = new google.maps.Marker({
             position: this.centrum,
             map: this.map,
             title: 'Centrum Eindhoven',
             icon: 'resources/blue_MarkerC.png'
             // 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
           });
         }

    // update the map. not sure if this function is needed.
    updateMap(markers){

         for(var i=0; i<markers.length;i++){
           this.putMarkerOnMap(markers[i]);
         }

      }

    // returns all the markers situated on the map.
    getMarkers(){
      var markers = [];
      for(var value of this.markers.entries()){
        markers.push(value[1]);
      }
      return markers;
    }

    /** Put marker on the map and in the collection markers */
    putMarkerOnMap(marker){
      // put marker on the map.
      marker.setMap(this.map);
      //at same time store marker in currentMarkers.
      var key = marker.getPosition();
      // add to markers
      this.markers.set(key, marker);
    }

/* removes all markers currently on the map */
    removeAllMarkers(){

     for(var value of this.markers.entries()){
       this.removeMarkerFromMap(value[1]);
     }
      this.markers.clear();
  }

/* removes a specific marker from the map */
    removeMarkerFromMap(marker){
      // remove from map
      marker.setMap(null);
      // remove from marker array.
      var key = marker.getPosition();
      // delete from markers
      this.markers.delete(key);
    }

    // stops animation on all markers.
    quitAnimation(){

      for(var value of this.markers.entries()){
        value[1].setAnimation(null);
      }
    }

    // create marker with position and a title, and returns this marker.
    createMarker(position, title){

      var marker = new google.maps.Marker({
                                       position: position,
                                       map: this.map,
                                       title: title,
                                       icon: 'resources/brown_MarkerA.png',
                                       animation: google.maps.Animation.DROP});
      return marker;
    }

    /* function to create a marker from an airmeasurement object */
    createMarkerInfoWindow(airmeasurement, marker){

      var self = this;
      var time = airmeasurement.getUtcTimestamp();
      var temp = airmeasurement.getAmbTemp();
      var humidity = airmeasurement.getAmbHum();
      var ozon = airmeasurement.getOzon();
      var no2 = airmeasurement.getNo2();
      var pm1 = airmeasurement.getPm1();
      var pm10 = airmeasurement.getPm10();
      var ufp = airmeasurement.getUfp();
      var station = airmeasurement.getName().split(".")[0];

      var contentStr =  "<div id='infowindow'>" +
                        "<h5>Measurements Eindhoven at time: " +
                        time.split(" ")[1] + "</h5>" +
                        "<h6>Date: " + time.split(" ")[0] + "</h6>" +
                        "<h6>Station: " + station + "</h6>" +
                        "<ul>" +
                        "<li>Temperature: " + temp + "</li>" +
                        "<li>Relative Humidity: " + humidity + "%</li>" +
                        "<li>Ozon: " + ozon + "</li>" +
                        "<li>NO2: " + no2 + "</li>" +
                        "<li>PM1: " + pm1 + "</li>" +
                        "<li>PM10: " + pm10 + "</li>" +
                        "<li>UFP: " + ufp + "</li>" +
                        "</li></ul></div>";

          var infowindow = new google.maps.InfoWindow({content: contentStr});
          google.maps.event.addListener(marker, 'click', function(e) {
            self.markerListener(marker, infowindow);}, false);
    }

    /* set up a listener to listen for events on this marker
       in this case for opening an infowindow */
     markerListener(marker, infowindow){

        var markerAnimated = false;
        this.closeAllInfowindows();
        if(marker.getAnimation() !== null){
          markerAnimated = true;
        }
        this.quitAnimation(); // stop all markers animation.
        if(!markerAnimated){
        marker.setAnimation(google.maps.Animation.BOUNCE);
      }
        this.centerMapOn(marker.getPosition());
        infowindow.open(this.map, marker);
        this.infowindows.push(infowindow);
    }

    // set a marker to an icon depending on a level(low, medium or high).
    setMarkerIcon(marker, level){

      var iconLow = "resources/green_MarkerA.png";
      // "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
      // green is low level
      var iconMedium = "resources/yellow_MarkerA.png";
      // "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
      // yellow is medium
      var iconHigh = "resources/red_MarkerA.png";
      // "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
      // red is high

      if (level === "low") {
        marker.setIcon(iconLow);
      }
      else if (level === "medium"){
        marker.setIcon(iconMedium);
      }
      else {
        marker.setIcon(iconHigh);
      }
    }

  // is there a marker with this position in the collection of markers?
  // the key of the map with markers is its position.
  hasMarker(position){
    return this.markers.has(position);
  }

  closeAllInfowindows(){

    for (var i=0;i<this.infowindows.length;i++) {
     this.infowindows[i].close();
  }
    this.infowindows = [];
  }

  centerMap(){
     this.map.panTo(this.centrum);
  }

  centerMapOn(position){
    this.map.panTo(position);
  }

  activateMarker(marker){
    google.maps.event.trigger(marker, 'click');
  }

  getMarkerByTitle(title){
    var marker;
    for(var value of this.markers.entries()){
      if(value[1].getTitle() === title){
        marker = value[1];
      }
    }
    return marker;
   }

   resetZoom(){
     this.map.setZoom(11);
   }

  } // end class Map
