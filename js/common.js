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
        minLength: 3,
        select: function (event, ui) {
          var url = ui.item.label;
          if (url != '#') {
            Backbone.history.navigate('#event/' + encodeURIComponent(ui.item.label) + '/' + ui.item.id, true)
          }
        }
    })
    }
  };
});
