/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/common/sidemenuview.html"
], function ($, _, Backbone, commonSideMenuTemplate) {
  "use strict";

  var getRandomEvent = Backbone.Model.extend({
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
  
  var CommonHeaderView = Backbone.View.extend({
    events: {
      'click #side_menu_close_btn': 'closeSideMenu',
      'click': 'closeSideMenuIfOpen',
      'click #randomEventButton': 'getRandomEvent',
      'click #allTheTimersButton': 'goToMainPage'
    },
    closeSideMenu: function () {
      $('#side_menu').css('margin-left', '-100%')
      $('.black_overlay').remove();
    },
    // asta momentan nu functioneaza bine (trebuie sa vedem pe ce o triggeruiesc sau ceva)
    closeSideMenuIfOpen: function (e) {
      if (e.target.className == 'black_overlay') {
        if ($('#side_menu').css('margin-left') == '0px') {
          this.closeSideMenu();
        }
      }
    },
    goToMainPage: function() {
      Backbone.history.navigate('#', true)
    },
    getRandomEvent: function () {
      var event = new getRandomEvent();
      event.fetch().done(function (resp) {
        if (resp && resp[0]) {
          Backbone.history.navigate('#event/' + encodeURIComponent(resp[0].name) + '/' + resp[0].id, true)
        }
      })
    },
    render: function () {

      var template = _.template(commonSideMenuTemplate);
      this.$el.html(template({

      }));
      return this;
    }
  });

  return CommonHeaderView;
});
