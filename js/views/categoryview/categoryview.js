/* global define, console */

define([
  'jquery',
  'jquery-ui',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020',
  'countdown',
  'backbone',
  'ws',
  'text!../../../templates/categoryview/categoryview.html'
], function ($, ui, _, moment, countdown, Backbone, ws, categoryviewTemplate) {
  'use strict'

  var screen_height = $('body').height();
  //    var cur-y = $(window).scrollTop();
  var screen = $(window).height();
  var index = 0;

  var CategoryviewView = Backbone.View.extend({
    initialize: function (options) {
      index = 0;
      this.options = options;
      _.bindAll(this, 'render');
    },
    events: {
      'click #btn_sort_by': 'showSortByOptions',
      'keyup #search-input-filter': 'searchEventByName',
      'click .category_event_li': 'navigateToEvent'
    },
    showSortByOptions: function () {
      if ($("#list_controller_dropdown").hasClass("display_block")) {
        $("#list_controller_dropdown").removeClass("display_block");
        $("#category_sort_by_arrow").removeClass("gray_up_arrow_5px")
        $("#category_sort_by_arrow").addClass("gray_down_arrow_5px")
      } else {
        $("#list_controller_dropdown").addClass("display_block");
        $("#category_sort_by_arrow").addClass("gray_up_arrow_5px")
        $("#category_sort_by_arrow").removeClass("gray_down_arrow_5px")
      }
    },
    searchEventByName: function (e) {
      if (!this.options)
        this.options = {}
      this.options.name = $(e.currentTarget).val()
      this.render()
    },
    searchEventsByOrderType: function (e) {
      if (!this.options)
        this.options = {}
      this.options.orderType = $(e.currentTarget).val()
      this.render()
    },
    navigateToEvent: function (e) {
      var itemId = $(e.currentTarget).attr('id').split('_');
      if (itemId && itemId.length)
        Backbone.history.navigate('#event/' + encodeURIComponent(itemId[1]) + '/' + itemId[0], true)
    },
    render: function () {
      var that = this
      if (!this.options)
        this.options = {}
      var options = this.options
      if (options && options.categoryName && options.categoryName === 'upcoming')
        options.orderType = 'chronological';
      else
        options.orderType = 'popular';

      var template = _.template(categoryviewTemplate)

      ws.getEventsInCategory(options.categoryName, options.orderType, '0', options.name, options.countryCode, function (response) {
          that.$el.html(template({
            response: response,
            categoryName: that.categoryName,
            moment: moment
          }))
          addHandlers()
        },
        function (error) {
          console.log('fail')
          addHandlers()
      })
      return this
    }

  })

  // nu merge drop down-ul aici, trebuie verificat
  function addHandlers() {
    $("#search-input").autocomplete({
      source: function (request, response) {
        var event = new ws.searchEvents();
        event.fetch({
          data: {
            name: request.term
          }
        }).done(function (resp) {
          response(_.map(resp, function (e) {
            return {
              id: e.id,
              label: e.name
            };
          }));
        })
      },
      minLength: 1,
      select: function (event, ui) {
        var url = ui.item.label;
        if (url != '#') {
          Backbone.history.navigate('#event/' + encodeURIComponent(ui.item.label) + '/' + ui.item.id, true)
        }
      }
    })
  }

  return CategoryviewView
})
