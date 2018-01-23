/*global define, console */
define([
  "jquery",
  "underscore",
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2012-2022',
  "backbone",
  "text!../../../templates/common/sidemenuview.html",
  '../../../Content/resources/resources',
  "common",
  "ws",
  'jquery-hammerjs'
], function ($, _, moment, Backbone, commonSideMenuTemplate, Resources, common, ws, hammerjs) {
  "use strict";

  common.checkUserTimezone()
  var timezones = []

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

  var CommonHeaderView = Backbone.View.extend({
    initialize: function () {
      var that = this
      currentTimezone = localStorage.getItem('userTimezone') ? moment.tz(localStorage.getItem('userTimezone')) : moment.tz(moment.tz.guess())
      initialOffset = currentTimezone._offset
      currentTimezoneName = currentTimezone._z.name
      currentTimezoneDisplay = common.getTimezoneDisplay(currentTimezone)
      $('#main').click(function (event) {
        if (!$(event.target).closest('#side_menu').length) {
          that.closeSideMenuIfOpen(event)
        }
      })
    },
    events: {
      'click #goToMyEventsButton': 'goToMyEvents',
      'click #side_menu_close_btn': 'closeSideMenu',
      'swipe': 'onSwipeClose',
      'click #createEventButtonSideMenu': 'showCreateEventModal',
      'click #randomEventButton': 'getRandomEvent',
      'click #allTheTimersButton': 'goToMainPage',
      'click #signOutButton': 'signOut',
      'click #signInButton': 'signIn',
      'click #signUpButton': 'signUp',
      'click #changePasswordButton': 'changePassword',
      'click #editUserInfoButton': 'editUserToggle',
      'click .side_menu_timezone_btn': 'timezoneModal',
      'change #timezoneModalChangeSelect': 'updateClientTimezone',
      'click #sideMenuLogo': 'goToMainPage',
      'click #setAutoModalTimezone': 'setLocalTimezone',
      'click #contactButton': 'goToContactPage',
      'click #privacyPolicyButton': 'goToPrivacyPolicy'
    },
    signOut: function () {
      common.signOut()
    },
    signIn: function () {
      this.closeSideMenu()
      common.signIn()
    },
    signUp: function() {
      this.closeSideMenu()
      common.signIn()
      $('.sign_up_radio').prop('checked', true)
      this.addOverflowToSignUpModal()
    },
    addOverflowToSignUpModal: function () {
      $('.sign_up_form').addClass('overflowAuto')
      $('.sign_up_form').removeClass('overflowHidden')
    },
    goToContactPage: function () {
      common.goToContactPage()
    },
    goToPrivacyPolicy: function () {
      common.goToPrivacyPolicy()
    },
    editUserToggle: function () {
      var that = this
      ws.getUserInfo(function(editUserDetails) {
        that.closeSideMenu()
        common.editUserToggle(editUserDetails); 
      })
    },
    changePassword: function () {
      this.closeSideMenu()
      common.changePassword()
    },
    timezoneModal: function () {
      if ($('#timezoneModal') && $('#timezoneModal').length)
        common.timezoneModal()
      else
        $('#timezoneModalChange').modal('show')
    },
    updateClientTimezone: function () {
      common.updateClientTimezone('#timezoneModalChangeSelect')
      if ($('#timezoneModalChange') && $('#timezoneModalChange').length)
        $('#timezoneModalChange').modal('toggle')
    },
    setLocalTimezone: function () {
      var localTimezone = moment.tz(moment.tz.guess())
      var currentLocalTimezoneName = localTimezone._z.name
      $('#timezoneModalChangeSelect option[data-timezone-name=\''+ currentLocalTimezoneName + '\']').prop("selected", true);
      this.updateClientTimezone()
    },
    closeSideMenu: function () {
      $('#side_menu').css('margin-left', '-100%')
      $('.black_overlay_side_menu').remove()
      $('.black_overlay_side_menu').unbind('.blackOverlayScroll')
      $('#side_menu').unbind('.sideMenuScroll')
      $('#side_menu').unbind('.sideMenuScrollStart')
    },
    closeSideMenuIfOpen: function (e) {
      if (e.target.className == 'black_overlay_side_menu') {
        if ($('#side_menu').css('margin-left') == '0px') {
          this.closeSideMenu();
        }
      }
    },
    // === Create event modal call from common.js ===
    
    showCreateEventModal: function () {
      this.closeSideMenu()
      var that = this
      $('.create_event_title').text('Create Event')
      $('#submitButtonCreateEvent').attr('value', 'create event')
      common.showCreateEventModal(function(){
        common.createEvent()
      }, null, true)
    },
    getRandomEvent: function () {
      common.getRandomEvent()
    },
    goToMainPage: function () {
      common.goToMainPage()
    },
    goToMyEvents: function () {
      common.goToMyEvents()
    },
    render: function () {
      var loggedIn = false
      var loggedUser
      if (localStorage.getItem('eventSnitchAccessToken')) {
          loggedIn = true
          loggedUser = localStorage.getItem('eventSnitchLoggedUser')
        } else if (sessionStorage.getItem('eventSnitchAccessToken')) {
          loggedIn = true
          loggedUser = sessionStorage.getItem('eventSnitchLoggedUser')
        }
      var template = _.template(commonSideMenuTemplate);
      var sideMenuTemplateObject = {
        loggedIn: loggedIn,
        timezones: timezones,
        currentTimezone: {
          display: currentTimezoneDisplay,
          offset: initialOffset,
          name: currentTimezoneName
        }
      }
      if (loggedUser)
        sideMenuTemplateObject.loggedUser = loggedUser
        
      this.$el.html(template(sideMenuTemplateObject));
      this.$el.hammer();
      
      return this;
    },
    onSwipeClose: function (e) {
      if (e.gesture.deltaX < 0)
        this.closeSideMenu();
    }
  });

  return CommonHeaderView;


});
