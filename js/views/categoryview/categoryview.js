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
      return this
    }

  })

  return CategoryviewView
})
