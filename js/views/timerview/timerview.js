/* global define, console */

define([
  'jquery',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2012-2022',
  'countdown',
  'backbone',
  'text!../../../templates/timerview/timerview.html',
  'views/common/chatview',
  'ws',
  '../../../Content/resources/resources',
  'common',
  './mapview'
], function ($, _, moment, countdown, Backbone, timerviewTemplate, ChatView, ws, Resources, common, TimerMapView) {
  'use strict'

  common.checkUserTimezone();
  var timezones = []
  var deadline
  var eventDateWithDuration
  var timeinterval = setInterval(function () {}, 1000)
  var globalEvent

  var currentTimezone
  var initialOffset
  var currentTimezoneName
  var currentTimezoneDisplay

  _.each(Resources.timezones, function (name, index) {
    var timezoneElement = moment.tz(name)
    timezones.push({
      display: common.getTimezoneDisplay(timezoneElement),
      offset: timezoneElement._offset,
      name: name
    })

  })

  var TimerviewView = Backbone.View.extend({
    initialize: function (options) {
      this.timerMapView = new TimerMapView();
      this.chatView = new ChatView(options)
      currentTimezone = localStorage.getItem('userTimezone') ? moment.tz(localStorage.getItem('userTimezone')) : moment.tz(moment.tz.guess())
      initialOffset = currentTimezone._offset
      currentTimezoneName = currentTimezone._z.name
      currentTimezoneDisplay = common.getTimezoneDisplay(currentTimezone)
      deadline = null
      globalEvent = null
      eventDateWithDuration = null
      this.options = options
      _.bindAll(this, 'render')
    },

    events: {
      'click #utcText': 'showTimezoneModal',
      'click #utcChange': 'showTimezoneModal',
      'change #commonModalSelect': 'updateClientTimezone'
    },
    showTimezoneModal: function () {
      common.timezoneModal()
    },
    updateClientTimezone: function () {
      common.updateClientTimezone('#commonModalSelect')
      $('#timezoneModal').modal('toggle')
      if (!globalEvent) {
        var selectedOffset = parseInt($('#commonModalSelect option:selected').attr('value'))
        initializeClock('clockdiv', selectedOffset, deadline, eventDateWithDuration);
      }
    },
    close: function () {
      this.chatView.close ? this.chatView.close() : this.chatView.remove();
      this.timerMapView.close ? this.timerMapView.close() : this.timerMapView.remove();
      this.remove();
    },
    render: function () {
      var that = this

      ws.getEvent(true, this.options.id, this.options.name, function (results) {
        if (!results || !results.length) {
          displayEvent(that, 'No event found!', false)
          clearInterval(timeinterval)
        } else {
          var response = results[0]
          $('html').css({
            'background': 'url(../Content/img/' + response.background + '.jpg) no-repeat center center fixed',
            'background-size': 'cover'
          })
          var localTimezone = _.findIndex(timezones, function (zone) {
            return zone._offeset = currentTimezone._offset;
          });
          timezones[localTimezone] = currentTimezone;
          if (response.isGlobal && parseInt(response.isGlobal)) {
            deadline = moment(response.eventDate).toDate()
            globalEvent = true
          } else {
            deadline = new Date(moment.utc(response.eventDate))
            globalEvent = false
          }
          eventDateWithDuration = new Date(deadline.getTime() + parseInt(response.duration)*1000)
          
          displayEvent(that, response.name, true)

          ws.getLocation(response.location, response.magicKey, function (result, userLocation) {
            var eventLocation
            if (result && result.candidates && result.candidates[0] && result.candidates[0].location)
              eventLocation = result.candidates[0].location;
            that.$('.map_view_anchor').html(that.timerMapView.$el);
            that.timerMapView.render(eventLocation, userLocation);
          }, function () {
          })
        }
      }, function (error) {
        console.log('fail')
      });
      return this
    }

  })

  function displayEvent(that, name, eventFound) {
    var template = _.template(timerviewTemplate)
    that.$el.html(template({
      timezones: timezones,
      currentTimezone: {
        display: currentTimezoneDisplay,
        offset: initialOffset,
        name: currentTimezoneName
      }
    }))
    that.$el.append(that.chatView.$el)
    $("#loader").addClass('display_none')
    $('#eventName').text(name)
    if (eventFound) {
      $("#changeUtcButton").removeClass('display_none')
      $('#utcText').text(currentTimezoneDisplay);
      initializeClock('clockdiv', initialOffset, deadline, eventDateWithDuration)
      that.chatView.render()
    }
  }

  function getNumber(theNumber) {
    if (theNumber > 0) {
      return "+" + theNumber;
    } else {
      return theNumber.toString();
    }
  }
  function setDaysSemiColon(){
    if($('#daysColValue').html() > 1000)
      $('.clock_container__days_colon').css({'right': (-$('#daysCol').width()/5.5) + 'px'})
    else if ($('#daysColValue').html() > 99)
      $('.clock_container__days_colon').css({'right': (-$('#daysCol').width()/7.3) + 'px'})
    else 
      $('.clock_container__days_colon').css({'right': '-10px'})
  }
  function updateTimezoneInfoText() {
    $('#utcText').text($('#commonModalSelect option:selected').text());
  }

  function initializeClock(id, offset, eventDate, eventDateWithDuration) {
    clearInterval(timeinterval)
    var clock = document.getElementById(id);
    var daysSpan = clock.querySelector('.days');
    var hoursSpan = clock.querySelector('.hours');
    var minutesSpan = clock.querySelector('.minutes');
    var secondsSpan = clock.querySelector('.seconds');
    var daysValueTitle = clock.querySelector('#days_value_title');
    var hoursValueTitle = clock.querySelector('#hours_value_title');
    var minutesValueTitle = clock.querySelector('#minutes_value_title');
    var secondsValueTitle = clock.querySelector('#seconds_value_title');
    var t;

    function updateClock() {
      var now = new Date((new Date()).getTime() + (offset - new Date().getTimezoneOffset()) * 60 * 1000);

      if (eventDate) {
        if (now < eventDate) {
          t = countdown(now, eventDate, countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS);
          $('#timeTitle').text('Time Left Until');
        } else if (now >= eventDate) {
          if (now < eventDateWithDuration) {
            t = countdown(now, eventDateWithDuration, countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS);
            $('#timeTitle').text('Time left of');
          } else {
            $('#timeTitle').text('Time passed since');
            t = countdown(now, eventDateWithDuration, countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS);
          }
        }
      }
      daysSpan.innerHTML = t.days;
      hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
      minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
      secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
      daysValueTitle.innerHTML = (t.days !== 1 ? "Days" : "Day");
      minutesValueTitle.innerHTML = (t.minutes !== 1 ? "Minutes" : "Minute");
      hoursValueTitle.innerHTML = (t.hours !== 1 ? "Hours" : "Hour");
      secondsValueTitle.innerHTML = (t.seconds !== 1 ? "Seconds" : "Second");
      setDaysSemiColon()


      var x = moment.tz.names;

      
      if (!t.days)
        $('#daysCol').hide();

    }
    updateClock();
    timeinterval = setInterval(function () {
      updateClock();
    }, 1000);
  }

  return TimerviewView
})
