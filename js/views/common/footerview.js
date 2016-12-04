/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/common/footerview.html"
], function ($, _, Backbone, commonFooterTemplate) {
  "use strict";
    
  var CommonFooterView = Backbone.View.extend({
      render: function () {
        
        var template = _.template(commonFooterTemplate);
        this.$el.html(template({
          
        }));    
        return this;
      }
    });
    
  return CommonFooterView;
});
