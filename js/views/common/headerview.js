/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/common/headerview.html"
], function ($, _, Backbone, commonHeaderTemplate) {
  "use strict";
    
  var CommonHeaderView = Backbone.View.extend({
      events: {
        'click .header_btn': 'showSideMenu'
      },
      showSideMenu: function () {
        $('#side_menu').css('margin-left', '0')
        $('#main').append('<div class="black_overlay"></div>')
      },
      render: function () {
        
        var template = _.template(commonHeaderTemplate);
        this.$el.html(template({
          
        }));    
        return this;
      }
    });
    
  return CommonHeaderView;
});
