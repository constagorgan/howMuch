/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/common/footerview.html"
], function ($, _, Backbone, commonFooterTemplate) {
  "use strict";
    
  var CommonFooterView = Backbone.View.extend({
    events: {
      'click #contactButton': 'goToContactPage',
    },
    goToContactPage: function () {
      $('html').scrollTop(0)
      if(window.location.hash === '#contact')
        window.location.reload()
      else
        window.location.hash = '#contact'
    },
    render: function () {
      var template = _.template(commonFooterTemplate);
      this.$el.html(template({

      }));    
      return this;
    }
  });
    
  return CommonFooterView;
});
