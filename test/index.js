'use strict';

/** Alexa Ham Radio Propogation
 ** Tests of API Function
 ** @author Derek Brown
 **/

 var _ = require('lodash');

 var chai = require('chai');
 var assert = chai.assert;    // Using Assert style
 var expect = chai.expect;    // Using Expect style
 var should = chai.should();  // Using Should style

 var band_status = require('../band_status');

 describe('HamQSL API', function(){
   it('Should Fetch Band Reports', function(){
     band_status.getBandReportJSON()
     .then(function(res){

       // Check Updated Field
       expect(res).to.have.property('updated');
       expect(res.updated).to.be.a('date');

       // Iterate Over Band Conditions
       expect(res).to.have.property('band_status');
       expect(res.band_status).to.be.a('object');

       _.each(alexa_ham_forecast.times, function(time){
         expect(res.band_status).to.have.property(time);
         expect(res.band_status[time]).to.be.a('object');

         _.each(alexa_ham_forecast.bands, function(band){
           expect(res.band_status.time).to.have.property(band);
           expect(res.band_status[time][band]).to.be.a('string');
         })
       })
     })
   })
 });
