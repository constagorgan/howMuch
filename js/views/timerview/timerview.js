/* global define, console */

define([
  'jquery',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020',
  'countdown',
  'backbone',
  'text!../../../templates/timerview/timerview.html'
], function ($, _, moment, countdown, Backbone, timerviewTemplate) {
  'use strict'

  var timeZones = [moment.tz('Europe/Athens'), moment.tz('Europe/London'), moment.tz('Europe/Berlin')];
  var timezone = moment.tz(moment.tz.guess());
  var deadline;
  var timeinterval = setInterval(function () {}, 1000);;
  var initialOffset = timezone._offset;
  var getEvent = Backbone.Model.extend({
    idAttribute: '_id',
    initialize: function () {
      $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        options.crossDomain = {
          crossDomain: true
        }
      })
    },
    urlRoot: 'http://localhost:8003/getEvent'
  })

  var TimerviewView = Backbone.View.extend({
    render: function () {
      var template = _.template(timerviewTemplate)
      this.$el.html(template({

      }))
      return this
    },
    initialize: function () {
      var event = new getEvent();
      event.fetch({
        data: {
          id: 5
        }
      }).done(function (response) {

        // trebuie atentie pt ca trebuie sa existe un exemplu pentru fiecare timezone
        // pt ambele variante daylight si non daylight. trebuie parcursa lista din moment-timezone iar al treilea camp indica UTC
        // unde sunt doua numere, alea reprezinta variantele pt ora de vara si ora de iarna
        // in orice combinatie, trebuie sa existe o optiune si numai una pt fiecare timezone               
        var localTimezone = _.findIndex(timeZones, function (zone) {
          return zone._offeset = timezone._offset;
        });
        timeZones[localTimezone] = timezone;
        $('#utcText').text('UTC ' + getNumber(timezone._offset / 60) + ' - ' + timezone._z.name);
        deadline = new Date(response.eventDate);
        initializeClock('clockdiv', initialOffset, deadline);
        $('#eventName').text(response.Name);
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
      var date = new Date();
      date.off
      initializeClock('clockdiv', timezone._offset, deadline);
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
      initializeClock('clockdiv', timezone._offset, deadline);
    }

  })

  function getNumber(theNumber) {
    if (theNumber > 0) {
      return "+" + theNumber;
    } else {
      return theNumber.toString();
    }
  }

  function initializeClock(id, offset, endtime) {
    clearInterval(timeinterval)
    var clock = document.getElementById(id);
    var daysSpan = clock.querySelector('.days');
    var hoursSpan = clock.querySelector('.hours');
    var minutesSpan = clock.querySelector('.minutes');
    var secondsSpan = clock.querySelector('.seconds');
    var monthsSpan = clock.querySelector('.months');
    var weeksSpan = clock.querySelector('.weeks');
    var yearsSpan = clock.querySelector('.years');
    var t;

    function updateClock() {
      var starttime = new Date((new Date()).getTime() + (offset - initialOffset) * 60 * 1000);
      t = countdown(starttime, endtime, countdown.YEARS | countdown.MONTHS | countdown.WEEKS | countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS);
      daysSpan.innerHTML = t.days;
      weeksSpan.innerHTML = t.weeks;
      monthsSpan.innerHTML = t.months;
      hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
      minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
      secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
      yearsSpan.innerHTML = t.years;
      var x = moment.tz.names;

      if (!t.years)
        $('#yearsCol').hide();
      if (!t.years && !t.months)
        $('#monthsCol').hide();
      if (!t.years && !t.months && !t.weeks)
        $('#weeksCol').hide();

    }
    updateClock();
    timeinterval = setInterval(function () {
      updateClock();
    }, 1000);
  }

  return TimerviewView
})
