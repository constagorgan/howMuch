/* global define, console */

define([
  'jquery',
  'jquery-ui',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020',
  'countdown',
  'backbone',
  'text!../../../templates/upcomingview/upcomingview.html'
], function ($, ui, _, moment, countdown, Backbone, upcomingviewTemplate) {
  'use strict'

  var screen_height = $('body').height();
  //    var cur-y = $(window).scrollTop();
  var screen = $(window).height();
  var index = 0;

  var UpcomingviewView = Backbone.View.extend({
    tagName: "div",
    className: "fullHeight",
    render: function () {
      var template = _.template(upcomingviewTemplate)
      this.$el.html(template({

      }))
      return this
    },
    initialize: function () {
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
    }

  })


  return UpcomingviewView
})
