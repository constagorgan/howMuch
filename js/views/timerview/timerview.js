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
  './mapview',
  'chatHandler',
  'userAgent'
], function ($, _, moment, countdown, Backbone, timerviewTemplate, ChatView, ws, Resources, common, TimerMapView, chatHandler, userAgent) {
  'use strict'

  common.checkUserTimezone();
  var timezones = []
  var deadline
  var eventDateWithDuration
  var timeinterval = setInterval(function () {}, 1000)
  var localEvent

  var currentTimezone
  var initialOffset
  var currentTimezoneName
  var currentTimezoneDisplay
  var canvasCube
  var mobileOperatingSystem = userAgent.getMobileOperatingSystem() 
  var iosBrowserIsSafari 
  
  if(mobileOperatingSystem === 'iOS')
    iosBrowserIsSafari = userAgent.getIOSSafari()
    
  _.each(Resources.timezones, function (name, index) {
    var timezoneElement = moment.tz(name)
    timezones.push({
      display: common.getTimezoneDisplay(timezoneElement),
      offset: timezoneElement._offset,
      name: name
    })

  })

  var lastScrollTop = 0;

  var TimerviewView = Backbone.View.extend({
    initialize: function (options) {
      this.timerMapView = new TimerMapView();
      this.chatView = new ChatView(options)
      currentTimezone = localStorage.getItem('userTimezone') ? moment.tz(localStorage.getItem('userTimezone')) : moment.tz(moment.tz.guess())
      initialOffset = currentTimezone._offset
      currentTimezoneName = currentTimezone._z.name
      currentTimezoneDisplay = common.getTimezoneDisplay(currentTimezone)
      deadline = null
      localEvent = null
      eventDateWithDuration = null
      this.options = options
      _.bindAll(this, 'render')
    },

    events: {
      'click #utcText': 'showTimezoneModal',
      'click #utcChange': 'showTimezoneModal',
      'change #commonModalSelect': 'updateClientTimezone',
      'click #crawlerHeader': 'toggleCrawler'
    },
    showTimezoneModal: function () {
      common.timezoneModal()
    },
    updateClientTimezone: function () {
      common.updateClientTimezone('#commonModalSelect')
      $('#timezoneModal').modal('toggle')
      var selectedOffset = parseInt($('#commonModalSelect option:selected').attr('value'))
      initializeClock('clockdiv', selectedOffset, deadline, eventDateWithDuration);
    },
    toggleCrawler: function () {
      var crawlerIsClosed = $('#crawlerToggleBtnIcon').hasClass('glyphicon-menu-up')
      if (crawlerIsClosed && !$('.modal').is(':visible')) {
        var windowHeight = $(window).height()
        var crawlerOpenedOffset
        // Open the crawler
        if ($(window).width() < 768) {
          crawlerOpenedOffset = windowHeight - $('#crawlerHeader').height() - $('#header').outerHeight() - $('#chatHeader').outerHeight()
          console.log('crawler offset: ' + crawlerOpenedOffset)
        } else {
          crawlerOpenedOffset = windowHeight - $('#crawlerHeader').height()
        }
        $('body').animate({
          scrollTop: crawlerOpenedOffset
        })  
      } else {
        // Close the crawler
        $('body').animate({
          scrollTop: '0'
        })
      }
    },
    setCrawlerCanvasAndMargin: function() {
      setCrawlerTopMargin()
      
      if(!canvasCube) { 
        require(['canvasCube'], function(canvasCubeObj) {
          canvasCube = canvasCubeObj
          
          canvasCube.canvas()  
          canvasCube.resize()
        })
      } else {
        canvasCube.canvas()
        canvasCube.resize()            
      }
    },
    setCrawlerHeaderPosition: function (e) {
      var documentScrollTop = $(document).scrollTop()
      var windowHeight = $(window).height()
      var windowWidth = $(window).width()
      if (windowWidth < 768) {
        var headerOuterHeight = $('#header').outerHeight()
        var chatHeaderOuterHeight = $('#chatHeader').outerHeight()
        if (documentScrollTop >= (windowHeight - headerOuterHeight - chatHeaderOuterHeight) / 2) {
          $('#crawlerToggleBtnIcon').removeClass('glyphicon-menu-up').addClass('glyphicon-menu-down')
        } else {
          $('#crawlerToggleBtnIcon').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-up')
        }
        if (documentScrollTop >= windowHeight - $('#crawlerHeader').height() - headerOuterHeight - chatHeaderOuterHeight) {
          $('#crawlerHeader').addClass('fixed')
        } else {
          $('#crawlerHeader').removeClass('fixed')
        }
      } else {
        if(documentScrollTop >= windowHeight / 2) {
          $('#crawlerToggleBtnIcon').removeClass('glyphicon-menu-up').addClass('glyphicon-menu-down')
        } else {
          $('#crawlerToggleBtnIcon').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-up')
        }
        if(documentScrollTop >= windowHeight - $('#crawlerHeader').height()) {
          $('#crawlerHeader').addClass('fixed')
        } else {
          $('#crawlerHeader').removeClass('fixed')
        }
      }
    },
    setHeightTimerDotsBg: function () {
      if ($(window).width() < 768) {
        var headerOuterHeight = $('#header').outerHeight()
        var dotsBgHeightValue = $(window).height() + headerOuterHeight
        $('#timerviewDotsBg').height(dotsBgHeightValue)
      } else {
        $('#timerviewDotsBg').removeAttr('style');
      }
    },
    scrollChatCrawlerDown: function(){
      $('body').animate({
        scrollTop: '0'
      })
      var isChatExpanded = $('#collapseOne').is(':visible')
      if(isChatExpanded)
        chatHandler.openCloseChat()
    },
    close: function () {
      canvasCube = null
      clearInterval(timeinterval)
      var self = this
      $(window).unbind('resize', this.setCrawlerCanvasAndMargin)
      $(window).unbind('resize')
      $(window).unbind('scroll')
      
      $('.header_container').unbind('show.bs.modal', self.scrollChatCrawlerDown);
      this.chatView.close ? this.chatView.close() : this.chatView.remove();
      this.timerMapView.close ? this.timerMapView.close() : this.timerMapView.remove();
      this.remove();
    },
    render: function () {
      var that = this

      $(window).bind('resize', this.setHeightTimerDotsBg)
      if(mobileOperatingSystem === 'iOS' && !iosBrowserIsSafari)
        $(window).bind('resize', this.setCrawlerCanvasAndMargin, false)
      else 
        $(window).bind('resize', this.setCrawlerCanvasAndMargin)

      $(window).bind('resize', _.throttle(this.setCrawlerHeaderPosition, 10))
      
      _.bindAll(this, 'setCrawlerHeaderPosition');
      $(window).bind('scroll', _.throttle(this.setCrawlerHeaderPosition, 5))
      
      if($(window).width() > 767) {
        $('.header_container').bind('show.bs.modal', that.scrollChatCrawlerDown);
      }
      
      ws.getEvent(true, this.options.id, this.options.name, function (results) {
        if (!results || !results.length) {
          displayEvent(that, 'No event found!', false)
          $('.clock_container').addClass('display_none')
          clearInterval(timeinterval)
        } else {
          var response = results[0]
          $('html').css({
            'background': 'url(../Content/img/' + response.background + '_large.jpg) center center no-repeat',
            'background-size': 'cover',
          })
          
          if(mobileOperatingSystem === 'iOS'){
            $('html').css('background-attachment', 'scroll')
            if(!iosBrowserIsSafari)
              $('html').css('height', $(document).height())
          } else {
            $('html').css('background-attachment', 'fixed')
          }
          
          var localTimezone = _.findIndex(timezones, function (zone) {
            return zone._offeset = currentTimezone._offset;
          });
          timezones[localTimezone] = currentTimezone;
          if (response.isLocal && parseInt(response.isLocal)) {
            deadline = new Date(moment.utc(response.eventDate))
            localEvent = true
          } else {
            deadline = moment(response.eventDate).toDate()
            localEvent = false
          }
          eventDateWithDuration = new Date(deadline.getTime() + parseInt(response.duration)*1000)
          
          displayEvent(that, response.name, true)
          
          $('#crawlerEventImg').css('background-image', 'url(../Content/img/' + response.background + '_small.jpg)')

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
  
  var setCrawlerTopMargin = function () {
    if($(window).width() < 768) {
      var crawlerContainerTop = $(window).height() - $('#crawlerHeader').height() - $('#chatHeader').outerHeight()
    } else {
      var crawlerContainerTop = $(window).height() - $('#crawlerHeader').height()
    }
    $('#crawlerContainer').css('marginTop', crawlerContainerTop).removeClass('display_none')
  }

  function displayEvent(that, name, eventFound) {
    var template = _.template(timerviewTemplate)
    that.$el.html(template({
      timezones: timezones,
      currentTimezone: {
        display: currentTimezoneDisplay,
        offset: initialOffset,
        name: currentTimezoneName,
      },
      eventName: name
    }))
    $('#loader').addClass('display_none')
    if (eventFound) {
      that.setHeightTimerDotsBg()

      $('#changeUtcButton').removeClass('display_none')
      $('#utcText').text(currentTimezoneDisplay);
      initializeClock('clockdiv', initialOffset, deadline, eventDateWithDuration)
      
      that.$el.append(that.chatView.$el)
      that.chatView.render()
      
      that.setCrawlerCanvasAndMargin()
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
      var offsetValueInMilliseconds = localEvent ? 0 : (offset + new Date().getTimezoneOffset()) * 60 * 1000
      var now = new Date((new Date()).getTime() + offsetValueInMilliseconds);

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

      if (!t.days) {
        $('#daysCol').hide();
        $('.hour_minute_second_column').removeClass('col-xs-3').addClass('col-xs-4')
      } else {
        $('#daysCol').show();
        $('.hour_minute_second_column').removeClass('col-xs-4').addClass('col-xs-3')
      }

    }
    updateClock();
    timeinterval = setInterval(function () {
      updateClock();
    }, 1000);
  }

  return TimerviewView
})
