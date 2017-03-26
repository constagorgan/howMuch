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
      }, 
      refreshAccessToken: function(){
        var url = "http://localhost:8003/resetAccessToken"
        $.ajax({
          type: "POST",
          url: url,
          data: JSON.stringify({email:"justin.atanasiu@gmail.com", jwtToken:"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE0OTA0ODQzNTQsImp0aSI6IlhxVjRCYlpyNm5DeTRTM3owZG9FQk8zTFIrTFlVeER3V3NpNXZ3WE9MXC9BPSIsImlzcyI6Imh0dHA6XC9cL2xvY2FsaG9zdDo4MDAxIiwibmJmIjoxNDkwNDg0MzY0LCJleHAiOjE0OTEwODkxNjQsImRhdGEiOnsiaWQiOiI1NSIsIm5hbWUiOiJqdXN0aW4uYXRhbmFzaXVAZ21haWwuY29tIn19.zw2HIcwRVf9BSwtkyM4ocwYDCbubysrjrlOSpvHOBtx1pvet9vOKrI2fpa3iq-YneH2WGJdyil9Bi9oe1DVToA"}),
          success: function(data){
            try {
              data = JSON.parse(data) 
              if(data && data.resp && data.resp.jwt) 
                localStorage.accessToken = data.resp.jwt
            } catch(e){
              console.log('reset token JSON parse fail')
            }
          },
          error: function(err){console.log('reset token fail')}
        });
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
