/*global define, console */
/*jslint nomen: true */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/common/sidemenuview.html"
], function ($, _, Backbone, commonSideMenuTemplate) {
  "use strict";
    
  var CommonHeaderView = Backbone.View.extend({
      events: {
        'click #side_menu_close_btn': 'closeSideMenu'
      },
      closeSideMenu: function () {
        $('#side_menu').css("margin-left", "-100%")
      },
      render: function () {
        
        var template = _.template(commonSideMenuTemplate);
        this.$el.html(template({
          
        }));    
        return this;
      }
    });
    
  return CommonHeaderView;
});