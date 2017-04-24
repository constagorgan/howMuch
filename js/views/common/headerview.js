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
      'click #signOutButton': 'signOut',
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
    signOut: function(event){
      common.signOut()
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
      var that = this
      resetServerErrorResponse('#submitButtonSignInLabel')
      var signInDetails = {}
      signInDetails.email = $('#email_sign_in').val()
      signInDetails.password = $('#pass_sign_in').val()
      ws.signIn(signInDetails, function (resp) {
        try {
          var parsedResp = JSON.parse(resp)
          if (parsedResp.resp && parsedResp.resp.jwt) {
            if ($('#check_remember').prop('checked')) {
              localStorage.setItem('eventSnitchAccessToken', parsedResp.resp.jwt)
            } else {
              sessionStorage.setItem('eventSnitchAccessToken', parsedResp.resp.jwt)
            }
          }
          window.location.reload();
        } catch (err) {

        }
      }, function (resp) {
        $('#submitButtonSignInLabel').text('Invalid credentials.')
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
      common.signIn()
      if(window.innerWidth > 768)
        this.removeOverflowFromSignUpModal()
    },
    showResetTab: function () {
      this.restoreResponseTab()
      this.removeOverflowFromSignUpModal()
      this.scrollSignUpFormTop()
      $('.reset_password_form_container').addClass("sign_up_tabs_rotate_zero")
      $('#resetPasswordForm').validate().resetForm()
    },
    showChangePasswordTab: function () {
      this.restoreResponseTab()
      this.addOverflowToSignUpModal()
      this.scrollSignUpFormTop()
      $('.change_password_form_container').addClass("sign_up_tabs_rotate_zero")
      $('#changePasswordForm').validate().resetForm()
    },
    showSignInTab: function () {
      if(window.innerWidth > 768)
        this.removeOverflowFromSignUpModal()
      else 
        this.addOverflowToSignUpModal()
      resetServerErrorResponse('#submitButtonSignInLabel')
      this.scrollSignUpFormTop()
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
      var loggedIn = false
       if(localStorage.getItem('eventSnitchAccessToken'))
          loggedIn = true
        else if(sessionStorage.getItem('eventSnitchAccessToken'))
          loggedIn = true
      ws.getCountriesList(function (countries) {
        var template = _.template(commonHeaderTemplate);
        that.$el.html(template({
          response: countries,
          loggedIn: loggedIn
        }));
      })
      return this;
    }
  });

  function resetServerErrorResponse(id) {
    $(id).text('')
  }

  return CommonHeaderView;

});
