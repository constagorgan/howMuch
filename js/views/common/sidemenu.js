/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/common/sidemenuview.html"
], function ($, _, Backbone, commonSideMenuTemplate) {
  "use strict";
    
  var CommonHeaderView = Backbone.View.extend({
      events: {
        'click #side_menu_close_btn': 'closeSideMenu',
        'click': 'closeSideMenuIfOpen'
      },
      closeSideMenu: function () {
        $('#side_menu').css('margin-left', '-100%')
        $('.black_overlay').remove();
      },
      // asta momentan nu functioneaza bine (trebuie sa vedem pe ce o triggeruiesc sau ceva)
      closeSideMenuIfOpen: function (e) {
        if(e.target.className == 'black_overlay') {
          if ($('#side_menu').css('margin-left') == '0px') {
            this.closeSideMenu();
          }
        }
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