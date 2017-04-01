/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/emailresponseview/confirmsignupview.html",
  "ws"
], function ($, _, Backbone, confirmSignUpTemplate, ws) {
  "use strict";

  var ConfirmSignUpView = Backbone.View.extend({
    initialize: function(options){
       this.options = options;
      _.bindAll(this, 'render');
    },
    render: function () {
      ws.getConfirmSignUpResponse(this.options, function(message){
        var template = _.template(confirmSignUpTemplate);
        this.$el.html(template({
          message: message
        }));
      })
      
      return this;
    }
  });

  return ConfirmSignUpView;
});