/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/common/footerview.html",
  "common"
], function ($, _, Backbone, commonFooterTemplate, common) {
  "use strict";
    
  var CommonFooterView = Backbone.View.extend({
    events: {
      'click #contactButton': 'goToContactPage',
    },
    goToContactPage: function () {
     common.goToContactPage()
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
