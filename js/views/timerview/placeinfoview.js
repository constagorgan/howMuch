/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/timerview/placeinfoview.html",
], function ($, _, Backbone, timerMapViewTemplate) {
  "use strict";
  
  var TimerMapView = Backbone.View.extend({
    close: function () {
      this.remove();
    },
    render: function (response) {
      var template = _.template(timerMapViewTemplate);
      var templateObj = {
        eventName: response.name,
      }
      this.$el.html(template(templateObj));
      if(response.cover && response.cover.source) {
        $('.place_info_view_anchor').css({
          'background': 'url(' + response.cover.source + ') center center no-repeat',
          'background-size': 'cover',
          'height': '300px'
        })
        $('.event_place_name_slot').css({
          'margin-bottom': '0'
        })
        $('.event_place_name').css({
          'text-shadow': 'black 0 0 10px, black 0 0 10px',
          'color': '#fff',
          'background-color': '#000',
          'border-color': '#fff',
          'border-bottom': '1px solid #fff'
        })
      }
      
      
      
      return this;
    }
  })
  
  return TimerMapView;

});
