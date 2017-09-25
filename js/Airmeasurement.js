/*jshint esversion: 6 */
class Airmeasurement{

  constructor(ambHum, ambTemp, no2, ozon, pm1, pm10, pm25, relHum, temp, ufp,
              gps, name, utctimestamp){

    this.ambHum = ambHum;
    this.ambTemp = ambTemp;
    this.no2 = no2;
    this.ozon = ozon;
    this.pm1 = pm1;
    this.pm10 = pm10;
    this.pm25 = pm25;
    this.relHum = relHum;
    this.temp = temp;
    this.ufp = ufp;
    this.gps = gps;
    this.name = name;
    this.utctimestamp = utctimestamp;
  }

 /* converts gps coordinate into lat or lng coordinate */
  convertGPS2LatLng(gpsValue){

       var degrees = Math.floor(gpsValue/100);
       var minutes = gpsValue - (degrees*100);
       var coordinate =  degrees + (minutes/60);

   return coordinate;
  }

  getAmbHum(){
    return this.ambHum;
  }

  getAmbTemp(){
    return this.ambTemp;
  }

  getNo2(){
    return this.no2;
  }

  getOzon(){
    return this.ozon;
  }

  getPm1(){
    return this.pm1;
  }

  getPm10(){
    return this.pm10;
  }

  getPm25(){
    return this.pm25;
  }

  getTemp(){
    return this.temp;
  }

  getUfp(){
    return this.ufp;
  }

  getGps(){
    return this.gps;
  }
  /* returns the lat/lng coordinates after conversion from gps coordinates */
  getLatLng(){
    var gps = this.getGps();
    var lat = this.convertGPS2LatLng(gps.lat);
    var lng = this.convertGPS2LatLng(gps.lon);
    var location = {"lat": lat, "lng": lng};
    return location;
  }

  getName(){
    return this.name;
  }

  getUtcTimestamp(){
    return this.utctimestamp;
  }

  // return the whole object as an "object" with slight modifications.
  getValueMap(){
    return {
            "ambHum":this.ambHum,
            "ambTemp": this.ambTemp,
            "no2": this.no2,
            "ozon": this.ozon,
            "pm1":this.pm1,
            "pm10": this.pm10,
            "pm25":this.pm25,
            "relHum":this.relHum,
            "temp": this.temp,
            "ufp": this.ufp,
            "latLng": this.getLatLng(),
            "name":this.name,
            "utcTimestamp": this.utctimestamp
          };
  }
}
