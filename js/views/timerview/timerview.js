/* global define, console */

define([
  'jquery',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020',
  'countdown',
  'backbone',
  'text!../../../templates/timerview/timerview.html',
  'views/common/chatview',
  'ws'
], function ($, _, moment, countdown, Backbone, timerviewTemplate, ChatView, ws) {
  'use strict'

  var timeZones = [moment.tz('Europe/Athens'), moment.tz('Europe/London'), moment.tz('Europe/Berlin')];
  var timezone = moment.tz(moment.tz.guess());
  var deadline;
  var eventDateWithDuration;
  var timeinterval = setInterval(function () {}, 1000);;
  var initialOffset = timezone._offset;
  var globalEvent;

  var TimerviewView = Backbone.View.extend({
    initialize: function (options) {
      this.chatView = new ChatView(options)
      var event = new ws.getEvent();
      deadline = null;
      globalEvent = null;
      eventDateWithDuration = null;
      event.fetch({
        data: options
      }).done(function (results) {
        if (!results || !results.length) {
          $('#eventName').text('No event found!')
          clearInterval(timeinterval)
        } else {
          var response = results[0]
          var localTimezone = _.findIndex(timeZones, function (zone) {
            return zone._offeset = timezone._offset;
          });
          timeZones[localTimezone] = timezone;
          $('#utcText').text('UTC ' + getNumber(timezone._offset / 60) + ' - ' + timezone._z.name);
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
      });
    },

    events: {
      'click #utcChangeLeft': 'utcChangeLeft',
      'click #utcChangeRight': 'utcChangeRight'
    },

    utcChangeRight: function (e) {
      var selectedTimezoneIndex = _.findIndex(timeZones, function (zone) {
        return zone._offset === timezone._offset;
      });
      if (selectedTimezoneIndex + 1 < timeZones.length)
        timezone = timeZones[selectedTimezoneIndex + 1];
      else
        timezone = timeZones[0];
      $('#utcText').text('UTC ' + getNumber(timezone._offset / 60) + ' - ' + timezone._z.name);
      if (globalEvent)
        initializeClock('clockdiv', timezone._offset, deadline, eventDateWithDuration);
    },
    utcChangeLeft: function (e) {
      var selectedTimezoneIndex = _.findIndex(timeZones, function (zone) {
        return zone._offset === timezone._offset;
      });
      if (selectedTimezoneIndex - 1 >= 0)
        timezone = timeZones[selectedTimezoneIndex - 1];
      else
        timezone = timeZones[timeZones.length - 1];
      $('#utcText').text('UTC ' + getNumber(timezone._offset / 60) + ' - ' + timezone._z.name);
      if (globalEvent)
        initializeClock('clockdiv', timezone._offset, deadline, eventDateWithDuration);
    },
    close: function () {
      this.chatView.close ? this.chatView.close() : this.chatView.remove();
      this.remove();
    },
    render: function () {
      var template = _.template(timerviewTemplate)
      this.$el.html(template())
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
