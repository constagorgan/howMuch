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

  var thumbnailsContainerOffset = 0,
      mousedownTimerLeftScroll,
      isTrueLeftScroll = false,
      mousedownTimerRightScroll,
      isTrueRightScroll = false;
  
  var CommonHeaderView = Backbone.View.extend({
    initialize: function(){
      $(document).click(function (event) {
        if ( $(event.target).closest('.header_user_management_dropdown').length === 0 ) {
          $('.header_user_management_dropdown').hide()
        }
      })
    },
    events: {
      'click #goToMyEvents': 'goToMyEvents',
      'click .header_btn': 'showSideMenu',
      'click #createEventButton': 'showCreateEventModal',
      'click #randomEventButton': 'getRandomEvent',
      'click #allTheTimersButton': 'goToMainPage',
      'click #signOutButton': 'signOut',
      'click #changePasswordButton': 'changePasswordShow',
      'click #reset_password_tab': 'showResetTab',
      'click #sign_in_tab': 'showSignInTab',
      'click #sign_up_tab': 'showSignUpTab',
      'submit #sign_in_form': 'signIn',
      'submit #resetPasswordForm': 'resetPassword',
      'submit #changePasswordForm': 'changePassword',
      'submit #signUpForm': 'signUp',
      'click #closeSignUpModalResponseButton': 'closeSignUpModal',
      'click .header_title': 'goToMainPage',
      'click .header_user_management': 'signInSignOut',
      'click #createEventScrollArrowLeftBtn': 'scrollThumbnailsContainerToLeft',
      'click #createEventScrollArrowRightBtn': 'scrollThumbnailsContainerToRight',
      'mousedown #createEventScrollArrowLeftBtn': 'scrollThumbnailsContainerToLeftLong',
      'touchstart #createEventScrollArrowLeftBtn': 'scrollThumbnailsContainerToLeftLong',
      'mousedown #createEventScrollArrowRightBtn': 'scrollThumbnailsContainerToRightLong',
      'touchstart #createEventScrollArrowRightBtn': 'scrollThumbnailsContainerToRightLong',
      'mouseup #createEventScrollArrowLeftBtn': 'revertMousedownVariableLeft',
      'touchend #createEventScrollArrowLeftBtn': 'revertMousedownVariableLeft',
      'mouseup #createEventScrollArrowRightBtn': 'revertMousedownVariableRight',
      'touchend #createEventScrollArrowRightBtn': 'revertMousedownVariableRight',
      'mouseout #createEventScrollArrowLeftBtn': 'revertMousedownVariableLeft',
      'mouseout #createEventScrollArrowRightBtn': 'revertMousedownVariableRight',
//      'keyup #createEventLocation': 'locationSearch',
      'click #closeChangePasswordModalResponseButton': 'closeChangePasswordModal'
    },
    // === Create event modal call from common.js ===
    showCreateEventModal: function () {
      common.showCreateEventModal()
    },
    scrollThumbnailsContainerToLeft: function () {
      if (thumbnailsContainerOffset >= 100) {
        thumbnailsContainerOffset = $('.common_modal__single_line_list').scrollLeft()
        thumbnailsContainerOffset -= 75
        $('.common_modal__single_line_list').animate({
          scrollLeft: thumbnailsContainerOffset
        }, 200);
      }
    },
    scrollThumbnailsContainerToRight: function () {
      if (thumbnailsContainerOffset <= ($('#commonModalSingleLineList')[0].scrollWidth - $('#commonModalThumbnailsContainer').width()))
        thumbnailsContainerOffset = $('.common_modal__single_line_list').scrollLeft()
        thumbnailsContainerOffset += 75
      $('.common_modal__single_line_list').animate({
        scrollLeft: thumbnailsContainerOffset
      }, 200);
    },
    scrollThumbnailsContainerToLeftLong: function () {
      var delay = 500 // How much time you have to keep the left arrow button pressed
      isTrueLeftScroll = true
      mousedownTimerLeftScroll = setTimeout(function () {
        if(mousedownTimerLeftScroll) {
          clearTimeout(mousedownTimerLeftScroll)
        }
        if (isTrueLeftScroll) {
          isTrueLeftScroll = setInterval(function () {
            thumbnailsContainerOffset = $('.common_modal__single_line_list').scrollLeft()
            thumbnailsContainerOffset -= 20;
            $('.common_modal__single_line_list').scrollLeft(thumbnailsContainerOffset)
          }, 75);
        }
      }, delay)
    },
    scrollThumbnailsContainerToRightLong: function () {
      var delay = 500 // How much time you have to keep the right arrow button pressed
      isTrueRightScroll = true
      mousedownTimerRightScroll = setTimeout(function () {
        if(mousedownTimerRightScroll) {
          clearTimeout(mousedownTimerRightScroll)
        }
        if (isTrueRightScroll) {
          isTrueRightScroll = setInterval(function () {
            thumbnailsContainerOffset = $('.common_modal__single_line_list').scrollLeft()
            thumbnailsContainerOffset += 20;
            $('.common_modal__single_line_list').scrollLeft(thumbnailsContainerOffset)
          }, 75);
        }
      }, delay)
    },
    revertMousedownVariableLeft: function () {
      clearInterval(isTrueLeftScroll)
      isTrueLeftScroll = false
    },
    revertMousedownVariableRight: function () {
      clearInterval(isTrueRightScroll)
      isTrueRightScroll = false
    },
  
    // === End of create event modal logic ===
    // === Start of sign up event modal logic ===
    signOut: function (event) {
      common.signOut()
    },
    closeSignUpModal: function (event) {
      $('#signUpModal').modal('toggle')
    },
    closeChangePasswordModal: function (event) {
      $('#changePasswordModal').modal('toggle')
    },
    emptyFormData: function (formId) {
      $(formId).find("input").not(':input[type=submit]').val("")
    },
    signUp: function (event) {
      resetServerErrorResponse('#signUpAlertDiv')
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
      
      var v = grecaptcha.getResponse(recaptchaClientId);
      if(v.length == 0)
      {
          $('#submitButtonSignUpLabel').text("You can't leave Captcha Code empty")
      } else
      {
        signUpDetails.recaptchaCode = v
        ws.signUp(signUpDetails, function (resp) {
          that.scrollSignUpFormTop()
          $('#country_dropdown').html('Select a Country <span class="caret country_dropdown_caret"></span>')
          $('ul.dropdown-menu li.selected').removeClass('selected')
          $('#signUpModalResponseLabel').text('Thank you for registering! Confirmation sent to: ')
          $('#signUpModalResponseEmailSpan').html(signUpDetails.email)
          $('.sign_up_radio').prop('checked', false)
          $('.sign_up_modal_response_container').addClass('sign_up_tabs_rotate_zero')          
          that.emptyFormData('#signUpForm')
        }, function (resp) {
          var responseText
          grecaptcha.reset(recaptchaClientId)
          try { 
            responseText = JSON.parse(resp.responseText)
          }
          catch(err) {

          }
          $('#signUpAlertDiv').removeClass('display_none')
          if (resp.status === 409)
            $('#submitButtonSignUpLabel').text(responseText && responseText.msg ? responseText.msg : 'An account with this email or username already exists')
          else
            $('#submitButtonSignUpLabel').text('Bad request')
        })
      }
    },
    signIn: function (event) {
      event.preventDefault()
      var that = this
      resetServerErrorResponse('#signInAlertDiv')
      var signInDetails = {}
      signInDetails.email = $('#email_sign_in').val()
      signInDetails.password = $('#pass_sign_in').val()
      ws.signIn(signInDetails, function (resp) {
        try {
          var parsedResp = JSON.parse(resp)
          if (parsedResp.resp && parsedResp.resp.jwt) {
            if ($('#check_remember').prop('checked')) {
              localStorage.setItem('eventSnitchAccessToken', parsedResp.resp.jwt)
              localStorage.setItem('eventSnitchLoggedUser', parsedResp.resp.username)
            } else {
              sessionStorage.setItem('eventSnitchAccessToken', parsedResp.resp.jwt)
              sessionStorage.setItem('eventSnitchLoggedUser', parsedResp.resp.username)
            }
          }
          window.location.reload();
        } catch (err) {

        }
      }, function (resp) {
        $('#submitButtonSignInLabel').text('Invalid credentials')
        $('#signInAlertDiv').removeClass('display_none')
      })
    },
    resetPassword: function (event) {
      event.preventDefault()
      var that = this
      var resetPassDetails = {}
      resetPassDetails.email = $('#resetPassEmail').val()
      ws.resetPassword(resetPassDetails, function (resp) {
        $('#signUpModalResponseLabel').text('Password reset confirmation sent to: ')
        $('#signUpModalResponseEmailSpan').html(resetPassDetails.email)
        $('.reset_password_form_container').removeClass("sign_up_tabs_rotate_zero")
        $('.sign_up_modal_response_container').addClass('sign_up_tabs_rotate_zero')
        that.emptyFormData('#resetPasswordForm')
      })
    },
    showResetTab: function () {
      this.restoreResponseTab()
      this.scrollSignUpFormTop()
      $('.reset_password_form_container').addClass("sign_up_tabs_rotate_zero")
      $('#resetPasswordForm').validate().resetForm()
    },
    showSignInTab: function () {
      this.removeOverflowFromSignUpModal()
      resetServerErrorResponse('#signInAlertDiv')
      this.scrollSignUpFormTop()
      this.hideResetPasswordTab()
      $('#country_dropdown').removeClass('common_modal__error')
      $('#sign_in_form').validate().resetForm()
    },
    showSignUpTab: function () {
      resetServerErrorResponse('#signUpAlertDiv')
      this.addOverflowToSignUpModal()
      this.hideResetPasswordTab()
      $('#signUpForm').validate().resetForm()
      $('#country_dropdown').removeClass('sign_up_form_invalid')
      grecaptcha.reset(recaptchaClientId)
    },
    hideResetPasswordTab: function () {
      this.restoreResponseTab()
      this.scrollSignUpFormTop()
      var resetTab = $('.sign_up_tabs_rotate_zero')
      if (resetTab && resetTab.length) {
        resetTab.removeClass('sign_up_tabs_rotate_zero')
      }
    },
    restoreResponseTab: function (event) {
      $('.sign_up_modal_response_container').removeClass('sign_up_tabs_rotate_zero')
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
    // === End of sign up event modal logic ===
    // === Start of change password event modal logic ===
    changePasswordShow: function (event) {
      $('.header_user_management_dropdown').toggle()
      common.changePassword();
    },
    changePassword: function (event) {
      event.preventDefault()
      resetServerErrorResponse('#submitButtonChangePasswordLabel')
      var that = this
      var changePassDetails = {}
      changePassDetails.email = $('#changePassEmail').val()
      changePassDetails.password = $('#oldChangePassEmail').val()
      changePassDetails.newPassword = $('#newChangePassEmail').val()
      changePassDetails.jwtToken = ws.getAccessToken()
      ws.changePassword(changePassDetails, function (resp) {
        $('#changePasswordModalResponseLabel').text('Password has been successfully changed.')
        $('.change_password_form_container').addClass('common_modal__rotate_hidden')
        $('#changePasswordModalResponse').removeClass('common_modal__rotate_hidden').addClass('common_modal__rotate_show')
        that.emptyFormData('#changePasswordForm')
        that.scrollChangePasswordTop()
      }, function (resp) {
        that.scrollChangePasswordTop()
        $('#submitButtonChangePasswordLabel').text('Invalid credentials')
      })
    },
    scrollChangePasswordTop: function () {
      if (window.innerWidth > 768) {
        $('#changePasswordContent').animate({
          scrollTop: 0
        }, 200)
      } else {
        $('#changePasswordModal').animate({
          scrollTop: 0
        }, 200)
      }
    },
    // === End of change password event modal logic ===
    signInSignOut: function (event) {
      if (!ws.getAccessToken()) {
        common.signIn()
      } else {
        event.stopImmediatePropagation()
        $('.header_user_management_dropdown').toggle()
      }
    },
    goToMainPage: function () {
      common.goToMainPage()
    },
    getRandomEvent: function () {
      common.getRandomEvent()
    },
    showSideMenu: function () {
      $('#side_menu').css('margin-left', '0')
      $('#main').append('<div class="black_overlay_side_menu"></div>')
    },
    goToMyEvents: function() {
      common.goToMyEvents()
    },
    render: function () {
      $('.dots_bg_body_lower').addClass('display_none')
      var that = this
      var loggedIn = false
      var loggedUser;
      try {
        if (localStorage.getItem('eventSnitchAccessToken')) {
          loggedIn = true
          loggedUser = localStorage.getItem('eventSnitchLoggedUser')
        } else if (sessionStorage.getItem('eventSnitchAccessToken')) {
          loggedIn = true
          loggedUser = sessionStorage.getItem('eventSnitchLoggedUser')
        }
      } catch (err){
        alert('This browser does not support Event Snitch in incognito mode.')
      }
      var templateDummy = _.template('<div class="dots_bg dots_bg_header"></div><div id="header" class="header"></div>');
      this.$el.html(templateDummy({}));
      
      ws.getCountriesList(function (countries) {
        var template = _.template(commonHeaderTemplate);
        var headerViewTemplateObject = {
          response: countries,
          loggedIn: loggedIn
        }
        if (loggedUser)
          headerViewTemplateObject.loggedUser = loggedUser
        that.$el.html(template(headerViewTemplateObject))
        require(['recaptcha'], function(recaptcha) {})
      })
      return this;
    }
  });

  function resetServerErrorResponse(id) {
    $(id).addClass('display_none')
  }

  return CommonHeaderView;

});
