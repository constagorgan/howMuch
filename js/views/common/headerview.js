/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "text!../../../templates/common/headerview.html",
  "common",
  "ws"
], function ($, _, Backbone, commonHeaderTemplate, common, ws) {
  "use strict";

  var CommonHeaderView = Backbone.View.extend({
    events: {
      'click .header_btn': 'showSideMenu',
      'click #randomEventButton': 'getRandomEvent',
      'click #allTheTimersButton': 'goToMainPage',
      'click #signUpButton': 'showSignUpModal',
      'click #reset_password_tab': 'showResetTab',
      'click #sign_in_tab': 'showSignInTab',
      'click #sign_up_tab': 'showSignUpTab',
      'click #change_password_tab': 'showChangePasswordTab',
      'submit #sign_in_form': 'testForm',
    },
    testForm: function () {
    },
    goToMainPage: function () {
      Backbone.history.navigate('#', true)
    },
    getRandomEvent: function () {
      common.getRandomEvent()
    },
    addOverflowToSignUpModal: function () {
      $('.sign_up_form').addClass('overflowAuto')
      $('.sign_up_form').removeClass('overflowHidden')
    },
    removeOverflowFromSignUpModal: function () {
      $('.sign_up_form').removeClass('overflowAuto')
      $('.sign_up_form').addClass('overflowHidden')
    },
    scrollSignUpFormTop: function () {
      $('.sign_up_form').animate({
        scrollTop: 0
      }, 200)
    },
    showSideMenu: function () {
      $('#side_menu').css('margin-left', '0')
      $('#main').append('<div class="black_overlay_side_menu"></div>')
    },
    showSignUpModal: function () {
      $('#sign_up_modal').modal('show')
      common.addDatePicker()
      addModalHandlers()
    },
    showResetTab: function () {
      $('.reset_password_form_container').addClass("sign_up_tabs_rotate_zero")
    },
    showChangePasswordTab: function () {
      $('.change_password_form_container').addClass("sign_up_tabs_rotate_zero")
    },
    showSignInTab: function () {
      this.scrollSignUpFormTop()
      this.removeOverflowFromSignUpModal()
      this.hideResetOrChangePasswordTab()
    },
    showSignUpTab: function () {
      this.addOverflowToSignUpModal()
      this.hideResetOrChangePasswordTab()
    },
    hideResetOrChangePasswordTab: function () {
      this.scrollSignUpFormTop()
      var resetTab = $('.sign_up_tabs_rotate_zero')
      if (resetTab && resetTab.length) {
        resetTab.removeClass('sign_up_tabs_rotate_zero')
      }
    },
    render: function () {
      var that = this
      ws.getCountriesList(function (countries) {
        var template = _.template(commonHeaderTemplate);
        that.$el.html(template({
          response: countries
        }));
      })
      return this;
    }
  });

  function addModalHandlers() {
    $('.dropup.focus-active').on('shown.bs.dropdown', function (event) {
      if (!$('ul.dropdown-menu li.selected') || !$('ul.dropdown-menu li.selected').length) {
        $('ul.dropdown-menu li:first').addClass('active')
        $('ul.dropdown-menu li:first').focus()
      } else {
        $('ul.dropdown-menu li.active').removeClass('active')
        $('ul.dropdown-menu li.selected').addClass('active')
        $('ul.dropdown-menu li.selected').focus()
      }
      event.stopImmediatePropagation()
      var that = $(this);
      $(this).find(".dropdown-menu li.active a").focus()

      $(document).keyup(function (e) {
        var key = String.fromCharCode(e.which);
        var foundLi = false
        that.find("li").each(function (idx, item) {
          $(item).removeClass("active")
          if ($(item).text().charAt(0).toLowerCase() == key.toLowerCase()) {
            if (!foundLi) {
              $(item).addClass("active")
              that.find(".dropdown-menu li.active a").focus()
              foundLi = true
            }
          }
        });
      })

      $('.country_dropdown_menu li').click(function () {
        $('ul.dropdown-menu li.selected').removeClass('selected')
        $(this).addClass('selected')
        var selText = $(this).text().replace(/\w\S*/g, function (txt) {
          return txt.charAt(0).toUpperCase() + (txt.indexOf(".") > -1 ? txt.substr(1).toUpperCase() : txt.substr(1).toLowerCase())
        })
        $(this).parents('#country_code_dropdown').find('.dropdown-toggle').html(selText + ' <span class="caret country_dropdown_caret"></span>');
      })
    })

    $("#sign_in_form").validate({
      rules: {
        email_sign_in: {
          myEmail: true,
          required: true
        },
        pass_sign_in: {
          required: true
        }
      }
    });
    
    $.validator.addMethod("myEmail", function(value, element) {
        return this.optional( element ) || ( /^[a-z0-9]+([-._][a-z0-9]+)*@([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,4}$/.test( value ) && /^(?=.{1,64}@.{4,64}$)(?=.{6,100}$).*/.test( value ) );
    }, 'Please enter valid email address.');
  }
  return CommonHeaderView;

});
