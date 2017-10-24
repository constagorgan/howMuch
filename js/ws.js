/*global define, console, alert */
/*jslint nomen: true */
define([

  "jquery",
  "underscore",
  "backbone",
  "config"
], function ($, _, Backbone, config) {
  'use strict';

  var getIpLocation = function () {
    try {
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
    } catch (err){
      alert('This browser does not support Event Snitch in incognito mode.')
    }
  }
  var saveIpLocation = function (locationDetails) {
    try {
      localStorage.setItem('eventSnitchLocationCache', locationDetails.country_code.toLowerCase())
      localStorage.setItem('eventSnitchLocationCacheDateSet', new Date().toISOString())
    } catch (err){
      alert('This browser does not support Event Snitch in incognito mode.')
    }
  }

  return {
    getAccessToken: function () {
      return localStorage.getItem('eventSnitchAccessToken') || sessionStorage.getItem('eventSnitchAccessToken')
    },
    setAccessToken: function (data) {
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
    getConfirmSignUpResponse: function (options, success) {
      var url = config.server.url + '/confirmSignUp'
      $("#loader").removeClass('display_none');
      if (options.token && options.email)
        url += '?email=' + options.email + '&key=' + options.token
      $.ajax({
        type: 'GET',
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
            $("#loader").addClass('display_none');
          }
        },
        error: function (err) {
          if (err && err.responseText) {
            console.log(err);
            try {
              var parsedResp = JSON.parse(err.responseText)
              if (parsedResp.message)
                success(parsedResp.message)
            } catch (e) {
              //log e
            }
            $("#loader").addClass('display_none');
          }
        }
      });
    },
    getConfirmResetPassResponse: function (options, success) {
      var url = config.server.url + '/confirmReset'
      $("#loader").removeClass('display_none');
      if (options.token && options.email && options.username)
        url += '?email=' + options.email + '&key=' + options.token + '&username=' + options.username
      $.ajax({
        type: 'GET',
        url: url,
        success: function (response) {
          if (response) {
            try {
              var parsedResp = JSON.parse(response)
              if (parsedResp.message)
                success(parsedResp.message)
            } catch (e) {
              success('Bad request!')
            }
            $("#loader").addClass('display_none');
          }
        },
        error: function (err) {
          if (err) {
            console.log(err);
            try {
              var parsedResp = JSON.parse(err.responseText)
              if (parsedResp.message)
                success(parsedResp.message)
            } catch (e) {
              success('Bad request!')
            }
            $("#loader").addClass('display_none');
          }
        }
      });
    },
    editEvent: function (editEventDetails, success, error) {
      var url = config.server.url + '/editEvent';
      var that = this
      $.ajax({
        type: 'POST',
        data: JSON.stringify(editEventDetails),
        url: url,
        success: function (response) {
          success(response)
        },
        error: function (response) {
          error(response)
        }
      });
    },
    createEvent: function (createEventDetails, success, error) {
      var url = config.server.url + '/addEvent';
      var that = this
      $.ajax({
        type: 'POST',
        data: JSON.stringify(createEventDetails),
        url: url,
        success: function (response) {
          success(response)
        },
        error: function (err) {
          error(err)
        }
      });
    },
    signIn: function (signInDetails, success, error) {
      var url = config.server.url + '/signIn';
      $.ajax({
        type: 'POST',
        data: JSON.stringify(signInDetails),
        url: url,
        success: function (response) {
          success(response);
        },
        error: function (response) {
          console.log('ws error', response);
          error(response)
        }
      });
    },
    signUp: function (signUpDetails, success, error) {
      var url = config.server.url + '/signUp';
      $.ajax({
        type: 'POST',
        data: JSON.stringify(signUpDetails),
        url: url,
        success: function (response) {
          success(response);
        },
        error: function (response) {
          console.log('ws error', response);
          error(response)
        }
      });
    },
    resetPassword: function (resetPassDetails, success) {
      var url = config.server.url + '/resetPassword';
      $.ajax({
        type: 'POST',
        data: JSON.stringify(resetPassDetails),
        url: url,
        success: function (response) {
          success(response);
        }
      });
    },
    changePassword: function (changePassDetails, success, error) {
      var url = config.server.url + '/changePassword';
      var that = this
      $.ajax({
        type: 'POST',
        data: JSON.stringify(changePassDetails),
        url: url,
        success: function (response) {
          that.setAccessToken(response)
          success(response)
        },
        error: function (response) {
          error(response)
        }
      });
    },
    getEventsByCategory: function (success, error) {
      var that = this
      $("#loader").removeClass('display_none');
      var url = config.server.url + '/searchCategories?country_code=';
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
          type: 'GET',
          url: url,
          success: function (locationDetails) {
            saveIpLocation(locationDetails)
            success(locationDetails.country_code.toLowerCase());
          },
          error: function (err) {
            console.log('ws error', err);
          }
        });
      } else {
        success(location)
      }
    },
    getCountriesList: function (success) {
      var url = config.server.url + '/getCountries';
      $.ajax({
        type: 'GET',
        url: url,
        success: function (countries) {
          success(JSON.parse(countries));
        },
        error: function (err) {
          console.log(err);
        }
      });
    },
    addCountryCodeToUrl: function (url, locationDetails, success, error) {
      $.ajax({
        type: 'GET',
        url: url,
        success: function (response) {
          success(JSON.parse(response), locationDetails);
          $("#loader").addClass('display_none');
        },
        error: function (response) {
          $("#loader").addClass('display_none');
        }
      });
    },
    getRandomEvent: function (success, error) {
      var url = config.server.url + '/getEvent'
      $.ajax({
        type: 'GET',
        url: url,
        success: function (response) {
          success(JSON.parse(response));
        },
        error: function (response) {

        }
      });
    },
    searchEvents: function (name, success, error) {
      var url = config.server.url + '/searchEvents?name=' + name
      $.ajax({
        type: 'GET',
        url: url,
        success: function (response) {
          success(JSON.parse(response));
        },
        error: function (response) {
          console.log('ws error', response);
          // $('#loader').hide();
        }
      });
    },
    getEvent: function (shouldLoad, id, name, success, error) {
      var url = config.server.url + '/getEvent'
      if(shouldLoad)
        $("#loader").removeClass('display_none');
      if (id && name) {
        url += '?id=' + id + '&name=' + encodeURIComponent(name)
        $.ajax({
          type: 'GET',
          url: url,
          success: function (response) {
            success(JSON.parse(response));
          },
          error: function (response) {
            $("#loader").addClass('display_none');
            $("#changeUtcButton").removeClass('display_none');
          }
        });
      }
    },
    getEventsInCategory: function (shouldLoad, categoryId, sortType, pageOffset, name, userName, countryCode, success, error) {
      if (categoryId || sortType || name) {
        if(shouldLoad)
          $("#loader").removeClass('display_none');
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
            $("#loader").addClass('display_none');
            success(response);
          },
          error: function (error) {
            $("#loader").addClass('display_none');
            console.log('Error getting events in category.');
            // error();
          }
        })
      }
    },
    refreshAccessToken: function () {
      var url = config.server.url + '/resetAccessToken'
      var that = this;
      $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify({
          jwtToken: that.getAccessToken()
        }),
        success: function (data) {
          that.setAccessToken(data)
        },
        error: function (err) {
          localStorage.setItem('eventSnitchAccessToken', '')
          sessionStorage.setItem('eventSnitchAccessToken', '')
        }
      });
    },

    getLoggedUserEvents: function (shouldLoad, orderType, index, success, error) {
      var url = config.server.url + '/getLoggedUserEvents'
      if(shouldLoad)
        $("#loader").removeClass('display_none');
      var that = this;
      $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify({
          jwtToken: that.getAccessToken(),
          orderType: orderType,
          index: index
        }),
        success: function (response) {
          $("#loader").addClass('display_none');
          success(response);
        },
        error: function (error) {
          $("#loader").addClass('display_none');
          window.location.hash = '#'
        }
      })

    },
    getLocationSuggestion: function (textInput, success, error) {
      var url = config.server.url + '/getEventLocations'
      var that = this
      $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify({
          jwtToken: that.getAccessToken(),
          name: textInput
        }),
        success: function (response) {
          success(JSON.parse(response));
        },
        error: function (response) {

        }
      });
    },
    getLocation: function (magicKey, id, success, error) {
      var url = config.server.url + '/getEventPlace&key=' + magicKey + '&id=' + id

      $.ajax({
        type: 'GET',
        url: url,
        success: function (response) {
          success(JSON.parse(response))
        },
        error: function (response) {
          error();
        }
      });
    },
    getEventInfo: function(keywords, name, id, success, error) {
      var url = config.server.url + '/getEventInfo'
      var that = this
      $.ajax({
        type: 'POST',
        data: JSON.stringify({
          keywords: keywords,
          name: name,
          id: id
        }),
        url: url,
        success: function (response) {
          success(response)
        },
        error: function (response) {
          error(response)
        }
      });
    }
  };
});
