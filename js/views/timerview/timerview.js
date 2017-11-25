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
  './crawler',
  './mapview',
  './deadlineview',
  './placeinfoview',
  'chatHandler',
  'userAgent',
  'canvasCube'
], function ($, _, moment, countdown, Backbone, timerviewTemplate, ChatView, ws, Resources, common, crawler, TimerMapView, DeadlineView, PlaceInfoView, chatHandler, userAgent, CanvasCube) {
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
  var canvasCube = CanvasCube
  var mobileOperatingSystem = userAgent.getMobileOperatingSystem()
  var iosBrowserIsSafari, androidBrowser

  if (mobileOperatingSystem === 'iOS')
    iosBrowserIsSafari = userAgent.getIOSSafari()
  
  if (mobileOperatingSystem === 'Android')
    androidBrowser = userAgent.getBrowser()
    
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
      window.spliceCounter = 0;
      this.timerMapView = new TimerMapView()
      this.placeInfoView = new PlaceInfoView()
      this.deadlineView = new DeadlineView()
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
      'click #crawlerHeader': 'toggleCrawler',
      'click #setAutoTimezone': 'setLocalTimezone',
      'click a': 'setTargetBlank',
      'click #socialMediaShareFacebook': 'openShareToFacebookWindow',
      'click #socialMediaShareTwitter': 'openShareToTwitterWindow'
    },
    openShareToFacebookWindow: function() {
      var url = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href)
      if(this.options && this.options.name) {
        url += '&quote=Join the countdown to ' + encodeURIComponent(this.options.name) + '!'
      }
      window.open(url, 'Share this event','left=75,top=75,toolbar=0,status=0,width=548,height=325')
    },
    openShareToTwitterWindow: function() {
      var url = 'http://twitter.com/share?url=' + encodeURIComponent(window.location.href)
      url += '&via=EventSnitch'
      if(this.options && this.options.name) {
        url += '&text=Join the countdown to ' + encodeURIComponent(this.options.name) + '!'
      }
      window.open(url, 'Share this event', 'left=75,top=75,toolbar=0,status=0,width=548,height=325');
    },
    showTimezoneModal: function () {
      common.timezoneModal()
    },
    updateClientTimezone: function () {
      common.updateClientTimezone('#commonModalSelect')
      $('#timezoneModal').modal('toggle')
      var selectedOffset = parseInt($('#commonModalSelect option:selected').attr('value'))
      initializeClock.bind(this, 'clockdiv', selectedOffset, deadline, eventDateWithDuration)()
    },
    setLocalTimezone: function () {
      var localTimezone = moment.tz(moment.tz.guess())
      var currentLocalTimezoneName = localTimezone._z.name
      $('#commonModalSelect option[data-timezone-name=\''+ currentLocalTimezoneName + '\']').prop("selected", true);
      this.updateClientTimezone()
    },
    toggleCrawler: function () {
      var crawlerIsClosed = $('#crawlerToggleBtnIcon').hasClass('glyphicon-menu-up')
      var windowWidth = $(window).width()
      var windowHeight = $(window).height()
      if (crawlerIsClosed && !$('.modal').is(':visible')) {
        var crawlerOpenedOffset

        // Open the crawler
        if (windowWidth <= 1024) {
          if (mobileOperatingSystem === "iOS")
            $('body').scrollTop($(window).height() - $('#crawlerContainer').offset().top - $('#crawlerHeader').outerHeight() - $('#chatHeader').outerHeight())
          
          crawlerOpenedOffset = windowHeight - $('#crawlerHeader').height() - $('#header').outerHeight() - $('#chatHeader').outerHeight()   
          $('body').animate({
            scrollTop: crawlerOpenedOffset
          })
        } else {
          crawlerOpenedOffset = windowHeight - $('#crawlerHeader').height()
          if(mobileOperatingSystem === 'unknown') {
            $('html').animate({
              scrollTop: crawlerOpenedOffset
            })
          }
          $('body').animate({
            scrollTop: crawlerOpenedOffset
          })
        }
      } else {
        if (mobileOperatingSystem === "iOS") {
          $('body').scrollTop($(window).height() - $('#crawlerContainer').offset().top - $('#crawlerHeader').outerHeight() - $('#chatHeader').outerHeight())
        }
        
        $('body').animate({
          scrollTop: 0
        })
        
       if(mobileOperatingSystem === 'unknown') {
          $('html').animate({
            scrollTop: 0
          })
        }
      }
    },
    // Sets hyperlinks's target to blank in order to open up in new window
    setTargetBlank: function () {
      $("a").attr("target", "_blank");
    },
    setCrawlerCanvasAndMargin: function () {
      setCrawlerTopMargin()

      if (!canvasCube) {
        require(['canvasCube'], function (canvasCubeObj) {
          canvasCube = canvasCubeObj

          canvasCube.canvas()
          canvasCube.resize()
        })
      } else {
        canvasCube.canvas()
        canvasCube.resize()
      }
    },
    setHeightTimerDotsBg: function () {
      if ($(window).width() <= 1024) {
        var headerOuterHeight = $('#header').outerHeight()
        var dotsBgHeightValue = $(window).height() + headerOuterHeight
        $('#timerviewDotsBg').height(dotsBgHeightValue)
      } else {
        $('#timerviewDotsBg').removeAttr('style');
      }
    },
    scrollChatCrawlerDown: function () {
      $('body').animate({
        scrollTop: '0'
      })
      $('html').animate({
        scrollTop: '0'
      })
      var isChatExpanded = $('#collapseOne').is(':visible')
      if (isChatExpanded)
        chatHandler.openCloseChat()
    },  
    setTimerContentHeightAndroid: function () {
      $('#timerContent').css({
        'marginTop': '20px'
      });
    },
    setTimerContentHeightIosSafari: function () {
      $('.clock_wrapper__body > div').css({
        'padding': '20px 0 10px 0',
      }).css({
        'padding': '4vw 0 2vw 0'
      })
      $('.social-media-share-container').css({      
        'marginTop': '10px'
      })
    },
    close: function () {
      window.spliceCounter = 0
      canvasCube = null
      clearInterval(timeinterval)
      var self = this
      $(window).unbind('resize', this.setCrawlerCanvasAndMargin)
      $(window).unbind('.setCrawlerCanvasAndMargin')
      $(window).unbind('.resizeCrawlerSlotEnd')
      $(window).unbind('resize')
      $(window).unbind('.scrollBuildArray')
      $(window).unbind('.touchmoveBuildArray')
      $("#crawlerSlotEnd").unbind('.crawlerSlotEndNavigate')
      if($(window).width() > 1024) {
        $(window).unbind('scroll')
      } else {
        $('body').unbind('scroll')
      }
      $(".crawler__slot-description-show-more a").unbind(".showMoreText")
      $('.header_container').unbind('show.bs.modal', self.scrollChatCrawlerDown)

      if (mobileOperatingSystem === 'iOS') {
        $('html').removeClass('chat_keyboard_focus_stabilize')
        $('body').removeClass('chat_keyboard_focus_stabilize')
      }
      this.chatView.close ? this.chatView.close() : this.chatView.remove()
      this.placeInfoView.close ? this.placeInfoView.close() : this.placeInfoView.remove()
      this.timerMapView.close ? this.timerMapView.close() : this.timerMapView.remove()
      this.deadlineView.close ? this.deadlineView.close() : this.deadlineView.remove()
      crawler.abortCrawlerRequests()
      this.remove();
    },
    render: function () {
      var that = this
      
      $(window).bind('resize', this.setHeightTimerDotsBg)
      if (mobileOperatingSystem === 'iOS' && !iosBrowserIsSafari) {
        $(window).bind('resize', this.setCrawlerCanvasAndMargin, false)
        $(window).bind('orientationchange.setCrawlerCanvasAndMargin', this.setCrawlerCanvasAndMargin)
      } else {
        $(window).bind('resize', this.setCrawlerCanvasAndMargin)
      }

      $(window).bind('resize', _.throttle(setCrawlerHeaderPosition, 10))
      
      if($(window).width() > 1024) {
        $('.header_container').bind('show.bs.modal', that.scrollChatCrawlerDown);
        $(window).bind('scroll', _.throttle(setCrawlerHeaderPosition, 5))
      } else {
        if (mobileOperatingSystem === 'iOS') {
          $('body').bind('scroll', _.throttle(setCrawlerHeaderPosition, 5))
          $('html').addClass('chat_keyboard_focus_stabilize')
          $('body').addClass('chat_keyboard_focus_stabilize')
        } else {
          $(window).bind('scroll', setCrawlerHeaderPosition)
        }
      }

      ws.getEvent(true, this.options.id, this.options.name, function (results) {
        if (!results || !results.length) {
          displayEvent(that, false, 'No event found!')
          $('.clock_container').addClass('display_none')
          clearInterval(timeinterval)
        } else {
          var response = results[0]
          $('html').css({
            'background': 'url(../Content/img/background/' + response.background + '_large.jpg) center center no-repeat',
            'background-size': 'cover',
          })

          if (mobileOperatingSystem === 'iOS') {
            $('html').css('background-attachment', 'scroll')
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
          eventDateWithDuration = new Date(deadline.getTime() + parseInt(response.duration) * 1000)
          
          displayEvent(that, true, response.name, response.description, response.id, response.hashtag, response.location)
          $('#crawlerEventImg').css('background-image', 'url(../Content/img/background/' + response.background + '_small.jpg)')
          if($(window).width() > 1024) {
            $('#crawlerToggleBtnDiv').tooltip({title: "Take me up!"})
          }
          if (response.specialEffect) {
            $('.special_effect').addClass('special_effect-' + response.specialEffect)
          }
          $(document).ready(function(){
            if(checkShowMoreDescription()) {
              addDescriptionShowMoreHandler()
            }
          })
          ws.getLocation(response.locationMagicKey, response.id, function (result, userLocation) {
            var eventLocation
            getUserLocation(result, function(response, userLocation){ 
              if (result && result.location)
                eventLocation = result.location
              that.$('.map_view_anchor').html(that.timerMapView.$el);
              that.timerMapView.render(eventLocation, userLocation);
            })
            that.$('.place_info_view_anchor').html(that.placeInfoView.$el);
            that.placeInfoView.render(result);
          }, function () {
            
          })
        }
      }, function (error) {
        console.log('fail')
      });
      return this
    }

  })
  
  
  function checkShowMoreDescription() {
    var elem = $('.crawler__slot-description-show-more')
    if(elem.prev().children().height() > 165) {
      elem.removeClass('display_none')
      elem.prev().removeClass(".crawler__slot-description-shown").addClass('.crawler__slot-description-hidden')
      showMoreDescription($(".crawler__slot-description-show-more").prev(), $(".crawler__slot-description-show-more a"))
      return true
    }  
    return false
  }
  
  function showLessDescription(content, showMoreButton) {
    content.removeClass("crawler__slot-description-hidden");
    content.addClass("crawler__slot-description-shown");
    showMoreButton.text("Show less");
  }
  
  function showMoreDescription(content, showMoreButton) {
    content.removeClass("crawler__slot-description-shown");
    content.addClass("crawler__slot-description-hidden");
    showMoreButton.text("Show more");
  }
  
  function addDescriptionShowMoreHandler() {
    $(".crawler__slot-description-show-more a").on("click.showMoreText", function() {
      var $this = $(this); 
      var $content = $this.parent().prev()

      if($this.parent().prev().hasClass("crawler__slot-description-hidden")){
        showLessDescription($content, $this)
      } else {
        showMoreDescription($content, $this)
      };
    })
  }
  function getUserLocation(response, success) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        if (position.coords)
          success(response, position.coords)
        else
          success(response)
      }, function(resp){
        success(response)
      }, {
      enableHighAccuracy: true, 
      maximumAge        : 5000, 
      timeout           : 10000
    });
    } else {
      success(response)
    }
  }

  var setCrawlerTopMargin = function () {
    if($(window).width() <= 1024) {
      var crawlerContainerTop = $(window).height() - $('#crawlerHeader').height() - $('#chatHeader').outerHeight()
    } else {
      var crawlerContainerTop = $(window).height() - $('#crawlerHeader').height()
    }
    $('#crawlerContainer').css('marginTop', crawlerContainerTop).removeClass('display_none')
  }

  var setCrawlerHeaderPosition = function (e) {
    var windowHeight = $(window).height()
    var windowWidth = $(window).width()
    var htmlSelector = $('html')
    var bodySelector = $('body')
    var documentScrollTop = $(document).scrollTop()

    if (windowWidth <= 1024) {
      if (mobileOperatingSystem === 'iOS') {
        var crawlerContainerOffsetTop = $('#crawlerContainer').offset().top

        if (!htmlSelector.hasClass('chat_keyboard_focus_stabilize')) {
          htmlSelector.addClass('chat_keyboard_focus_stabilize')
          bodySelector.addClass('chat_keyboard_focus_stabilize')
          $(window).unbind('scroll touchmove')
          $('body').unbind('scroll').bind('scroll', _.throttle(setCrawlerHeaderPosition, 5))
        }

        var headerOuterHeight = $('#header').outerHeight()
        var chatHeaderOuterHeight = $('#chatHeader').outerHeight()
        if (crawlerContainerOffsetTop <= (windowHeight - headerOuterHeight - chatHeaderOuterHeight) / 2) {
          $('#crawlerToggleBtnIcon').removeClass('glyphicon-menu-up').addClass('glyphicon-menu-down')
        } else {
          $('#crawlerToggleBtnIcon').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-up')
        }
        if (crawlerContainerOffsetTop <= headerOuterHeight) {
          $('#crawlerHeader').addClass('fixed')
        } else {
          $('#crawlerHeader').removeClass('fixed')
        }
      } else {
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
      }
    } else {
      if (documentScrollTop >= windowHeight / 2) {
        $('#crawlerToggleBtnIcon').removeClass('glyphicon-menu-up').addClass('glyphicon-menu-down')
        if($('#crawlerToggleBtnDiv').data('bs.tooltip'))
          $('#crawlerToggleBtnDiv').data('bs.tooltip').options.title = 'Take me down!';
      } else {
        $('#crawlerToggleBtnIcon').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-up')
        if($('#crawlerToggleBtnDiv').data('bs.tooltip'))
          $('#crawlerToggleBtnDiv').data('bs.tooltip').options.title = 'Take me up!';
      }
      if (documentScrollTop >= windowHeight - $('#crawlerHeader').height()) {
        $('#crawlerHeader').addClass('fixed')
      } else {
        $('#crawlerHeader').removeClass('fixed')
      }
    }
  }

  function displayEvent(that, eventFound, name, description, id, hashtag, location) {
    var template = _.template(timerviewTemplate)
    that.$el.html(template({
      timezones: timezones,
      currentTimezone: {
        display: currentTimezoneDisplay,
        offset: initialOffset,
        name: currentTimezoneName,
      },
      eventName: name,
      eventDescription: description,
      eventLocation: location,
    }))
    $('#loader').addClass('display_none')
    if (eventFound) {
      that.setHeightTimerDotsBg()
      if (mobileOperatingSystem === 'Android' && androidBrowser === "gc") {    
        that.setTimerContentHeightAndroid()
      } else if (mobileOperatingSystem === 'iOS' && iosBrowserIsSafari) {
        that.setTimerContentHeightIosSafari()
      }
      $('.social-media-share-container').removeClass("display_none")
      $('#changeUtcButton').removeClass('display_none')
      $('#utcText').text(currentTimezoneDisplay);
      initializeClock.bind(that, 'clockdiv', initialOffset, deadline, eventDateWithDuration)()

      that.$el.append(that.chatView.$el)
      that.chatView.render()

      that.setCrawlerCanvasAndMargin()
      crawler.buildCrawler(hashtag, name, id)
    }
  }

  function getNumber(theNumber) {
    if (theNumber > 0) {
      return "+" + theNumber;
    } else {
      return theNumber.toString();
    }
  }

  function updateTimezoneInfoText() {
    $('#utcText').text($('#commonModalSelect option:selected').text());
  }
  
  function updateGroup(group, n, flip){
	var digit1 = $('#clockTen'+group);
	var digit2 = $('#clock'+group);
	n = String(n);
	if(n.length == 1) n = '0'+n;
	var num1 = n.substr(0, 1);
	var num2 = n.substr(1, 1);
    
	if(digit1.attr('data-num') != num1){
		if(flip) flipTo(digit1, num1);
		else jumpTo(digit1, num1);
	}
	if(digit2.attr('data-num') != num2){
		if(flip) flipTo(digit2, num2);
		else jumpTo(digit2, num2);
	}
  }
  function repeat(s, n) { 
    var a=[],i=0;for(;i<n;)a[i++]=s;return a.join(''); 
  }

  function updateDayGroup(group, n, flip){
	var digit1 = $('#clockThousand'+group);
    var digit2 = $('#clockHundred'+group);
    var digit3 = $('#clockTen'+group);
	var digit4 = $('#clock'+group);
	n = String(n);
    if(n.length < 4)
      $('#clockThousand'+group).addClass('display_none')
    if(n.length < 3)
      $('#clockHundred'+group).addClass('display_none')
    n = repeat('0',4-n.length) + n;
    var num1 = n.substr(0, 1);  
    var num2 = n.substr(1, 1);
    var num3 = n.substr(2, 1);
    var num4 = n.substr(3, 1);
    
    
	if(digit1.attr('data-num') != num1){
		if(flip) flipTo(digit1, num1);
		else jumpTo(digit1, num1);
	}
	if(digit2.attr('data-num') != num2){
		if(flip) flipTo(digit2, num2);
		else jumpTo(digit2, num2);
	}
    if(digit3.attr('data-num') != num3){
		if(flip) flipTo(digit3, num3);
		else jumpTo(digit3, num3);
	}
	if(digit4.attr('data-num') != num4){
		if(flip) flipTo(digit4, num4);
		else jumpTo(digit4, num4);
	}
  }
  
  function flipTo(digit, n){
    var current = digit.attr('data-num');
    digit.attr('data-num', n);
    digit.find('.front').attr('data-content', current);
    digit.find('.back, .under').attr('data-content', n);
    digit.find('.clock_container__flap').css('display', 'block');
    setTimeout(function(){
        digit.find('.clock_container__base').text(n);
        digit.find('.clock_container__flap').css('display', 'none');
    }, 350);
  }

  function jumpTo(digit, n){
    digit.attr('data-num', n);
    digit.find('.clock_container__base').text(n);
  }

  function initializeClock(id, offset, eventDate, eventDateWithDuration) {
    clearInterval(timeinterval)
    var deadlineOffsetInMilliseconds = !localEvent ? 0 : (offset + new Date().getTimezoneOffset()) * 60 * 1000
    this.$('.deadline_view_anchor').html(this.deadlineView.$el)
    this.deadlineView.render(eventDate.getTime() + deadlineOffsetInMilliseconds)
    var clock = document.getElementById(id);
    var daysValueTitle = clock.querySelector('#days_value_title');
    var hoursValueTitle = clock.querySelector('#hours_value_title');
    var minutesValueTitle = clock.querySelector('#minutes_value_title');
    var secondsValueTitle = clock.querySelector('#seconds_value_title');
    var t;

    function updateClock(flip) {
      var offsetValueInMilliseconds = localEvent ? 0 : (offset + new Date().getTimezoneOffset()) * 60 * 1000
      var now = new Date((new Date()).getTime() + offsetValueInMilliseconds);

      if (eventDate) {
        if (now < eventDate) {
          t = countdown(now, eventDate, countdown.DAYS | countdown.HOURS | countdown.MINUTES | countdown.SECONDS);
          $('#timeTitle').text('Time left until');
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
      
      updateDayGroup('Day', t.days, flip);
      updateGroup('Hour', t.hours, flip);
      updateGroup('Min', t.minutes, flip);
      if(!$('#clockSecondLastDigit').hasClass('display_block') && flip) {
        $('#clockSecondLastDigit').addClass('display_block')
      }
      updateGroup('Sec', t.seconds, flip);
      
      daysValueTitle.innerHTML = (t.days !== 1 ? "Days" : "Day");
      hoursValueTitle.innerHTML = (t.hours !== 1 ? "Hours" : "Hour");
      minutesValueTitle.innerHTML = (t.minutes !== 1 ? "Minutes" : "Minute");
      secondsValueTitle.innerHTML = (t.seconds !== 1 ? "Seconds" : "Second");

      var x = moment.tz.names;

      if (!t.days) {
        $('#daysCol').hide();
      } else {
        $('#daysCol').show();
      }
    }
    
    updateClock(false);
    timeinterval = setInterval(function () {
      updateClock(true);
    }, 1000);
  }

  return TimerviewView
})
