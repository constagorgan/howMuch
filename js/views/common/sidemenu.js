/*global define, console */
define([
  "jquery",
  "underscore",
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2012-2022',
  "backbone",
  "text!../../../templates/common/sidemenuview.html",
  '../../../Content/resources/resources',
  "common"
], function ($, _, moment, Backbone, commonSideMenuTemplate, Resources, common) {
  "use strict";

  common.checkUserTimezone()
  var timezones = []

  var currentTimezone = moment.tz(localStorage.getItem('userTimezone'))
  var initialOffset = currentTimezone._offset
  var currentTimezoneName = currentTimezone._z.name
  var currentTimezoneDisplay = common.getTimezoneDisplay(currentTimezone)

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
      $(document).click(function (event) {
        if (!$(event.target).closest('#side_menu').length) {
          that.closeSideMenuIfOpen(event)
        }
      })
    },
    events: {
      'click #goToMyEventsButton': 'goToMyEvents',
      'click #side_menu_close_btn': 'closeSideMenu',
      'swipe': 'onSwipeClose',
      'click #randomEventButton': 'getRandomEvent',
      'click #allTheTimersButton': 'goToMainPage',
      'click #signOutButton': 'signOut',
      'click #signInButton': 'signIn',
      'click #changePasswordButton': 'changePassword',
      'click .side_menu_timezone_btn': 'timezoneModal',
      'change #timezoneModalChangeSelect': 'updateClientTimezone',
      'click #sideMenuLogo': 'goToMainPage'
    },
    signOut: function () {
      common.signOut()
    },
    signIn: function () {
      common.signIn()
    },
    changePassword: function () {
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
    closeSideMenu: function () {
      $('#side_menu').css('margin-left', '-100%')
      $('.black_overlay_side_menu').remove();
    },
    closeSideMenuIfOpen: function (e) {
      if (e.target.className == 'black_overlay_side_menu') {
        if ($('#side_menu').css('margin-left') == '0px') {
          this.closeSideMenu();
        }
      }
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
      if (localStorage.getItem('eventSnitchAccessToken'))
        loggedIn = true
      else if (sessionStorage.getItem('eventSnitchAccessToken'))
        loggedIn = true
      var template = _.template(commonSideMenuTemplate);
      this.$el.html(template({
        loggedIn: loggedIn,
        timezones: timezones,
        currentTimezone: {
          display: currentTimezoneDisplay,
          offset: initialOffset,
          name: currentTimezoneName
        }
      }));
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
