/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "ws",
  "common",
  "text!../../../templates/contact/contact.html"
], function ($, _, Backbone, ws, common, contactTemplate) {
  "use strict";

  var ContactView = Backbone.View.extend({
    events: {
      'submit #contactForm': 'sendUserFeedback',
    },
    emptyFormData: function (formId) {
      $(formId).find("input").not(':input[type=submit]').val("")
      $(formId).find("textarea").val("")
      $(formId).find("input[type=submit]").val("Thank you for the message!").prop("type", "button").attr("disabled", true).addClass("success_green");      
    },
    sendUserFeedback: function() {
      event.preventDefault()
      var that = this
      var contactFormDetails = {}
      contactFormDetails.email = $('#emailContact').val()
      contactFormDetails.name = $('#nameContact').val()
      contactFormDetails.phone = $('#phoneContact').val()
      contactFormDetails.message = $('#messageContact').val()
      ws.sendUserFeedback(contactFormDetails, function (resp) {
        that.emptyFormData('#contactForm')
        $('#contactForm').validate().resetForm()
      }, function(resp){
        
      })
    },
    initialize: function(options){
       this.options = options;
      _.bindAll(this, 'render');
    },
    render: function () {
      var template = _.template(contactTemplate)
      
      this.$el.html(template({

      }))
      common.addContactFormHandlers(this.$('#contactForm'))
      return this;
    }
  });

  return ContactView;
});
