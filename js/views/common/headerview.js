/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/common/headerview.html",
  "common"
], function ($, _, Backbone, commonHeaderTemplate, common) {
  "use strict";

  var CommonHeaderView = Backbone.View.extend({
    events: {
      'click .header_btn': 'showSideMenu',
      'click #randomEventButton': 'getRandomEvent',
      'click #allTheTimersButton': 'goToMainPage'
    },
    goToMainPage: function() {
      Backbone.history.navigate('#', true)
    },
    getRandomEvent: function () {
      common.getRandomEvent()
    },
    showSideMenu: function () {
      $('#side_menu').css('margin-left', '0')
      $('#main').append('<div class="black_overlay_side_menu"></div>')
    },
    render: function () {

      var template = _.template(commonHeaderTemplate);
      this.$el.html(template({

      }));
      return this;
    }
  });

  return CommonHeaderView;
});
