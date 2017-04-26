/*global define, console, alert */
/*jslint nomen: true */
define([

  "jquery",
  "underscore",
  "backbone",
  "config"
], function ($, _, Backbone, config) {
  "use strict";

  var getIpLocation = function () {
    if (localStorage.getItem('eventSnitchLocationCacheDateSet')) {
      var dateSet = new Date(localStorage.getItem('eventSnitchLocationCacheDateSet'))
      var now = new Date()
      if (Math.abs(now - dateSet) / 3.6e5 < 6) {
        return localStorage.getItem('eventSnitchLocationCache')
      } else
        return null;
    } else {
      return null
    }
  }
  var saveIpLocation = function (locationDetails) {
    localStorage.setItem('eventSnitchLocationCache', locationDetails.country_code.toLowerCase())
    localStorage.setItem('eventSnitchLocationCacheDateSet', new Date().toISOString())
  }

  return {
    getConfirmSignUpResponse: function (options, success) {
      var url = config.server.url + "/confirmSignUp"
      if (options.token && options.email)
        url += '?email=' + options.email + '&key=' + options.token
      $.ajax({
        type: "GET",
        url: url,
        success: function (response) {
          if (response) {
            try {
              var parsedResp = JSON.parse(response)
              if (parsedResp.message)
                success(parsedResp.message)
            } catch (e) {
              //log e
            }
          }
        },
        error: function (err) {
          if (err && err.responseText) {
            console.log("Eroare in ws.js la metoda getConfirmSignUpResponse: " + err);
            try {
              var parsedResp = JSON.parse(err.responseText)
              if (parsedResp.message)
                success(parsedResp.message)
            } catch (e) {
              //log e
            }
          }
        }
      });
    },
    getConfirmResetPassResponse: function (options, success) {
      var url = config.server.url + "/confirmReset"
      if (options.token && options.email && options.username)
        url += '?email=' + options.email + '&key=' + options.token + '&username=' + options.username
      $.ajax({
        type: "GET",
        url: url,
        success: function (response) {
          if (response) {
            try {
              var parsedResp = JSON.parse(response)
              if (parsedResp.message)
                success(parsedResp.message)
            } catch (e) {
              //log e
            }
          }
        },
        error: function (err) {
          if (err && err.responseText) {
            console.log("Eroare in ws.js la metoda getConfirmSignUpResponse: " + err);
            try {
              var parsedResp = JSON.parse(err.responseText)
              if (parsedResp.message)
                success(parsedResp.message)
            } catch (e) {
              //log e
            }
          }
        }
      });
    },
    signIn: function (signInDetails, success, error) {
      var url = config.server.url + "/signIn";
      $.ajax({
        type: "POST",
        data: JSON.stringify(signInDetails),
        url: url,
        success: function (response) {
          success(response);
        },
        error: function (response) {
          console.log("Eroare in ws.js la metoda signIn");
          error(response)
            //          $("#loader").hide();
        }
      });
    },
    signUp: function (signUpDetails, success, error) {
      var url = config.server.url + "/signUp";
      $.ajax({
        type: "POST",
        data: JSON.stringify(signUpDetails),
        url: url,
        success: function (response) {
          success(response);
        },
        error: function (response) {
          console.log("Eroare in ws.js la metoda signUp");
          error(response)
            //          $("#loader").hide();
        }
      });
    },
    resetPassword: function (resetPassDetails, success) {
      var url = config.server.url + "/resetPassword";
      $.ajax({
        type: "POST",
        data: JSON.stringify(resetPassDetails),
        url: url,
        success: function (response) {
          success(response);
        }
      });
    },
    changePassword: function (changePassDetails, success, error) {
      var url = config.server.url + "/changePassword";
      $.ajax({
        type: "POST",
        data: JSON.stringify(changePassDetails),
        url: url,
        success: function (response) {
          success(response);
        },
        error: function (response) {
          error(response)
        }
      });
    },
    getEventsByCategory: function (success, error) {
      var that = this
      var url = config.server.url + "/searchCategories?country_code=";
      this.getCountryCode(function (locationDetails) {
        that.addCountryCodeToUrl(url + locationDetails, locationDetails, success, error)
      }, function (locationDetails) {
        that.addCountryCodeToUrl(url + 'world', success, error)
      });

    },
    getCountryCode: function (success, error) {
      var location = getIpLocation()
      if (!location) {
        var url = config.iplocator.url;
        $.ajax({
          type: "GET",
          url: url,
          success: function (locationDetails) {
            saveIpLocation(locationDetails)
            success(locationDetails.country_code.toLowerCase());
          },
          error: function (locationDetails) {
            console.log("Eroare in ws.js la metoda getCountryCode: " + locationDetails);
            //          $("#loader").hide();
          }
        });
      } else {
        success(location)
      }
    },
    getCountriesList: function (success) {
      var url = config.server.url + "/getCountries";
      $.ajax({
        type: "GET",
        url: url,
        success: function (countries) {
          success(JSON.parse(countries));
        },
        error: function (err) {
          console.log("Eroare in ws.js la metoda getCountries: " + err);
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
    getRandomEvent: function (success, error) {
      var url = config.server.url + '/getEvent'
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
    searchEvents: function (name, success, error) {
      var url = config.server.url + '/searchEvents?name=' + name
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
    getEvent: function (id, name, success, error) {
      var url = config.server.url + '/getEvent'
      if (id && name) {
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
        var url = config.server.url + '/getUpcomingEvents?index=' + pageOffset
        if (categoryId) {
          url += '&categoryId=' + categoryId
          if (countryCode && categoryId === 'local')
            url += '&' + countryCode
        }
        if (sortType)
          url += '&orderType=' + sortType
        if (name)
          url += '&name=' + name
        if (userName)
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
    refreshAccessToken: function () {
      var url = config.server.url + "/resetAccessToken"
      $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify({
          jwtToken: localStorage.getItem('eventSnitchAccessToken') || sessionStorage.getItem('eventSnitchAccessToken')
        }),
        success: function (data) {
          try {
            data = JSON.parse(data)
            if (data && data.resp && data.resp.jwt) {
              if (localStorage.getItem('eventSnitchAccessToken'))
                localStorage.setItem('eventSnitchAccessToken', data.resp.jwt)
              else if (sessionStorage.getItem('eventSnitchAccessToken'))
                sessionStorage.setItem('eventSnitchAccessToken', data.resp.jwt)
            }
          } catch (e) {
            console.log('reset token JSON parse fail')
          }
        },
        error: function (err) {
          localStorage.setItem('eventSnitchAccessToken', '')
          sessionStorage.setItem('eventSnitchAccessToken', '')
        }
      });
    }

    //    getEventsInCategory: function (nameParam, categoryId, sortType, pageOffset, success, error) {
    //      var url = config.server.url + '/getUpcomingEvents?name=' + nameParam + '&categoryId=' + categoryId + '&orderType=' + sortType + '&index=' + pageOffset
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
