/* global define, console */

define([
  'jquery',
  'jquery-ui',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020',
  'countdown',
  'backbone',
  'ws',
  'text!../../../templates/categoryview/categoryview.html',
  './eventlistview'
], function ($, ui, _, moment, countdown, Backbone, ws, categoryviewTemplate, EventListView) {
  'use strict'

  var screen_height = $('body').height();
  //    var cur-y = $(window).scrollTop();
  var screen = $(window).height();

  var CategoryviewView = Backbone.View.extend({
    initialize: function (options) {
      this.eventList = new EventListView();
      options.pageIndex = 0;
      this.options = options;
      _.bindAll(this, 'render');
    },
    events: {
      'click #btn_sort_by': 'showSortByOptions',
      'keyup #search-input-filter': 'searchEventByName',
      'click .category_event_li': 'navigateToEvent',
      'click .list_footer_item': 'getPageContent',
      'click .list_footer_left_arrow': 'getPageContent',
      'click .list_footer_right_arrow': 'getPageContent'
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
      this.options.pageIndex = 0;
      this.renderEventList()
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
    getPageContent: function(e) {
      var pageNumber = parseInt($(e.currentTarget).attr('data-page-number'))
      this.options.pageIndex = pageNumber
      this.renderEventList()
    },
    renderEventList: function () {
      var that = this
      
      if (!this.options)
        this.options = {}
      var options = this.options
      
      ws.getEventsInCategory(options.categoryName, options.orderType, options.pageIndex, options.name, options.countryCode, function (response) {
        that.$('.events_list_anchor').html(that.eventList.$el);
        that.eventList.render(response, options.pageIndex);
      }, function (error) {
        console.log('fail')
      })
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
          categoryName: options.categoryName,
          moment: moment
        }))
        that.$('.events_list_anchor').html(that.eventList.$el);
        that.eventList.render(response, options.pageIndex);
      }, function (error) {
        console.log('fail')
        addHandlers()
      })

      addHandlers()

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
