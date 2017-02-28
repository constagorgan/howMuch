/* global define, console */

define([
  'jquery',
  'jquery-ui',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020',
  'countdown',
  'backbone',
  'text!../../../templates/categoryview/categoryview.html'
], function ($, ui, _, moment, countdown, Backbone, categoryviewTemplate) {
  'use strict'

  var screen_height = $('body').height();
  //    var cur-y = $(window).scrollTop();
  var screen = $(window).height();
  var index = 0;

  var CategoryviewView = Backbone.View.extend({
    initialize: function (options) {
      this.categoryName = options.categoryName
      var that = this
      this.getUpcoming()
      $(function () {
         $(window).scroll(function () {
          if ($(window).scrollTop() + $(window).height() == $(document).height())
            that.getUpcoming()
        })       
      })
    },
    events: {
      'click #btn_sort_by': 'showSortByOptions'
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
    getUpcoming: function () {
      $.ajax({
        url: "http://localhost:8003/getUpcomingEvents",
        data: {
          index: index
        },
        success: function (response) {
          index += 1;
          screen_height = $('body').height();
        }
      });
    },
    render: function () {
      var template = _.template(categoryviewTemplate)
      this.$el.html(template({
        categoryName: this.categoryName
      }))
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
