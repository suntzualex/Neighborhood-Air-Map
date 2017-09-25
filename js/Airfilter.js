/*jshint esversion: 6 */
/* class to filter the nodes on the map */
class Airfilter {

  /*
    Only show nodes above this level of ozone set
    Do this via the level calculated before.
  */
   filterLevel(airmeasurements, substance, level) {

    var measurements = [];
    switch (substance) {
      case "ozone":
        measurements = this.getOzoneByLevel(airmeasurements, level);
        break;
      case "no2":
        measurements = this.getNo2ByLevel(airmeasurements, level);
        break;
      case "pm10":
        measurements = this.getPm10ByLevel(airmeasurements, level);
        break;
    }
    // we want the measurements by levels
    return measurements;
  }

  getOzoneByLevel(airmeasurements, level){
    var measurements = [];
    var self = this;
    $.each(airmeasurements, function(key, measurement){
      var measuredLevel = self.getOzoneLevel(measurement.getOzon());
      if(measuredLevel === level){
        measurements.push(measurement);
      }
    });
    return measurements;
  }

  getNo2ByLevel(airmeasurements, level){
    var measurements = [];
    var self = this;
    $.each(airmeasurements, function(key, measurement){
      var measuredLevel = self.getNo2Level(measurement.getNo2());
      if(measuredLevel === level){
        measurements.push(measurement);
      }
    });
    return measurements;
  }

  getPm10ByLevel(airmeasurements, level){
    var measurements = [];
    var self = this;
    $.each(airmeasurements, function(key, measurement){
      var measuredLevel = self.getPm10Level(measurement.getPm10());
      if(measuredLevel === level){
        measurements.push(measurement);
      }
    });
    return measurements;
  }

    /**
    *  Values from dutch airquality manual.
    *  < 20 low
    *  20-30, 30-40, 40-50 medium
    *  > 50 high
    *
    **/
     getNo2Level(no2){

       var level = "";
       if(no2 < 20){
         level = "low";
       }
       if(no2 >= 20 && no2 <= 50){
         level = "medium";
       }
       if(no2 > 50){
         level = "high";
       }
       return level;
     }

    /**
     *   Change markers according to ozone concentration
     *   standard levels of Ozone [ug/m^3]
     *   < 60 Low
     *   60-120,120-180,180-200,200-220,220-240 Medium
     *   > 240 High
    **/
    getOzoneLevel(ozon){

      var level = "";
      if(ozon < 60){
        level = "low";
      }
      if(ozon >=60 && ozon <= 240){
        level = "medium";
      }
      if(ozon > 240){
        level = "high";
      }
      return level;
    }

    /**
    *   Updating those pm10 levels
    *   PM10 [ug/m^3]
    *   < 10  Low
    *   10-30 Moderate/Low, 30-50 Moderate, 50-75 Moderate, 75-125 Moderate,
    *  125-200 Moderate/High
    * > 200 High
    */
    getPm10Level(pm10){

      var level = "";
      if(pm10 < 10){
        level = "low";
      }
      if(pm10 >= 10 && pm10 <= 200){
        level = "medium";
      }
      if(pm10 > 200){
        level = high;
      }
      return level;
    }
}
