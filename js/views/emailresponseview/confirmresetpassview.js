/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/emailresponseview/confirmresetpassview.html",
  "ws"
], function ($, _, Backbone, confirmResponseTemplate, ws) {
  "use strict";

  var ConfirmResponseView = Backbone.View.extend({
    initialize: function(options){
       this.options = options;
      _.bindAll(this, 'render');
    },
    render: function () {
      ws.getConfirmResetPassResponse(this.options, function(message){
        var template = _.template(confirmResponseTemplate);
        this.$el.html(template({
          message: message
        }));
      })
      
      return this;
    }
  });

  return ConfirmResponseView;
});
