/* global define, console */

define([
  'jquery',
  'jquery-ui',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020',
  'countdown',
  'backbone',
  'ws',
  'text!../../../templates/mainview/mainview.html'
], function ($, ui, _, moment, countdown, Backbone, ws, mainviewTemplate) {
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

  var MainviewView = Backbone.View.extend({
    render: function () {
      var that = this

      var template = _.template(mainviewTemplate)

      ws.getEventsByCategory(function (response) {
        that.$el.html(template({
          response: response,
          moment: moment
        }))
        addHandlers()
      }, function (response) {
        console.log('fail')
        addHandlers()
      })

      return this
    },
    initialize: function () {

    }
  })

  function addHandlers() {
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
          location.href = '/#event/' + encodeURIComponent(ui.item.label) + '/' + ui.item.id;
        }
      }
    })

    $(".homepage_event_category_li").click(function (e) {
      var itemId = $(this).attr('id').split('_');
      if (itemId && itemId.length)
        location.href = '/#event/' + encodeURIComponent(itemId[1]) + '/' + itemId[0];
      //onclick="<%=location.href = '/#event/' + currentEventCategory[i].name%>;"ß
    });

    if (($(window).height() + 100) < $(document).height()) {
      $('#top-link-block').removeClass('hidden').affix({
        // how far to scroll down before link "slides" into view
        offset: {
          top: 100
        }
      });
    }
  }

  return MainviewView
})
