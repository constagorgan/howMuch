/* global define, console */

define([
  'jquery',
  'jquery-ui',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020',
  'countdown',
  'backbone',
  'ws',
  'text!../../../templates/categoryview/eventlistview.html'
], function ($, ui, _, moment, countdown, Backbone, ws, eventListTemplate) {
  'use strict'
  
  var EventListView = Backbone.View.extend({
    render: function(response, selectedPage) {
      var template = _.template(eventListTemplate)
      this.$el.html(template({
        response: response,
        moment: moment
      }));
      this.highlightSelectedPage(selectedPage)
      this.delegateEvents()
    },
    highlightSelectedPage: function (selectedPage) {
      var selectedElement = $(".list_footer_item[data-page-number='" + selectedPage + "']")
      selectedElement.addClass("list_footer_item_selected")
    }
  });
  
  return EventListView
})