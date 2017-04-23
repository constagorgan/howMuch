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
  '../../../Content/resources/resources'
], function ($, _, moment, countdown, Backbone, timerviewTemplate, ChatView, ws, Resources) {
  'use strict'

  var timezones = []
  var deadline
  var eventDateWithDuration
  var timeinterval = setInterval(function () {}, 1000)
  var globalEvent
  
  
  var getTimezoneDisplay = function(timezone) {
    return timezone._z.name + ' GMT' + timezone.format('Z')
  }
  
  var currentTimezone = moment.tz(moment.tz.guess())
  var initialOffset = currentTimezone._offset
  var currentTimezoneDisplay = getTimezoneDisplay(currentTimezone)
  
  _.each(Resources.timezones, function(name, index) {
    var timezoneElement = moment.tz(name)
    timezones.push({display: getTimezoneDisplay(timezoneElement), offset: timezoneElement._offset})
    
  })
  
  
  var TimerviewView = Backbone.View.extend({
    initialize: function (options) {
      this.chatView = new ChatView(options)
      deadline = null;
      globalEvent = null;
      eventDateWithDuration = null;
      ws.getEvent(options.id, options.name, function (results) {
        if (!results || !results.length) {
          $('#eventName').text('No event found!')
          clearInterval(timeinterval)
        } else {
          var response = results[0]
          $('html').css({'background': 'url(../Content/img/' + response.background + '.jpg) no-repeat center center fixed', 'background-size': 'cover'})
          var localTimezone = _.findIndex(timezones, function (zone) {
            return zone._offeset = currentTimezone._offset;
          });
          timezones[localTimezone] = currentTimezone;
          $('#utcText').text(currentTimezoneDisplay);
          if (response.isGlobal && parseInt(response.isGlobal)) {
            deadline = new Date(response.eventDate)
            globalEvent = true
          } else {
            deadline = new Date(moment.utc(response.eventDate))
            globalEvent = false
          }
          eventDateWithDuration = new Date(deadline.getTime() + parseInt(response.duration));
          initializeClock('clockdiv', initialOffset, deadline, eventDateWithDuration);
          $('#eventName').text(response.name);
        }
      }, function (error) {
        console.log('fail')
      });
    },

    events: {
      'click #utcText': 'showTimezoneModal',
      'click #utcChange': 'showTimezoneModal',
      'change #commonModalSelect': 'updateClientTimezone'
    },
    showTimezoneModal: function () {
      $('#timezoneModal').modal('show');
    },
    updateClientTimezone: function () {
      $('#utcText').text($('#commonModalSelect option:selected').text());
      if (!globalEvent) {
        var selectedOffset = parseInt($('#commonModalSelect option:selected').attr('value'))
        initializeClock('clockdiv', selectedOffset, deadline, eventDateWithDuration);
      }
      $('#timezoneModal').modal('toggle')
    },
    close: function () {
      this.chatView.close ? this.chatView.close() : this.chatView.remove();
      $('html').css({'background': 'url(../Content/img/homepage_bg.jpg) no-repeat center center fixed', 'background-size': 'cover'})
      this.remove();
    },
    render: function () {
      var template = _.template(timerviewTemplate)
      this.$el.html(template({
        timezones: timezones,
        currentTimezone: {display: currentTimezoneDisplay, offset: initialOffset}
      }))
      this.$el.append(this.chatView.$el)
      this.chatView.render()
      return this
    }

  })

  function getNumber(theNumber) {
    if (theNumber > 0) {
      return "+" + theNumber;
    } else {
      return theNumber.toString();
    }
  }

  function initializeClock(id, offset, eventDate, eventDateWithDuration) {
    clearInterval(timeinterval)
    var clock = document.getElementById(id);
    var daysSpan = clock.querySelector('.days');
    var hoursSpan = clock.querySelector('.hours');
    var minutesSpan = clock.querySelector('.minutes');
    var secondsSpan = clock.querySelector('.seconds');
    var monthsSpan = clock.querySelector('.months');
    var weeksSpan = clock.querySelector('.weeks');
    var yearsSpan = clock.querySelector('.years');
    var daysValueTitle = clock.querySelector('#days_value_title');
    var hoursValueTitle = clock.querySelector('#hours_value_title');
    var minutesValueTitle = clock.querySelector('#minutes_value_title');
    var secondsValueTitle = clock.querySelector('#seconds_value_title');
    var monthsValueTitle = clock.querySelector('#months_value_title');
    var weeksValueTitle = clock.querySelector('#weeks_value_title');
    var yearsValueTitle = clock.querySelector('#years_value_title');
    var t;

    function updateClock() {
      var now = new Date((new Date()).getTime() + (offset - initialOffset) * 60 * 1000);
      if (eventDate) {
        if (now < eventDate) {
          t = countdown(now, eventDate, countdown.YEARS | countdown.MONTHS | countdown.WEEKS | countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS);
          $('#timeTitle').text('Time Left Until');
        } else if (now >= eventDate) {
          if (now < eventDateWithDuration) {
            t = countdown(now, eventDateWithDuration, countdown.YEARS | countdown.MONTHS | countdown.WEEKS | countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS);
            $('#timeTitle').text('Time left of');
          } else {
            $('#timeTitle').text('Time passed since');
            t = countdown(now, eventDateWithDuration, countdown.YEARS | countdown.MONTHS | countdown.WEEKS | countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS);
          }
        }
      }
      daysSpan.innerHTML = t.days;
      weeksSpan.innerHTML = t.weeks;
      monthsSpan.innerHTML = t.months;
      hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
      minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
      secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
      yearsSpan.innerHTML = t.years;
      daysValueTitle.innerHTML = (t.days !== 1 ? "Days" : "Day");
      minutesValueTitle.innerHTML = (t.minutes !== 1 ? "Minutes" : "Minute");
      hoursValueTitle.innerHTML = (t.hours !== 1 ? "Hours" : "Hour");
      secondsValueTitle.innerHTML = (t.seconds !== 1 ? "Seconds" : "Second");
      weeksValueTitle.innerHTML = (t.weeks !== 1 ? "Weeks" : "Week");
      monthsValueTitle.innerHTML = (t.months !== 1 ? "Months" : "Month");
      yearsValueTitle.innerHTML = (t.years !== 1 ? "Years" : "Year");


      var x = moment.tz.names;

      if (!t.years)
        $('#yearsCol').hide();
      if (!t.years && !t.months)
        $('#monthsCol').hide();
      if (!t.years && !t.months && !t.weeks)
        $('#weeksCol').hide();
      if (!t.years && !t.months && !t.weeks && !t.days)
        $('#daysCol').hide();

    }
    updateClock();
    timeinterval = setInterval(function () {
      updateClock();
    }, 1000);
  }

  return TimerviewView
})
