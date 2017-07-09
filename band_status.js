'use strict';

/** Alexa Ham Radio Propogation
 ** Alexa SKill for getting band report
 ** @author Derek Brown
 **/

 var Promise = require("bluebird");
 var _ = require('lodash');
 require('datejs')
 var rp = require('request-promise');
 var parseString = require('xml2js').parseString;
 var Ajv = require('ajv');

 /*
  *  JSON Schema
  */
  exports.times = ["day", "night"];
  exports.bands = ["80m-40m", "30m-20m", "17m-15m", "12m-10m"];

  var solarDataSchema = {
    "type" : "object",
    "properties" : {
      "solar" : {
        "type" : "object",
        "properties" : {
          "solardata" : {
            "type" : "array",
            "contains" : {
              "type" : "object",
              "properties" : {
                "updated" : {
                  "type" : "array",
                  "items" : { "type" : "string"}
                },
                "calculatedconditions" : {
                  "type" : "array",
                  "contains" : {
                    "type" : "object",
                    "properties" : {
                      "band" : {
                        "type" : "array",
                        "items" : {
                          "type" : "object",
                          "properties" : {
                            "_" : {"type" : "string"},
                            "$" : {
                              "type" : "object",
                              "properties" : {
                                "name" : {
                                  "type" : "string",
                                  "enum" : exports.bands
                                },
                                "time" : {
                                  "type" : "string",
                                  "enum" : exports.times
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  var ajv = new Ajv();
  var validate = ajv.compile(solarDataSchema);

 /*
  * getBandReportJSON
  * @returns Promise<Object>
  */
exports.getBandReportJSON = function(){

   // Fetch from Web
   return rp({
     uri: 'http://www.hamqsl.com/solarxml.php',
     method: 'GET'
   })

   // Parse HTML
   .then(function(body){
     return new Promise(function(resolve, reject){
       parseString(body, {trim: true}, function(err, res){
         if(err){
           reject(err);
         } else {
           resolve(res);
         }
       })
     })
   })

   // Validate JSON String
   .then(function(json){
     return new Promise(function(resolve, reject){
       if(validate(json)){
         resolve(json);
       } else {
         reject("Couldn't Validate JSON");
       }
     })
   })

   // Parse Results
   .then(function(json){
     return new Promise(function(resolve, reject){
       var root = json.solar.solardata[0];

       // Check Updated is Valid Date
       if(isNaN(Date.parse(root.updated[0]))){
         reject("Invalid Date.");
       } else {
         var output = {
           "updated" : Date.parse(root.updated[0]),
           "band_status" : {
             "night" : {},
             "day" : {}
           }
         }

         _.each(root.calculatedconditions[0].band, function(band){
           output['band_status'][band['$']['time']][band['$']['name']] = band['_'];
         });

         resolve(output);
       }
     })
   })
 }
