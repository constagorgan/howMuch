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
      'click #privacyPolicyButton': 'goToPrivacyPolicy'
    },
    goToContactPage: function () {
     common.goToContactPage()
    },
    goToPrivacyPolicy: function() {
      common.goToPrivacyPolicy()
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
