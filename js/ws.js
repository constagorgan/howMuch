/*global define, console, alert */
/*jslint nomen: true */
define([

  "jquery",
  "underscore",
  "backbone"
], function ($, _, Backbone) {
  "use strict";

  return {
    getEventsByCategory: function (success, error) {
      var that = this
      var url = "http://localhost:8003/searchCategories?country_code=";
      this.getCountryCode(function (locationDetails) {
        that.addCountryCodeToUrl(url + locationDetails, locationDetails, success, error)
      }, function (locationDetails) {
        that.addCountryCodeToUrl(url + 'world', success, error)
      });

    },
    getCountryCode: function (success, error) {
      var url = "http://freegeoip.net/json/";
      $.ajax({
        type: "GET",
        url: url,
        success: function (locationDetails) {
          success(locationDetails.country_code.toLowerCase());
        },
        error: function (locationDetails) {
          console.log("Eroare in ws.js la metoda getCountryCode: " + locationDetails);
          //          $("#loader").hide();
        }
      });
    },
    addCountryCodeToUrl: function (url, locationDetails, success, error) {
      $.ajax({
        type: "GET",
        url: url,
        success: function (response) {
          success(JSON.parse(response), locationDetails);
        },
        error: function (response) {
          console.log("Eroare in ws.js la metoda addCountryCodeToUrl: " + response);
          //          $("#loader").hide();
        }
      });
    },
    getRandomEvent: function(success, error){
      var url = 'http://localhost:8003/getEvent'
      $.ajax({
        type: "GET",
        url: url,
        success: function (response) {
          success(JSON.parse(response));
        },
        error: function (response) {
          console.log("Eroare in ws.js la metoda getRandomEvent: " + response);
          //          $("#loader").hide();
        }
      });
    },
    searchEvents: function(name, success, error){
      var url = 'http://localhost:8003/searchEvents?name=' + name
      $.ajax({
        type: "GET",
        url: url,
        success: function (response) {
          success(JSON.parse(response));
        },
        error: function (response) {
          console.log("Eroare in ws.js la metoda searchEvents: " + response);
          //          $("#loader").hide();
        }
      });
    },
    getEvent: function(id, name, success, error){
      var url = 'http://localhost:8003/getEvent'
      if(id && name){
        url += "?id=" + id + '&name=' + name
        $.ajax({
          type: "GET",
          url: url,
          success: function (response) {
            success(JSON.parse(response));
          },
          error: function (response) {
            console.log("Eroare in ws.js la metoda getEvent: " + response);
            //          $("#loader").hide();
          }
        });
      }
    },
    getEventsInCategory: function (categoryId, sortType, pageOffset, name, userName, countryCode, success, error) {
        if (categoryId || sortType || name) {
          var url = 'http://localhost:8003/getUpcomingEvents?index='+pageOffset
          if(categoryId){
            url += '&categoryId=' + categoryId
            if(countryCode && categoryId === 'local')
              url += '&' + countryCode
          }
          if(sortType)
            url += '&orderType=' + sortType
          if(name)
            url += '&name=' + name
          if(userName)  
            url += '&user=' + userName
            
          $.ajax({
            type: 'GET',
            url: url,
            success: function (response) {
              success(response);
            },
            error: function (error) {
              console.log('Error getting events in category.');
              // error();
            }
          })
        }
      }
      //    getEventsInCategory: function (nameParam, categoryId, sortType, pageOffset, success, error) {
      //      var url = 'http://localhost:8003/getUpcomingEvents?name=' + nameParam + '&categoryId=' + categoryId + '&orderType=' + sortType + '&index=' + pageOffset
      //      $.ajax({
      //        type: 'GET',
      //        url: url,
      //        success: function (response) {
      //          console.log(response);
      //          success(response);
      //        },
      //        error: function (error) {
      //          console.log('Error getting events in category.');
      //          // error();
      //        }
      //      })
      //    }
  };
});
