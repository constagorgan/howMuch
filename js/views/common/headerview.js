/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/common/headerview.html"
], function ($, _, Backbone, commonHeaderTemplate) {
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
      'click .header_btn': 'showSideMenu',
      'click #randomEventButton': 'getRandomEvent',
      'click #allTheTimersButton': 'goToMainPage'
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
    showSideMenu: function () {
      $('#side_menu').css('margin-left', '0')
      $('#main').append('<div class="black_overlay"></div>')
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
