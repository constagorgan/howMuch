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
      'submit #sign_in_form': 'signIn',
      'submit #resetPasswordForm': 'resetPassword',
      'click #closeSignUpModalResponseButton': 'closeSignUpModal'
    },
    closeSignUpModal: function (event) {
      $('#signUpModal').modal('toggle')
    },
    signIn: function (event) {
      event.preventDefault()
      var signInDetails = {}
      signInDetails.email = $('#email_sign_in').val()
      signInDetails.password = $('#pass_sign_in').val()
      ws.signIn(signInDetails, function (resp) {
//        debugger
      }, function (resp) {
//        debugger
      })
    },
    resetPassword: function (event) {
      event.preventDefault()
      var resetPassDetails = {}
      resetPassDetails.email = $('#resetPassEmail').val()
      ws.resetPassword(resetPassDetails, function (resp) {
        $('#signUpModalResponseLabel').text('A password reset confirmation email was sent to ' + resetPassDetails.email)
        $('.reset_password_form_container').removeClass("sign_up_tabs_rotate_zero")
        $('.sign_up_modal_response_container').addClass('sign_up_tabs_rotate_zero')
      })
    },
    restoreResponseTab: function(event){
      $('#user_reset_password_response').text('')
      $('.sign_up_modal_response_container').removeClass('sign_up_tabs_rotate_zero')
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
      $('#signUpModal').modal('show')
      common.addDatePicker()
      addModalHandlers()
    },
    showResetTab: function () {
      this.restoreResponseTab()
      $('.reset_password_form_container').addClass("sign_up_tabs_rotate_zero")
      $('#resetPasswordForm').validate().resetForm()
    },
    showChangePasswordTab: function () {
      $('.change_password_form_container').addClass("sign_up_tabs_rotate_zero")
      $('#change_password_form').validate().resetForm()
    },
    showSignInTab: function () {
      this.scrollSignUpFormTop()
      this.removeOverflowFromSignUpModal()
      this.hideResetOrChangePasswordTab()
      $('#sign_in_form').validate().resetForm()
    },
    showSignUpTab: function () {
      this.addOverflowToSignUpModal()
      this.hideResetOrChangePasswordTab()
      $('#sign_up_form').validate().resetForm()
      $('#country_dropdown').removeClass('sign_up_form_invalid')
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
    var myBackup = $('#signUpModal').clone();
    $('#signUpModal').on('hidden.bs.modal', function () {
        $('#signUpModal').remove()
        var myClone = myBackup.clone()
        $('#header').parent().append(myClone)
    });
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
          if ($(item).text().charAt(0).toLowerCase() == key.toLowerCase()) {
            if (!foundLi) {
              $(".dropdown-menu li.active").removeClass("active")
              $(item).addClass("active")
              that.find(".dropdown-menu li.active a").focus()
              foundLi = true
            }
          }
        });
      })

      $('.country_dropdown_menu li').click(function (event) {
        $('ul.dropdown-menu li.selected').removeClass('selected')
        $(this).addClass('selected')
        var selText = $(this).text().replace(/\w\S*/g, function (txt) {
          return txt.charAt(0).toUpperCase() + (txt.indexOf(".") > -1 ? txt.substr(1).toUpperCase() : txt.substr(1).toLowerCase())
        })
        $(this).parents('#country_code_dropdown').find('.dropdown-toggle').html(selText + ' <span class="caret country_dropdown_caret"></span>');
        $('#sign_up_country_selected').val('selText')
        $("#sign_up_form").validate().element("#sign_up_country_selected");
      })
    })

    $("#sign_in_form").validate({
      errorClass: "sign_up_form_invalid",
      validClass: "sign_up_form_valid",
      rules: {
        email_sign_in: {
          valid_email: true,
          required: true
        },
        pass_sign_in: {
          required: true
        }
      }
    });

    $("#sign_up_form").validate({
      errorClass: "sign_up_form_invalid",
      validClass: "sign_up_form_valid",
      ignore: [],
      rules: {
        email_sign_up: {
          valid_email: true,
          required: true
        },
        user_sign_up: {
          required: true,
          regex: '^([a-zA-Z0-9_-]){6,24}$'
        },
        pass_sign_up: {
          required: true,
          regex: "^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$"
        },
        pass_confirm_sign_up: {
          required: true,
          equalTo: '#pass_sign_up'
        },
        date_picker_sign_up: {
          required: true
        },
        sign_up_country_selected: {
          listMustHaveValue: true
        }
      },
      messages: {
        pass_sign_up: {
          regex: "Password must have minimum 8 characters with at least one uppercase, one number and one special character."
        },
        pass_confirm_sign_up: {
          equalTo: 'The passwords do not match, please try again.'
        },
        user_sign_up: {
          regex: 'Username can only contain letters and numbers. Minimum size: 6 characters. Maximum size: 24 characters'
        }
      }
    });

    $("#resetPasswordForm").validate({
      errorClass: "sign_up_form_invalid",
      validClass: "sign_up_form_valid",
      rules: {
        resetPassEmail: {
          valid_email: true,
          required: true
        }
      }
    });

    $("#change_password_form").validate({
      errorClass: "sign_up_form_invalid",
      validClass: "sign_up_form_valid",
      rules: {
        email_change_pass: {
          valid_email: true,
          required: true
        },
        old_pass_change_pass: {
          required: true
        },
        new_pass_change_pass: {
          required: true,
          regex: "^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$"
        },
        confirm_new_pass_change_pass: {
          required: true,
          equalTo: '#new_pass_change_pass'
        }
      },
      messages: {
        new_pass_change_pass: {
          regex: "Password must have minimum 8 characters with at least one uppercase, one number and one special character."
        },
        confirm_new_pass_change_pass: {
          equalTo: 'The passwords do not match, please try again.'
        }
      }
    });

    $.validator.addMethod("valid_email", function (value, element) {
      return this.optional(element) || (/^[a-z0-9]+([-._][a-z0-9]+)*@([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,4}$/.test(value) && /^(?=.{1,64}@.{4,64}$)(?=.{6,100}$).*/.test(value));
    }, 'Please enter a valid email address.');
    $.validator.addMethod(
      "regex",
      function (value, element, regexp) {
        var re = new RegExp(regexp);
        return this.optional(element) || re.test(value);
      },
      "Incorrect format; Please check your input."
    );
    $.validator.addMethod(
      "listMustHaveValue",
      function (value, element) {
        var liselected = $('.country_dropdown_menu .selected')
        if (liselected.length < 1)
          $('#country_dropdown').addClass('sign_up_form_invalid')
        else
          $('#country_dropdown').removeClass('sign_up_form_invalid')
        return liselected.length > 0
      },
      "Please select a country."
    );
  }
  return CommonHeaderView;

});
