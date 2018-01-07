/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2012-2022',
  "text!../../../templates/common/headerview.html",
  "common",
  "ws",
  "chatHandler",
  "photoswipe",
  "photoswipeUi"
], function ($, _, Backbone, moment, commonHeaderTemplate, common, ws, chatHandler, photoswipe, photoswipeUi) {
  "use strict";
  
  var CommonHeaderView = Backbone.View.extend({
    initialize: function(options){
      $(document).click(function (event) {
        if ( $(event.target).closest('.header_user_management_dropdown').length === 0 ) {
          $('.header_user_management_dropdown').hide()
        }
      })
      if(options && options.vent)
        this.vent = options.vent
      _.bindAll(this, "createEvent");
    },
    events: {
      'click #goToMyEvents': 'goToMyEvents',
      'click .header_btn': 'showSideMenu',
      'click #createEventButton': 'showCreateEventModal',
      'click #changeEventBgButton': 'showEventBgGalleryModal',
      'click #randomEventButton': _.throttle(function(){this.getRandomEvent()}, 1000, {trailing: false}),
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
      'click #closeChangePasswordModalResponseButton': 'closeChangePasswordModal'
    },
    // === Create event modal call from common.js ===
    showCreateEventModal: function () {
      var that = this
      $('.create_event_title').text('Create Event')
      $('#submitButtonCreateEvent').attr('value', 'create event')
      common.showCreateEventModal(function(){
        that.createEvent()
      })
    },
    createEvent: function(){
      resetServerErrorResponse('#createEventAlertDiv')
      event.preventDefault()
      var that = this
      var createEventDetails = {}
      createEventDetails.name = $('#createEventName').val()
      createEventDetails.location = $('#createEventLocation').val()
      createEventDetails.locationMagicKey = common.getLocationMagicKey()
      
      if(!createEventDetails.backgroundImage)
        createEventDetails.backgroundImage = "1"
      
      createEventDetails.description = $('#createEventDescription').val()
      
      if($('#isLocalCheckbox').prop('checked')){
        createEventDetails.isLocal = 1
        createEventDetails.eventStartDate = moment.utc(new Date($('#datePickerEventStartDate').val())).format("YYYY/MM/DD HH:mm")
        createEventDetails.eventEndDate = moment.utc(new Date($('#datePickerEventEndDate').val())).format("YYYY/MM/DD HH:mm")
      } else {
        createEventDetails.isLocal = 0
        createEventDetails.eventStartDate = $('#datePickerEventStartDate').val()
        createEventDetails.eventEndDate = $('#datePickerEventEndDate').val()
      }
      createEventDetails.jwtToken = ws.getAccessToken()
      
      createEventDetails.countryCode = common.getLocationCountryCode()
      
      this.createEventCallback(createEventDetails)
    },
    createEventCallback: function(createEventDetails){
      var self = this
      var v = grecaptcha.getResponse(recaptchaCreateEventClientId);
      if(v.length == 0)
      {          
          $('#createEventAlertDiv').removeClass('display_none')
          $('#submitButtonCreateEventLabel').text("You can't leave Captcha Code empty")
          grecaptcha.reset(recaptchaCreateEventClientId)
      } else {
        createEventDetails.recaptchaCode = v
        ws.createEvent(createEventDetails, function (resp) {
          $('#isLocalCheckbox').prop('checked', true)
          self.emptyFormData('#createEventForm')
          $('#createEventModal').modal('toggle')
          if(self.vent)
            self.vent.trigger("createEventRender");
        }, function (resp) {
          grecaptcha.reset(recaptchaCreateEventClientId)
          var responseText
          try { 
            responseText = JSON.parse(resp.responseText)
          }
          catch(err) {

          }
          $('#createEventAlertDiv').removeClass('display_none')
          if (resp.status === 409)
            $('#submitButtonCreateEventLabel').text(responseText && responseText.msg ? responseText.msg : 'Event with this name already exists on this account')
          else
            $('#submitButtonCreateEventLabel').text('Bad request')
        })
      }
    },
    // === End of create event modal logic ===
    
    // === Start of event background gallery modal logic ===
    showEventBgGalleryModal: function () {
      $('#addEventBgModal').modal('show')
      $('.modal-backdrop').last()[0].remove()
      addPhotoSwipeListener();
    },
    // === End of event background gallery modal logic ===

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
      signUpDetails.country = $('ul#country_dropdown_menu li.selected a').attr('code')
      signUpDetails.birthDate = $('#datePickerSignUp').val()
      
      var v = grecaptcha.getResponse(recaptchaSignInClientId);
      if(v.length == 0)
      {          
          $('#signUpAlertDiv').removeClass('display_none')
          $('#submitButtonSignUpLabel').text("You can't leave Captcha Code empty")
          grecaptcha.reset(recaptchaSignInClientId)
      } else {
        signUpDetails.recaptchaCode = v
        ws.signUp(signUpDetails, function (resp) {
          that.scrollSignUpFormTop()
          $('#country_dropdown').html('Select a Country <span class="caret country_dropdown_caret"></span>')
          $('ul#country_dropdown_menu li.selected').removeClass('selected')
          $('#signUpModalResponseLabel').text('Thank you for registering! Confirmation sent to: ')
          $('#signUpModalResponseEmailSpan').html(signUpDetails.email)
          $('.sign_up_radio').prop('checked', false)
          $('.sign_up_modal_response_container').addClass('sign_up_tabs_rotate_zero')          
          that.emptyFormData('#signUpForm')
        }, function (resp) {
          var responseText
          grecaptcha.reset(recaptchaSignInClientId)
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
              try {
                localStorage.setItem('eventSnitchAccessToken', parsedResp.resp.jwt)
                localStorage.setItem('eventSnitchLoggedUser', parsedResp.resp.username)
              } catch (e) {
                ws.alertIncognito()
              }
            } else {
              try {
                sessionStorage.setItem('eventSnitchAccessToken', parsedResp.resp.jwt)
                sessionStorage.setItem('eventSnitchLoggedUser', parsedResp.resp.username)
              } catch (e) {
                ws.alertIncognito()
              } 
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
      grecaptcha.reset(recaptchaSignInClientId)
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
      resetServerErrorResponse('#changePasswordAlertDiv')
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
        $('#changePasswordAlertDiv').removeClass('display_none')
        $('#submitButtonChangePasswordLabel').text('Invalid credentials')
      })
    },
    scrollChangePasswordTop: function () {
      if (window.innerWidth > 1024) {
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

        if($('.header_user_management_dropdown').is(':visible')) {
          $('html').animate({
            scrollTop: '0'
          })
          var isChatExpanded = $('#collapseOne').is(':visible')
          if(isChatExpanded)
            chatHandler.openCloseChat()
        }
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
      $('.black_overlay_side_menu').bind('touchmove.blackOverlayScroll', function(e){
        e.preventDefault()
      })
      var y = 0, x=0;

      $('#side_menu').bind('touchmove.sideMenuScroll', function(e){
        if(($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) && y > e.originalEvent.touches[0].pageY) {
          e.preventDefault()
        }
        if(x - e.originalEvent.touches[0].pageX > 100){
          //close side menu from sidemenu.js
          $('#side_menu').css('margin-left', '-100%')
          $('.black_overlay_side_menu').remove()
          $('.black_overlay_side_menu').unbind('.blackOverlayScroll')
          $('#side_menu').unbind('.sideMenuScroll')
          $('#side_menu').unbind('.sideMenuScrollStart')
        }
      })
      $('#side_menu').bind('touchstart.sideMenuScrollStart', function(e){
        y = e.originalEvent.touches[0].pageY;
        x = e.originalEvent.touches[0].pageX;
      })
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
        loggedIn = false
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
        
        if($(window).width() <= 1024) {
          $('#header').on('touchmove', function(e){
            e.preventDefault()         
          })
        }
        require(['recaptcha'], function(recaptcha) {})
      })
      return this;
    }
  });

  function resetServerErrorResponse(id) {
    $(id).addClass('display_none')
  }
  
  function addPhotoSwipeListener() {
    var initPhotoSwipeFromDOM = function(gallerySelector) {
      // parse slide data (url, title, size ...) from DOM elements 
      // (children of gallerySelector)
      var parseThumbnailElements = function(el) {
      var thumbElements = el.childNodes,
        numNodes = thumbElements.length,
        items = [],
        figureEl,
        linkEl,
        size,
        item;
        
        for(var i = 0; i < numNodes; i++) {
          figureEl = thumbElements[i]; // <figure> element
          // include only element nodes 
          if(figureEl.nodeType !== 1) {
            continue;
          }

          linkEl = figureEl.children[0]; // <a> element
          size = linkEl.getAttribute('data-size').split('x');

          // create slide object
          item = {
            src: linkEl.getAttribute('href'),
            w: parseInt(size[0], 10),
            h: parseInt(size[1], 10)
          };

          if(figureEl.children.length > 1) {
            // <figcaption> content
            item.title = figureEl.children[1].innerHTML; 
          }

          if(linkEl.children.length > 0) {
            // <img> thumbnail element, retrieving thumbnail url
            item.msrc = linkEl.children[0].getAttribute('src');
          } 

          item.el = figureEl; // save link to element for getThumbBoundsFn
          items.push(item);
        }

        return items;
      };

      // find nearest parent element
      var closest = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
      };

      // triggers when user clicks on thumbnail
      var onThumbnailsClick = function(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var eTarget = e.target || e.srcElement;

        // find root element of slide
        var clickedListItem = closest(eTarget, function(el) {
          return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });

        if(!clickedListItem) {
          return;
        }

        // find index of clicked item by looping through all child nodes
        // alternatively, you may define index via data- attribute
        var clickedGallery = clickedListItem.parentNode,
            childNodes = clickedListItem.parentNode.childNodes,
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index;

        for (var i = 0; i < numChildNodes; i++) {
          if(childNodes[i].nodeType !== 1) { 
            continue; 
          }

          if(childNodes[i] === clickedListItem) {
            index = nodeIndex;
            break;
          }
          nodeIndex++;
        }

        if(index >= 0) {
          // open PhotoSwipe if valid index found
          openPhotoSwipe( index, clickedGallery );
        }
        return false;
      };

      // parse picture index and gallery index from URL (#&pid=1&gid=2)
      var photoswipeParseHash = function() {
        var hash = window.location.hash.substring(1),
        params = {};

        if(hash.length < 5) {
          return params;
        }

        var vars = hash.split('&');
        for (var i = 0; i < vars.length; i++) {
          if(!vars[i]) {
            continue;
          }
          var pair = vars[i].split('=');  
          if(pair.length < 2) {
            continue;
          }           
          params[pair[0]] = pair[1];
        }

        if(params.gid) {
          params.gid = parseInt(params.gid, 10);
        }

        return params;
      };

      var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
        var pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;

        items = parseThumbnailElements(galleryElement);

        // define options (if needed)
        options = {
          // define gallery index (for URL)
          galleryUID: galleryElement.getAttribute('data-pswp-uid'),
          getThumbBoundsFn: function(index) {
            // See Options -> getThumbBoundsFn section of documentation for more info
            var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                rect = thumbnail.getBoundingClientRect(); 
            return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
          },
          bgOpacity: 1,
          captionEl: false,
          tapToClose: true,
          shareEl: false,
          zoomEl: false,
          fullscreenEl: false,
          history: false
        }

        if(fromURL) {
          if(options.galleryPIDs) {
            for(var j = 0; j < items.length; j++) {
              if(items[j].pid == index) {
                options.index = j;
                break;
              }
            }
          } else {
            // in URL indexes start from 1
            options.index = parseInt(index, 10) - 1;
          }
        } else {
          options.index = parseInt(index, 10);
        }

        // exit if index not found
        if( isNaN(options.index) ) {
            return;
        }

        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new photoswipe( pswpElement, photoswipeUi, items, options);
        gallery.init();
      };

      // loop through all gallery elements and bind events
      var galleryElements = document.querySelectorAll( gallerySelector );

      for(var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i+1);
        galleryElements[i].onclick = onThumbnailsClick;
      }

      // Parse URL and open gallery if it contains #&pid=3&gid=1
      var hashData = photoswipeParseHash();
      if(hashData.pid && hashData.gid) {
          openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
      }
    };

    // execute above function
    initPhotoSwipeFromDOM('#addEventBgModalGallery');
  }

  return CommonHeaderView;

});
