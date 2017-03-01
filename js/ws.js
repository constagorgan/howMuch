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
        that.addCountryCodeToUrl(url + locationDetails, success, error)
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
    addCountryCodeToUrl: function (url, success, error) {
      $.ajax({
        type: "GET",
        url: url,
        success: function (response) {
          success(JSON.parse(response));
        },
        error: function (response) {
          console.log("Eroare in ws.js la metoda addCountryCodeToUrl: " + response);
          //          $("#loader").hide();
        }
      });
    },
    getRandomEvent: Backbone.Model.extend({
      idAttribute: '_id',
      initialize: function () {
        $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
          options.crossDomain = {
            crossDomain: true
          }
        })
      },
      urlRoot: 'http://localhost:8003/getEvent'
    }),
    searchEvents: Backbone.Model.extend({
      idAttribute: '_id',
      initialize: function () {
        $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
          options.crossDomain = {
            crossDomain: true
          }
        })
      },
      urlRoot: 'http://localhost:8003/searchEvents'
    }),
    getEvent: Backbone.Model.extend({
      idAttribute: '_id',
      initialize: function () {
        $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
          options.crossDomain = {
            crossDomain: true
          }
        })
      },
      urlRoot: 'http://localhost:8003/getEvent'
    }),
    getEventsInCategory: function (nameParam, categoryId, sortType, pageOffset, success, error) {
      var url = 'http://localhost:8003/getUpcomingEvents?name=' + nameParam + '&categoryId=' + categoryId + '&orderType=' + sortType + '&index=' + pageOffset
      $.ajax({
        type: 'GET',
        url: url,
        success: function (response) {
          console.log(response);
          success(response);
        },
        error: function (error) {
          console.log('Error getting events in category.');
          // error();
        }
      })
    }
  };
});
