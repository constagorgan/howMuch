/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/notfoundview/notfoundview.html",

], function ($, _, Backbone, notFoundTemplate) {
  "use strict";

  var NotFoundView = Backbone.View.extend({
    initialize: function (options) {
      this.options = options;
      _.bindAll(this, 'render');
    },
    render: function () {
      var message = "The requested URL was not found."
      var template = _.template(notFoundTemplate);
      this.$el.html(template({
        message: message
      }));

      return this;
    }
  });

  return NotFoundView;
});
