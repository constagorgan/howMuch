/*global define, console */
define([
  "jquery",
  "moment",
  "backbone",
  "text!../../../templates/timerview/deadlineview.html",
], function ($, moment, Backbone, deadlineViewTemplate) {
  "use strict";
  
  var TimerMapView = Backbone.View.extend({
    close: function () {
      this.remove();
    },
    render: function (deadline) {
      var that = this;
      var template = _.template(deadlineViewTemplate);
      this.$el.html(template({
        deadline: moment(deadline).format("DD MMM YYYY [at] HH:mm:ss")
      }));
      
      return this;
    }
  })
  
  return TimerMapView;

});
