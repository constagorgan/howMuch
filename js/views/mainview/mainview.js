/* global define, console */

define([
  'jquery',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020',
  'countdown',
  'backbone',
  'text!../../../templates/mainview/mainview.html'
], function ($, _,  moment, countdown, Backbone, mainviewTemplate) {
  'use strict'
  
  var timeZones = [moment.tz('Europe/Athens'), moment.tz('Europe/London'), moment.tz('Europe/Berlin')];  
  var timezone = moment.tz(moment.tz.guess());
  var deadline;
  var timeinterval = setInterval(function(){ 
    }, 1000);    ;
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
    urlRoot : 'http://localhost:8003/'
  }) 
  
  
  var MainviewView = Backbone.View.extend({
      tagName: "div",
      className: "fullHeight",
      render: function () {
      var template = _.template(mainviewTemplate)
      this.$el.html(template({

      }))
      return this
    },
    initialize: function() {
        var event = new getEvent();
        event.fetch({
            data: {table: 'events', id: 1}
        }).done(function(response){
            
    // trebuie atentie pt ca trebuie sa existe un exemplu pentru fiecare timezone
    // pt ambele variante daylight si non daylight. trebuie parcursa lista din moment-timezone iar al treilea camp indica UTC
    // unde sunt doua numere, alea reprezinta variantele pt ora de vara si ora de iarna
    // in orice combinatie, trebuie sa existe o optiune si numai una pt fiecare timezone               
            var localTimezone = _.findIndex(timeZones, function(zone){
                return zone._offeset = timezone._offset;
            });
            timeZones[localTimezone] = timezone;
            $('#utcText').text('UTC ' + getNumber(timezone._offset/60) + ' - ' + timezone._z.name);    
            deadline = new Date(response.Date);
            initializeClock('clockdiv', initialOffset, deadline);
            $('#eventName').text(response.Name);
        });
    }, 
    events: {
      'click #utcChangeLeft': 'utcChangeLeft',
      'click #utcChangeRight': 'utcChangeRight'
    },
    utcChangeRight: function(e){
         var selectedTimezoneIndex = _.findIndex(timeZones, function(zone){
            return zone._offset === timezone._offset;
        });
        if(selectedTimezoneIndex + 1 < timeZones.length)
            timezone = timeZones[selectedTimezoneIndex+1];
        else
            timezone = timeZones[0];
         $('#utcText').text('UTC ' + getNumber(timezone._offset/60) + ' - ' + timezone._z.name);
        var date = new Date();
        date.off
         initializeClock('clockdiv', timezone._offset, deadline);
    },
    utcChangeLeft: function(e){
          var selectedTimezoneIndex = _.findIndex(timeZones, function(zone){
            return zone._offset === timezone._offset;
        });
        if(selectedTimezoneIndex - 1 >= 0)
            timezone = timeZones[selectedTimezoneIndex-1];
        else
            timezone = timeZones[timeZones.length-1];
         $('#utcText').text('UTC ' + getNumber(timezone._offset/60) + ' - ' + timezone._z.name);   
         initializeClock('clockdiv', timezone._offset, deadline);
    }
    
  })   
  
  function getNumber(theNumber)
    {
        if(theNumber > 0){
            return "+" + theNumber;
        }else{
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
    
    function updateClock(){  
      var starttime = new Date((new Date()).getTime() + (offset - initialOffset)*60*1000);
      t = countdown(starttime, endtime, countdown.YEARS|countdown.MONTHS|countdown.WEEKS|countdown.DAYS|countdown.HOURS|countdown.MINUTES|countdown.SECONDS);
      daysSpan.innerHTML = t.days;
      weeksSpan.innerHTML = t.weeks;
      monthsSpan.innerHTML = t.months;
      hoursSpan.innerHTML = ('0' + t. hours).slice(-2);
      minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
      secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
      yearsSpan.innerHTML = t.years;
      var x = moment.tz.names;
        
      if(!t.years)
          $('#yearsCol').hide();
      if(!t.years && !t.months)
          $('#monthsCol').hide();
      if(!t.years && !t.months && !t.weeks)
          $('#weeksCol').hide();
        
    }
    updateClock();  
    timeinterval = setInterval(function(){  
      updateClock();
    }, 1000);    
  }

    
  return MainviewView
})

