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
          $('.eventLocationName')[0].href = response.link
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
      'background-size': 'cover',
      'height': $(window).width()/2.7
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
  
  return TimerMapView;

});
