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

  var getEvents = Backbone.Model.extend({
    idAttribute: '_id',
    initialize: function () {
      $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        options.crossDomain = {
          crossDomain: true
        }
      })
    },
    urlRoot: 'http://localhost:8003/'
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
            var events = new getEvents();
            events.fetch({
              data: {
                table: 'events',
                name: request.term
              }
            }).done(function (resp) {
              response(_.map(resp, function(e){
                return { label: e.Name, value: e.Name, id: e.Name };
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
        });
      })
      var events = new getEvents();
      events.fetch({
        data: {
          table: 'events',
          id: 0
        }
      }).done(function (response) {

      })

    }
  })


  return MainviewView
})
