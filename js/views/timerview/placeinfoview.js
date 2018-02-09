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
        setCoverPhoto(response.cover.source)
        $('.eventLocationCover')[0].href = response.link
      } else {
        if(response.id == '361947134219308') {
          if($('.eventLocationName')[0]) {
            $('.eventLocationName')[0].href = response.link
          }
        } else {
          $('.eventLocationCover')[0].href = response.link
        }
        setCoverPhoto('../Content/img/worldwide_cover.jpg')
      }
      return this;
    }
  })
  
  function setCoverPhoto(coverPath) {
    $('.place_info_view_anchor').css({
      'background': 'url(' + coverPath + ') center center no-repeat',
      'background-size': 'cover'
    })
  }
  
  return TimerMapView;

});
