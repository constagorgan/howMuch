/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/privacypolicyview/privacypolicyview.html",
  "ws"
], function ($, _, Backbone, privacyPolicyTemplate, ws) {
  "use strict";

  var PrivacyPolicyView = Backbone.View.extend({
    initialize: function(options){
       this.options = options;
      _.bindAll(this, 'render');
    },
    render: function () {
      var template = _.template(privacyPolicyTemplate);
      this.$el.html(template({}));
      return this;
    }
  });

  return PrivacyPolicyView;
});
