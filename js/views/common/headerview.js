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
      'submit #changePasswordForm': 'changePassword',
      'submit #signUpForm': 'signUp',
      'click #closeSignUpModalResponseButton': 'closeSignUpModal'
    },
    closeSignUpModal: function (event) {
      $('#signUpModal').modal('toggle')
    },
    emptyFormData: function (formId) {
      $(formId).find("input").not(':input[type=submit]').val("")
    },
    signUp: function (event) {
      resetServerErrorResponse('#submitButtonSignUpLabel')
      event.preventDefault()
      var that = this
      var signUpDetails = {}
      signUpDetails.email = $('#emailSignUp').val()
      signUpDetails.username = $('#userSignUp').val()
      signUpDetails.password = $('#passSignUp').val()
      signUpDetails.country = $('ul.dropdown-menu li.selected a').attr('code')
      var dateElements = $('#datePickerSignUp').val().split('/')
      if (dateElements && dateElements.length)
        signUpDetails.birthDate = dateElements.reverse().join('/')

      ws.signUp(signUpDetails, function (resp) {
        that.scrollSignUpFormTop()
        $('#country_dropdown').html('Select a Country <span class="caret country_dropdown_caret"></span>')
        $('ul.dropdown-menu li.selected').removeClass('selected')
        $('#signUpModalResponseLabel').text('Thank you for registering! A confirmation email was sent to ' + signUpDetails.email)
        $('.sign_up_radio').prop('checked', false)
        $('.sign_up_modal_response_container').addClass('sign_up_tabs_rotate_zero')
        that.emptyFormData('#signUpForm')
      }, function (resp) {
        if (resp.status === 409)
          $('#submitButtonSignUpLabel').text('An account with this email already exists')
        else
          $('#submitButtonSignUpLabel').text('Bad request')
      })
    },
    signIn: function (event) {
      event.preventDefault()
      var signInDetails = {}
      signInDetails.email = $('#email_sign_in').val()
      signInDetails.password = $('#pass_sign_in').val()
      ws.signIn(signInDetails, function (resp) {
        debugger
      }, function (resp) {
        debugger
      })
    },
    resetPassword: function (event) {
      event.preventDefault()
      var that = this
      var resetPassDetails = {}
      resetPassDetails.email = $('#resetPassEmail').val()
      ws.resetPassword(resetPassDetails, function (resp) {
        $('#signUpModalResponseLabel').text('A password reset confirmation email was sent to ' + resetPassDetails.email)
        $('.reset_password_form_container').removeClass("sign_up_tabs_rotate_zero")
        $('.sign_up_modal_response_container').addClass('sign_up_tabs_rotate_zero')
        that.emptyFormData('#resetPasswordForm')
      })
    },
    changePassword: function (event) {
      event.preventDefault()
      resetServerErrorResponse('#submitButtonChangePasswordLabel')
      var that = this
      var changePassDetails = {}
      changePassDetails.email = $('#changePassEmail').val()
      changePassDetails.password = $('#oldChangePassEmail').val()
      changePassDetails.newPassword = $('#newChangePassEmail').val()
      ws.changePassword(changePassDetails, function (resp) {
        $('#signUpModalResponseLabel').text('Password has been successfully changed.')
        $('.change_password_form_container').removeClass("sign_up_tabs_rotate_zero")
        $('.sign_up_modal_response_container').addClass('sign_up_tabs_rotate_zero')
        that.emptyFormData('#changePasswordForm')
      }, function (resp) {
        $('#submitButtonChangePasswordLabel').text(resp.statusText ? resp.statusText : 'Invalid credentials.')
      })
    },
    restoreResponseTab: function (event) {
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
      this.restoreResponseTab()
      $('.change_password_form_container').addClass("sign_up_tabs_rotate_zero")
      $('#changePasswordForm').validate().resetForm()
    },
    showSignInTab: function () {
      this.scrollSignUpFormTop()
      this.removeOverflowFromSignUpModal()
      this.hideResetOrChangePasswordTab()
      $('#sign_in_form').validate().resetForm()
    },
    showSignUpTab: function () {
      resetServerErrorResponse('#submitButtonSignUpLabel')
      
      this.addOverflowToSignUpModal()
      this.hideResetOrChangePasswordTab()
      $('#signUpForm').validate().resetForm()
      $('#country_dropdown').removeClass('sign_up_form_invalid')
    },
    hideResetOrChangePasswordTab: function () {
      this.restoreResponseTab()
      this.scrollSignUpFormTop()
      resetServerErrorResponse('#submitButtonChangePasswordLabel')
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

  function resetServerErrorResponse(id) {
    $(id).text('')
  }

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
        $("#signUpForm").validate().element("#sign_up_country_selected");
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

    $("#signUpForm").validate({
      errorClass: "sign_up_form_invalid",
      validClass: "sign_up_form_valid",
      ignore: [],
      rules: {
        emailSignUp: {
          valid_email: true,
          required: true
        },
        userSignUp: {
          required: true,
          regex: '^([a-zA-Z0-9_-]){6,24}$'
        },
        passSignUp: {
          required: true,
          regex: "^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$"
        },
        passConfirmSignUp: {
          required: true,
          equalTo: '#passSignUp'
        },
        datePickerSignUp: {
          required: true,
          dateInThePast: true
        },
        sign_up_country_selected: {
          listMustHaveValue: true
        }
      },
      messages: {
        passSignUp: {
          regex: "Password must have minimum 8 characters with at least one uppercase, one number and one special character."
        },
        passConfirmSignUp: {
          equalTo: 'The passwords do not match, please try again.'
        },
        userSignUp: {
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

    $("#changePasswordForm").validate({
      errorClass: "sign_up_form_invalid",
      validClass: "sign_up_form_valid",
      rules: {
        changePassEmail: {
          valid_email: true,
          required: true
        },
        oldChangePassEmail: {
          required: true
        },
        newChangePassEmail: {
          required: true,
          regex: "^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$",
          notEqual: '#oldChangePassEmail'
        },
        confirmNewChangePassEmail: {
          required: true,
          equalTo: '#newChangePassEmail'
        }
      },
      messages: {
        newChangePassEmail: {
          regex: "Password must have minimum 8 characters with at least one uppercase, one number and one special character.",
          notEqual: "New password must be different than old password"
        },
        confirmNewChangePassEmail: {
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
      "dateInThePast",
      function (value, element) {
        var dateElements = value.split('/')
        return new Date(dateElements[2], dateElements[1] - 1, dateElements[0]) < new Date();
      },
      "Selected date must be in the past."
    );

    $.validator.addMethod("notEqual", function (value, element, param) {
      return this.optional(element) || value != $(param).val();
    }, "This has to be different...");

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
