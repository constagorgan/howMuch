/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/common/headerview.html",
  "common"
], function ($, _, Backbone, commonHeaderTemplate, common) {
  "use strict";

  var CommonHeaderView = Backbone.View.extend({
    events: {
      'click .header_btn': 'showSideMenu',
      'click #randomEventButton': 'getRandomEvent',
      'click #allTheTimersButton': 'goToMainPage',
      'click #signUpButton': 'showSignUpModal',
      'click #reset_password_tab': 'showResetTab',
      'click #sign_in_tab': 'hideResetTab',
      'click #sign_up_tab': 'hideResetTab'
    },
    goToMainPage: function() {
      Backbone.history.navigate('#', true)
    },
    getRandomEvent: function () {
      common.getRandomEvent()
    },
    showSideMenu: function () {
      $('#side_menu').css('margin-left', '0')
      $('#main').append('<div class="black_overlay_side_menu"></div>')
    },
    showSignUpModal: function(){
      $('#sign_up_modal').modal('show')
    },
    showResetTab: function(){
      $('.reset_password_form_container').addClass("sign_up_tabs_rotate_zero")
    },
    hideResetTab: function(){
      var resetTab = $('.sign_up_tabs_rotate_zero')
      if(resetTab && resetTab.length){
        resetTab.removeClass('sign_up_tabs_rotate_zero')
      }
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
