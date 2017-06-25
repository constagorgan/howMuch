/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/cookiepolicyview/cookiepolicyview.html",
  "ws"
], function ($, _, Backbone, cookiePolicyTemplate, ws) {
  "use strict";

  var CookiePolicyView = Backbone.View.extend({
    initialize: function(options){
       this.options = options;
      _.bindAll(this, 'render');
    },
    render: function () {
      var template = _.template(cookiePolicyTemplate);
      this.$el.html(template({}));
      return this;
    }
  });

  return CookiePolicyView;
});
