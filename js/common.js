/*global define, console, alert */
/*jslint nomen: true */
define([

  "jquery",
  "underscore",
  "backbone",
  "ws"
], function ($, _, Backbone, ws) {
  "use strict";

  return {
    addSearchBarEvents: function (url, locationDetails, success, error) {
      $("#search-input").autocomplete({
        source: function (request, response) {
          ws.searchEvents(request.term, function (resp) {
          response(_.map(resp, function (e) {
            return {
              id: e.id,
              label: e.name
            };
            }));
          }, function (error) {
              console.log('fail')
            });
        },
        minLength: 3,
        select: function (event, ui) {
          var url = ui.item.label;
          if (url != '#') {
            Backbone.history.navigate('#event/' + encodeURIComponent(ui.item.label) + '/' + ui.item.id, true)
          }
        }
    })
    },
    getRandomEvent: function(){
      ws.getRandomEvent(function (resp) {
        if (resp && resp[0]) {
          Backbone.history.navigate('#event/' + encodeURIComponent(resp[0].name) + '/' + resp[0].id, true)
        }
      }, function (error) {
         console.log('fail')
      });
    }
  };
});
