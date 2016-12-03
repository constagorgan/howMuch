/*global define, console */
/*jslint nomen: true */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/common/headerview.html"
], function ($, _, Backbone, commonHeaderTemplate) {
  "use strict";
    
  var CommonHeaderView = Backbone.View.extend({
      render: function () {
        var template = _.template(commonHeaderTemplate);
        this.$el.html(template({
          
        }));
        return this;
      }
    });
    
  return CommonHeaderView;
});
