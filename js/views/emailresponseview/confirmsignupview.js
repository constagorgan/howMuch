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
    close: function() {
      clearTimeout(this.redirect)
    },
    render: function () {
      var that = this
      ws.getConfirmSignUpResponse(this.options, function(message){
        var template = _.template(confirmSignUpTemplate);
        that.$el.html(template({
          message: message
        }));
      })
      
      this.redirect = setTimeout(function(){ 
        window.location.hash = '#'
      }, 5000)
      
      return this;
    }
  });

  return ConfirmSignUpView;
});