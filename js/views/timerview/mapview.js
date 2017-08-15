/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/timerview/mapview.html",
], function ($, _, Backbone, timerMapViewTemplate) {
  "use strict";
  
  var TimerMapView = Backbone.View.extend({
    close: function () {
      this.remove();
    },
    render: function (eventLocation, userLocation) {
      var that = this;
      var template = _.template(timerMapViewTemplate);
      this.$el.html(template({
        eventLocation: eventLocation,
        userLocation: userLocation
      }));
      
      return this;
    }
  })
  
  return TimerMapView;

});
