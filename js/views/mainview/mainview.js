/* global define, console */

define([
  'jquery',
  'jquery-ui',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020',
  'countdown',
  'backbone',
  'text!../../../templates/mainview/mainview.html'
], function ($, ui, _, moment, countdown, Backbone, mainviewTemplate) {
  'use strict'

  var events = {};

  var searchEvents = Backbone.Model.extend({
    idAttribute: '_id',
    initialize: function () {
      $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        options.crossDomain = {
          crossDomain: true
        }
      })
    },
    urlRoot: 'http://localhost:8003/searchEvents'
  })

  var searchByCategories = Backbone.Model.extend({
    idAttribute: '_id',
    initialize: function () {
      $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        options.crossDomain = {
          crossDomain: true
        }
      })
    },
    urlRoot: 'http://localhost:8003/searchCategories'
  })

  var MainviewView = Backbone.View.extend({
    tagName: "div",
    className: "fullHeight",
    render: function () {
      var template = _.template(mainviewTemplate)
      this.$el.html(template({

      }))
      return this
    },
    initialize: function () {
      $(function () {
        $("#search-input").autocomplete({
          source: function (request, response) {
            var event = new searchEvents();
            event.fetch({
              data: {
                name: request.term
              }
            }).done(function (resp) {
              response(_.map(resp, function (e) {
                return {
                  label: e.name,
                  value: e.name,
                  id: e.name
                };
              }));
            })
          },
          minLength: 1,
          select: function (event, ui) {
            var url = ui.item.name;
            if (url != '#') {
              location.href = '#/event';
            }
          }
        })
        $("#eventsDiv").scroll(function () {
          if ($(this).scrollTop() > $(this).height() + 100)
            $(".scrollArrow").fadeOut();
          else
            $(".scrollArrow").fadeIn();
        })
      })
      getLocation();
    }
  })


  function getLocation() {
    $.getJSON("http://freegeoip.net/json/", function (rs) {
      var eventsByCategories = new searchByCategories()
      if (rs.country_name) {
        eventsByCategories.fetch({ data: {country_code: rs.country_code.toUpperCase() }}).done(function (response) {
          events = response;
        })
      } else {
        eventsByCategories.fetch({ data: {country_code: 'WORLD' }}).done(function (response) {
          events = response;
        })
      }
    })
  }


  return MainviewView
})