/*
define([
  'jquery',
  'underscore',
  'backbone',
  'ws',
  'text!../../../templates/dashboard/dashboard.html'
], function ($, _, Backbone, ws, dashboardDashboardTemplate) {
  'use strict'

  var DashboardDashboardView = Backbone.View.extend({
    initialize: function (options) {
      this.minDate = options.minDate
      this.maxDate = options.maxDate
    },

    events: {
      'mouseover .dashboard_tbody>tr': 'highlightRow',
      'click .dashboard_tbody>tr': 'pdfselect',
      'click #showpdf': 'libererJal',
      'click #addTable': 'addTable'
    },

    highlightRow: function (event) {
      $('td').removeClass('selected')
      $(event.target).addClass('selected').siblings().addClass('selected')
    },
    pdfselect: function (event) {
      var jalId
      $('td').removeClass('selected')
      $(event.target).addClass('selected').siblings().addClass('selected')
      // var value = find($(event.target).siblings())
      // var value = $(event.target).find('td:first').html()
      // alert(value)
      jalId = $(event.target).parent().attr('id')
      sessionStorage.jalId = jalId

      // alert("You reserved a JAL")
      ws.postReserverJal(jalId, sessionStorage.user, 1)

      Backbone.history.navigate('showpdf/' + jalId, {
        trigger: true
      })
    },
    // When the login is pressed, this function is called
    libererJal: function (event) {
      ws.postLibererJal(sessionStorage.user, function (response) {
        Backbone.history.loadUrl(Backbone.history.fragment)
      }, function (response) {
        console.log('libererJal Error')
      })
    },

    render: function () {
      var template, that, i, inputMin, inputMax, pickerMin, pickerMax

      template = _.template(dashboardDashboardTemplate)
      that = this
      i = 0

      // console.log(this.minDate)
      // console.log(this.maxDate)

      // Populates dashboard's table with the info received from the server
      $('#loader').show()
      ws.getJalListe(this.minDate, this.maxDate, function (response) {
        for (i = 0; i < response.length; i += 1) {
          response[i].DateRelease = ws.formatDotNETDate(response[i].DateRelease)
        }
        that.$el.html(template({
          response: response
        }))

        // Function for picking a minimum display date
        that.$el.find('.datepickermin').pickadate({
          firstDay: 1,
          monthsFull: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
          weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
          today: 'aujourd\'hui',
          clear: 'effacer',
          formatSubmit: 'ddmmyyyy',
          min: 0,
          onSet: function (date) {
            var input
            var picker
            var minDate
            var minDateObj = this.get('select')

            if (minDateObj) {
              minDate = new Date(minDateObj.year, minDateObj.month, minDateObj.date)
              minDate.setDate(minDate.getDate() + 1)
              input = $('.datepickermax').pickadate()
              picker = input.pickadate('picker')
              picker.clear()
              picker.set('min', minDate)
            }
          }
        })

        // Function for picking a maximum display date
        that.$el.find('.datepickermax').pickadate({
          firstDay: 1,
          monthsFull: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
          weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
          today: 'aujourd\'hui',
          clear: 'effacer',
          formatSubmit: 'ddmmyyyy',

          onClose: function () {
            var minDatePicked, maxDatePicked, input, picker

            // Gets value from .datepickermin input element & formats to 'ddmmyyyy'
            input = $('.datepickermin').pickadate()
            picker = input.pickadate('picker')
            minDatePicked = picker.get('select', 'ddmmyyyy')

            // Gets value from .datepickerax input element & formats to 'ddmmyyyy'
            input = $('.datepickermax').pickadate()
            picker = input.pickadate('picker')
            maxDatePicked = picker.get('select', 'ddmmyyyy')

            // If there is no valid choice, alert the user to choose a date interval
            if (minDatePicked !== '' && maxDatePicked !== '') {
              // Store picked values for persistance through views
              sessionStorage.storeMinDate = minDatePicked
              sessionStorage.storeMaxDate = maxDatePicked

              // Changes url accordingly to the route (trigger: true)
              Backbone.history.navigate('dashboard/' + minDatePicked + '/' + maxDatePicked, {
                trigger: true
              })
            } else {
              alert("S'il vous plaît choisir un intervalle de dates")
            }
          }
        })

        inputMin = $('.datepickermin').pickadate()
        pickerMin = inputMin.pickadate('picker')
        inputMax = $('.datepickermax').pickadate()
        pickerMax = inputMax.pickadate('picker')

        pickerMin.set('select', that.minDate, { format: 'ddmmyyyy' })
        pickerMax.set('select', that.maxDate, { format: 'ddmmyyyy' })
        $('#loader').hide()
      }, function (response) {

      })
      return this
    }
  })
  return DashboardDashboardView
})*/
