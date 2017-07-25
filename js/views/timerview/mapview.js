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
    events: {
      'mouseleave #timerGoogleMap': 'addMapOverlay',
      'click #gmapOverlay': 'removeMapOverlay'
    },
    addMapOverlay: function() {
      if($(window).width() > 768) {
        $('#gmapOverlay').removeClass('hidden');
      }
    },
    removeMapOverlay: function() {
      $('#gmapOverlay').addClass('hidden');
    },
    render: function (eventLocation, userLocation) {
      var that = this;
      var template = _.template(timerMapViewTemplate);
      this.$el.html(template({
        eventLocation: eventLocation,
        userLocation: userLocation
      }));
      
      $('#timerGoogleMap').on('load', function() {
        that.addMapOverlay();
      })
      
      return this;
    }
  })
  
  return TimerMapView;

});
