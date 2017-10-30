/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/contact/contact.html"
], function ($, _, Backbone, contactTemplate) {
  "use strict";

  var ContactView = Backbone.View.extend({
    initialize: function(options){
       this.options = options;
      _.bindAll(this, 'render');
    },
    render: function () {
        var template = _.template(contactTemplate)
      
        this.$el.html(template({
          
        }))
      
      return this;
    }
  });

  return ContactView;
});
