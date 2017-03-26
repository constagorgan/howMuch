/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/common/sidemenuview.html",
  "common"
], function ($, _, Backbone, commonSideMenuTemplate, common) {
  "use strict";

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
      'click #side_menu_close_btn': 'closeSideMenu',
      'swipe': 'onSwipeClose',
      'click #randomEventButton': 'getRandomEvent',
      'click #allTheTimersButton': 'goToMainPage'
    },
    closeSideMenu: function () {
      $('#side_menu').css('margin-left', '-100%')
      $('.black_overlay_side_menu').remove();
    },
    // asta momentan nu functioneaza bine (trebuie sa vedem pe ce o triggeruiesc sau ceva)
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
      Backbone.history.navigate('#', true)
    },
    render: function () {

      var template = _.template(commonSideMenuTemplate);
      this.$el.html(template({

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
