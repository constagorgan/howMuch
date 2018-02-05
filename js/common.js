/*global define, console, alert */
/*jslint nomen: true */
define([
  "jquery",
  "underscore",
  "backbone",
  "bootstrap-datepicker",
  "ws",
  '../bower_components/moment-timezone/builds/moment-timezone-with-data-2012-2022',
  "bootstrap-datetimepicker",
  '../Content/resources/resources',
  'jquery-validation'
], function ($, _, Backbone, bootstrapDatePicker, ws, moment, bootstrapDateTimePicker, Resources, jQueryValidator) {
  "use strict";
  
  var passwordValidationMessage = "Password must have minimum 8 characters with at least one letter and one number."
  var unmatchingPasswordsMessage = 'The passwords do not match, please try again.'
  var usernameValidationMessage = 'Username can only contain letters, numbers, underscores and hyphens. Min size: 6 characters. Max size: 24 characters.'
  
  var setOverlayDiv = function () {
    var overlayDiv = $('.black_overlay_search_input');
    if (!overlayDiv || !overlayDiv.length) {
      $('#main').append('<div class="black_overlay_search_input"></div>')
    }
  }
  var removeOverlayDiv = function () {
    $('.black_overlay_search_input').remove();
  }
  
  var locationMagicKey = ""
  var locationName = ""
  var locationCountryCode = ""
  
  var encodeEntities = (function() {
    var element = document.createElement('div')
    
    function encodeHTMLEntities(str) {
      return $(element).text(str).html()
    }
    
    return encodeHTMLEntities
  })()
  var decodeEntities = (function() {
    var element = document.createElement('div')

    function decodeHTMLEntities (str) {
      if(str && typeof str === 'string') {
        // strip script/html tags
        str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '')
        str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '')
        element.innerHTML = str
        str = element.textContent
        element.textContent = ''
      }

      return str
    }

    return decodeHTMLEntities
  })()
  
  
  function showErrors(that, errorMap, errorList, id) {
    $.each(that.validElements(), function (index, element) {
        var $element = $(element);
        $element.removeClass('common_modal__error')
        $element.siblings('span').addClass('display_none').data("title", "") 
          .removeClass("error")
          .tooltip("hide");
      });
      // Create new tooltips for invalid elements
      $.each(errorList, function (index, error) {
        var $element = $(error.element);

        $element.addClass('common_modal__error')
        $element.siblings('span').removeClass('display_none')
        .attr('title', error.message)
        .tooltip('fixTitle')
        .addClass("error");
        
        if(id) {
          $('#' + id).addClass('display_none')
        }
      });
  }
  
  function addModalHandler(modalId, recaptchaRenderer) {
    var myBackup = $('#' + modalId).clone();
    $('#' + modalId).on('hidden.bs.modal', function () {
      $('#' + modalId).remove()
      var myClone = myBackup.clone()
      $('#header').parent().append(myClone)
      try {
        grecaptcha.reset()
      } catch (e){
        
      }
      var recaptchaId
      if(modalId == "editUserModal") {
        recaptchaId = 'g-recaptcha-edit-user'
      } else {
        recaptchaId = 'g-recaptcha'
      }
      $('#' + recaptchaId).empty()
      window[recaptchaRenderer](recaptchaId)
      $('.modal-backdrop').remove()
    })
  }
  
  function addCountriesDropdownHandler(modalId, modalType, inputId, datePickerId) {
    $("#country_code_dropdown_" + modalType).keydown(function(e) {  
      var code = (e.keyCode ? e.keyCode : e.which);
      if (code == 9) {
        e.stopImmediatePropagation()
        $("#country_dropdown_" + modalType).click();
      }
    })
    $('#country_code_dropdown_' + modalType).keyup(_.debounce(function (e) {
        var key = String.fromCharCode(e.which);
        var foundLi = false
        var firstFound = null
        $("#country_code_dropdown_" + modalType).find("li").each(function (idx, item) {
          if (getStringFirstCharacterWithoutWhiteSpace($(item).text()) === key.toLowerCase()) {
            if(!firstFound)
              firstFound = $(item)
            if (!foundLi) {
              if(getStringFirstCharacterWithoutWhiteSpace($("#country_dropdown_menu_" + modalType + " li.active").text()) !== key.toLowerCase()){    
                $("#country_dropdown_menu_" + modalType + " li.active").removeClass("active")  
                $(item).addClass("active")  
                foundLi = true     
                $("#country_code_dropdown_" + modalType).find("#country_dropdown_menu_" + modalType + " li.active a").focus()         
              } else {
                if(getStringFirstCharacterWithoutWhiteSpace($("#country_dropdown_menu_" + modalType + " li.active").next().text()) === key.toLowerCase()){
                  $("#country_dropdown_menu_" + modalType + " li.active").next().addClass("active").prev().removeClass("active") 
                } else {                
                  $("#country_dropdown_menu_" + modalType + " li.active").removeClass("active")  
                  firstFound.addClass('active')
                }
                foundLi = true
                $("#country_code_dropdown_" + modalType).find("#country_dropdown_menu_" + modalType + " li.active a").focus()
              } 
            }
          }
        });
      }, 100, true))
          
    $("#country_code_dropdown_" + modalType + '.dropup.focus-active').on('shown.bs.dropdown', function (event) {
      if (!$('ul#country_dropdown_menu_' + modalType + ' li.selected') || !$('ul#country_dropdown_menu_' + modalType + ' li.selected').length) {
        $('ul#country_dropdown_menu_' + modalType + ' li:first').addClass('active')
        $('ul#country_dropdown_menu_' + modalType + ' li:first').focus()
      } else {
        $('ul#country_dropdown_menu_' + modalType + ' li.active').removeClass('active')
        $('ul#country_dropdown_menu_' + modalType + ' li.selected').addClass('active')
        $('ul#country_dropdown_menu_' + modalType + ' li.selected').focus()
      }
      event.preventDefault()
      event.stopImmediatePropagation()
      var that = $(this);
      $(this).find("#country_dropdown_menu_" + modalType + " li.active a").focus()

      $('ul#country_dropdown_menu_' + modalType + '.country_dropdown_menu li').click(function (event) {
        event.preventDefault()
        event.stopImmediatePropagation()
        $('ul#country_dropdown_menu_' + modalType + ' li.selected').removeClass('selected')
        $(this).addClass('selected')
        var selText = $(this).text().replace(/\w\S*/g, function (txt) {
          return txt.charAt(0).toUpperCase() + (txt.indexOf(".") > -1 ? txt.substr(1).toUpperCase() : txt.substr(1).toLowerCase())
        })
        $(this).parents('#country_code_dropdown_' + modalType).find('.dropdown-toggle').html(selText + ' <span class="caret country_dropdown_caret"></span>');
        $('#' + inputId).val('selText')
        $("#" + modalId).validate().element("#" + inputId);
        $(this.parentElement.parentElement).removeClass('open')
        return false
      })
    })
  }
  
  function addChangePasswordModalHandlers() {
    var myBackup = $('#changePasswordModal').clone();
    $('#changePasswordModal').on('hidden.bs.modal', function () {
      $('#changePasswordModal').remove()
      var myClone = myBackup.clone()
      $('#header').parent().append(myClone)
      $('.modal-backdrop').remove()
    });

    $("#changePasswordForm").validate({
      showErrors: function (errorMap, errorList) {
        showErrors(this, errorMap, errorList, 'changePasswordAlertDiv')
      },
      rules: {
        email_sign_in: {
          valid_email: true,
          required: true
        },
        oldChangePassEmail: {
          required: true
        },
        newChangePassEmail: {
          required: true,
          regex: "^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$",
          notEqual: '#oldChangePassEmail'
        },
        confirmNewChangePassEmail: {
          required: true,
          equalTo: '#newChangePassEmail'
        }
      },
      messages: {
        newChangePassEmail: {
          regex: passwordValidationMessage,
          notEqual: "New password must be different than old password."
        },
        confirmNewChangePassEmail: {
          equalTo: unmatchingPasswordsMessage
        }
      }
    });
  }
  
  function addCreateEventModalHandlers(cb){
    var myBackup = $('#createEventModal').clone();
    
    $('#createEventModal').on('hidden.bs.modal', function () {
      $('#createEventModal').remove()
      var myClone = myBackup.clone()
      $('#header').parent().append(myClone)
      grecaptcha.reset()
      $('#g-recaptcha-create').empty()
      window.renderCreateEventRecaptcha('g-recaptcha-create')
      $('.modal-backdrop').remove()
      $('.common_modal__bg_picker_media').css({
        'background': 'url(../Content/img/background/' + $(".selected_background_image").attr('data-image-id') + '_medium.jpg) no-repeat center',
        'background-size': 'cover'
      })
    });
    
    $("#createEventForm").validate({
      submitHandler: function(){
        cb()
      },
      showErrors: function (errorMap, errorList) {
        showErrors(this, errorMap, errorList, 'createEventAlertDiv')
      },
      rules: {
        createEventName: {
          required: true,
          regex: '^.{6,80}$',
          noemoji: true
        },
        createEventLocation: {
          required: true,
          locationWasSelected: true
        },
        datePickerEventStartDate: {
          required: true,
          dateInTheFuture: true
        },
        datePickerEventEndDate: {
          required: true,
          dateInTheFuture: true
        },
        createEventDescription: {
          noemoji: true
        }
      },
      messages: {
        createEventName: {
          regex: 'Event name minimum size: 6 characters. Maximum size: 255 characters.',
          noemoji: 'Invalid characters in text.'
        }
      }
    });
  }
  
  function getStringFirstCharacterWithoutWhiteSpace(str) {
    return str.replace(/ /g, "").replace(/(^[ \t]*\n)/gm, "").charAt(0).toLowerCase()
  }
  
  function addContactFormHandlers(elem) {
    elem.validate({      
      showErrors: function (errorMap, errorList) {
        showErrors(this, errorMap, errorList, 'contactAlertDiv')
      },
      errorPlacement: function (error, element) {
        error.insertAfter(element);
      },
      errorClass: "common_modal__error",
      validClass: "common_modal__valid",
      ignore: [],

      rules: {
        nameContact: {
          rangelength: [6, 20],
          required: true
        },
        emailContact: {
          valid_email: true,
          required: true
        },
        phoneContact: {
          required: true,
          regex: "^([0-9.,+() ]){6,20}$"
        },
        messageContact: {
          required: true,
          rangelength: [1, 1500]
        }
      },
      messages: {
        phoneContact: {
          regex: "Between 6 and 20 characters. Insert only digits and the following symbols: ,  .  +  (  )"
        }
      }
    });  
  }
  
  function addSignUpModalHandlers() {
    addModalHandler("signUpModal", "renderSignIn")
    addCountriesDropdownHandler("signUpModal", "sign_up", "sign_up_country_selected", "datePickerSignUp")
    $('#datePickerSignUp').keydown(function(e) {  
      var code = (e.keyCode ? e.keyCode : e.which);
      if (code == 9) {
        e.stopImmediatePropagation()
        $("#country_dropdown_sign_up").click();
      }
    })
    $("#sign_in_form").validate({
      showErrors: function (errorMap, errorList) {
        showErrors(this, errorMap, errorList, 'signInAlertDiv')
      },
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
      showErrors: function (errorMap, errorList) {
        showErrors(this, errorMap, errorList, 'signUpAlertDiv')
      },
      errorPlacement: function (error, element) {
        error.insertAfter(element);
        if (element.hasClass('pw')) {
          element.next().removeClass('passValid').addClass('passError');
        }
      },
      errorClass: "common_modal__error",
      validClass: "common_modal__valid",
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
          regex: "^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$"
        },
        passConfirmSignUp: {
          required: true,
          equalTo: '#passSignUp'
        },
        datePickerSignUp: {
          required: true
        },
        sign_up_country_selected: {
          listMustHaveValue: true
        }
      },
      messages: {
        passSignUp: {
          regex: passwordValidationMessage
        },
        passConfirmSignUp: {
          equalTo: unmatchingPasswordsMessage
        },
        userSignUp: {
          regex: usernameValidationMessage
        }
      }
    });

    $("#resetPasswordForm").validate({
      showErrors: function (errorMap, errorList) {
        showErrors(this, errorMap, errorList)
      },
      rules: {
        email_sign_in: {
          valid_email: true,
          required: true
        }
      }
    });
  }
  
  function addEditUserModalHandlers() {
    addModalHandler("editUserModal", "renderEditUser")
    addCountriesDropdownHandler("editUserModal", "edit_user", "edit_user_country_selected", "datePickerEditUser")
    $('#datePickerEditUser').keydown(function(e) {  
      var code = (e.keyCode ? e.keyCode : e.which);
      if (code == 9) {
        e.stopImmediatePropagation()
        $("#country_dropdown_edit_user").click();
      }
    })
    $("#editUserForm").validate({
      showErrors: function (errorMap, errorList) {
        showErrors(this, errorMap, errorList, 'editUserAlertDiv')
      },
      errorPlacement: function (error, element) {
        error.insertAfter(element);
        if (element.hasClass('pw')) {
          element.next().removeClass('passValid').addClass('passError');
        }
      },
      errorClass: "common_modal__error",
      validClass: "common_modal__valid",
      ignore: [],

      rules: {
        datePickerEditUser: {
          required: true
        },
        edit_user_country_selected: {
          listMustHaveValue: true
        }
      },
      messages: {
        editUserName: {
          regex: usernameValidationMessage
        }
      }
    });
  }
  
  $.validator.addMethod("valid_email", function (value, element) {
    value = value.toLowerCase()
    return this.optional(element) || (/^[a-z0-9]+([-._][a-z0-9]+)*@([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,4}$/.test(value) && /^(?=.{1,164}@.{4,64}$)(?=.{6,229}$).*/.test(value));
  }, 'Please enter a valid email address.');

  $.validator.addMethod(
    "regex",
    function (value, element, regexp) {
      var re = new RegExp(regexp);
      return this.optional(element) || re.test(value);
    },
    "Incorrect format; Please check your input."
  );

  $.validator.addMethod("notEqual", function (value, element, param) {
    return this.optional(element) || value != $(param).val();
  }, "This has to be different...");

  $.validator.addMethod(
    "locationWasSelected",
    function (value, element) {
      var locationSelected = locationMagicKey
      if (locationSelected == "") {
        return false;
      } else {
        return true;
      }
    },
    "Please select a location."
  );
  
  $.validator.addMethod(
    "dateInTheFuture",
    function (value, element) {
      if(new Date(value) >= moment().seconds(0).milliseconds(0).toDate())
        return true;
      else 
        return false;
    },
    "Selected date is in the past."
  );
  
  $.validator.addMethod(
    "noemoji",
    function (value, element) {
      var ranges = [
          '/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g'
      ];
      if (value.match(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g)) {
          return false;
      } else {
          return true;
      }
    },
    "Incorrect format; Please check your input."
  );
  

  
  $.validator.addMethod(
    "listMustHaveValue",
    function (value, element) {
      var dropdownId = '#country_dropdown_sign_up'
      var dropdownNoneSelectedId = '#country_dropdown_sign_up_none_selected_error'

      if(event.target.id === "editUserForm") {
        dropdownId = "#country_dropdown_edit_user"
        dropdownNoneSelectedId = '#country_dropdown_edit_user_none_selected_error'
      }
      var liselected = $('#' + event.target.id + ' .country_dropdown_menu .selected')
      if (liselected.length < 1) {
        $(dropdownId).addClass('common_modal__error')
        $(dropdownId).siblings('span').removeClass('display_none')
          .attr('title', "Please select a country")
          .tooltip('fixTitle')
          .addClass("error");
        $(dropdownNoneSelectedId).off('click').click(function(e){
          e.stopPropagation();
          $(dropdownId).dropdown('toggle');
        })
        $('#' + event.target.id + ' .country_dropdown_caret').addClass('display_none')
      } else {
        $(dropdownId).data("title", "")
          .removeClass("error")
          .tooltip("hide");
        $('#' + event.target.id + ' .country_dropdown_caret').removeClass('display_none')
        $(dropdownId).removeClass('common_modal__error')
      }
      return liselected.length > 0
    },
    "Please select a country."
  );


  function updateTimezoneInfoText(id) {
    var selectedText = $(id + ' option:selected').text()
    $('#utcText').text(selectedText);
    $('#sideMenuTimezoneDisplay').text(selectedText.split(' ')[0])
    $('#sideMenuTimezoneGmt').text(selectedText.split(' ')[1])
  }
  
  return {
    decodeEntities: decodeEntities, 
    encodeEntities: encodeEntities,
    goToMainPage: function () {
      if(Backbone.history.getPath() === '')
        window.location.reload()
      else
        Backbone.history.navigate('', true)
    },
    goToContactPage: function() {
      $('html').scrollTop(0)
      if(Backbone.history.getPath() === 'contact')
        window.location.reload()
      else {
        Backbone.history.navigate('contact', true)
      }
    },
    goToPrivacyPolicy: function() {
      $('html').scrollTop(0)
      if(Backbone.history.getPath() === 'info/privacypolicy')
        Backbone.history.navigate('info/privacypolicy', true)
      else {
        Backbone.history.navigate('info/privacypolicy', true)
      }
    },
    checkUserTimezone: function () {
      try {
        if (localStorage.getItem('userTimezone') == null || !this.isTimezoneCompliant())
          this.storeDefaultUserTimezone()
      } catch (err) {
        if(!window.incognitoAlert) {
          alert('Some issues might occur due to incognito mode.') 
          window.incognitoAlert = true;
        }
      }
    },
    storeDefaultUserTimezone: function () {
      var currentTimezoneName = moment.tz(moment.tz.guess())
      try {
        localStorage.setItem('userTimezone', currentTimezoneName._z.name);
      } catch (e) {
        ws.alertIncognito()
      }
    },

    // Check if the set timezone is correctly named
    isTimezoneCompliant: function () {
      var timezoneExists = _.find(Resources.timezones, function (el) {
        return el === localStorage.getItem('userTimezone')
      })
      if (timezoneExists) {
        return true;
      } else {
        return false;
      }
    },
    getTimezoneDisplay: function (timezone) {
      return timezone._z.name + ' GMT' + timezone.format('Z')
    },
    updateClientTimezone: function (id) {
      updateTimezoneInfoText(id)
      try {
        localStorage.setItem('userTimezone', $(id + ' option:selected').data('timezoneName'))
      } catch (e) {
        ws.alertIncognito()
      }
    },
    addContactFormHandlers: function(elem) {
      addContactFormHandlers(elem)
    },
    signOut: function () {
      try {
        localStorage.setItem('eventSnitchAccessToken', '')
        sessionStorage.setItem('eventSnitchAccessToken', '')
        localStorage.setItem('eventSnitchLoggedUser', '')
        sessionStorage.setItem('eventSnitchLoggedUser', '')
        window.location.reload()
      } catch (e) {
//        ws.alertIncognito()
      }
    },
    signIn: function () {
      $('#signUpModal').modal('show')
      $('.modal-backdrop').appendTo('#header_container')
      this.addDatePicker('datePickerSignUp', 'sign_up_form')
      addSignUpModalHandlers()
    },
    editUserToggle: function (editUserDetails) { 
      this.addDatePicker('datePickerEditUser', 'common_modal__content_container--edit_user')
      try {
        editUserDetails = JSON.parse(editUserDetails)
        if(editUserDetails && editUserDetails.length) {
          if(editUserDetails[0].birthDate) {
            $('#datePickerEditUser').datepicker('update', moment(editUserDetails[0].birthDate).toDate());
          } 
          if(editUserDetails[0].country) {
            $('ul#country_dropdown_menu_edit_user li.selected').removeClass('selected')
            $("#country_code_dropdown_edit_user").find("li").each(function (idx, item) {
              if (item.firstElementChild.getAttribute('code') === editUserDetails[0].country) {
                $(item).addClass('selected')
                var selText = $(item).text().replace(/\w\S*/g, function (txt) {
                  return txt.charAt(0).toUpperCase() + (txt.indexOf(".") > -1 ? txt.substr(1).toUpperCase() : txt.substr(1).toLowerCase())
                })
                $(item).parents('#country_code_dropdown_edit_user').find('.dropdown-toggle').html(selText + ' <span class="caret country_dropdown_caret"></span>');
                $('#edit_user_country_selected').val('selText')
                return false
              }
            })
          }
        }
      } catch(e) {
        
      }
      $('#editUserModal').modal('show')        
      $('.modal-backdrop').appendTo('#header_container')
      addEditUserModalHandlers()
    },
    changePassword: function () {
      $('#changePasswordModal').modal('show')        
      $('.modal-backdrop').appendTo('#header_container')
      addChangePasswordModalHandlers()
    },
    timezoneModal: function () {
      $('#timezoneModal').modal('show')
    },
    scrollToTopOfPage: function () {
      $('body').scrollTop(0);
    },
    addDatePicker: function (id, className) {
      $('#' + id).datepicker({
        container: '.' + className,
        format: 'yyyy/mm/dd',
        autoclose: true,
        endDate: moment().subtract(5, 'year').toDate(),
        startDate: moment('1900/01/01').toDate()
      })
    },
    addSearchBarEvents: function () {
      $("#search-input").keyup(_.debounce(function (e) {
        if ($(this).val().length < 2) {
          removeOverlayDiv()
        }
      }, 300));
      var auto = $("#search-input").autocomplete({
        source: function (request, response) {
          ws.searchEvents(request.term, function (resp) {
            response(_.map(resp, function (e) {
              return {
                id: e.id,
                label: e.name,
                background: e.background,
                eventDate: e.eventDate,
                isLocal: e.isLocal,
                location: e.location,
                creatorUser: e.creatorUser
              };
            }));
            setOverlayDiv();
          }, function (error) {
            console.log('fail')
          });
        },
        minLength: 2,
        delay: 200,
        select: function (event, ui) {
          removeOverlayDiv()
          var url = decodeEntities(ui.item.label)      
          if (url != '#') {
            Backbone.history.navigate('event/' + encodeURIComponent(url) + '/' + ui.item.id, true);
          }
        },
        focus: function(event, ui) {
          $(event.currentTarget).find("li").removeClass('search_input_autocomplete_li_focus')
          $(event.currentTarget).find("li:has(div.ui-state-active)").addClass('search_input_autocomplete_li_focus')
          ui.item.value = decodeEntities(ui.item.value)
        }
      })

      auto.data("ui-autocomplete")._resizeMenu = function () {
        var ul = this.menu.element;
        ul.outerWidth(this.element.outerWidth());
      }

      auto.data("ui-autocomplete")._renderItem = function (ul, item) {
        ul.addClass("homepage_event_category_ul")
        ul.addClass("search_input_autocomplete")
        var listItem = '<div class="li_background_pic" style="background: url(../Content/img/background/' + item.background + '_medium.jpg);"></div>' +
          '<div class="black_overlay position_absolute"></div>' +
          '<div class="homepage_event_category_li_date">' +
          ((item.isLocal && parseInt(item.isLocal)) ? moment(new Date(moment.utc(item.eventDate))).format("D") : moment(item.eventDate).format("D")) +
          '<div class="homepage_event_category_li_date_month">' +
          ((item.isLocal && parseInt(item.isLocal)) ? moment(new Date(moment.utc(item.eventDate))).format("MMM") : moment(item.eventDate).format("MMM")) +
          '</div>' +
          '<div class="homepage_event_category_li_date_year">' +
          ((item.isLocal && parseInt(item.isLocal)) ? moment(new Date(moment.utc(item.eventDate))).format("YYYY") : moment(item.eventDate).format("YYYY")) +
          '</div>' +
          '</div>' +
          '<div class="homepage_event_category_li_text ellipsis">' +
          item.label +

          '<div class="homepage_event_category_li_text_location category_event_li_text">' +
          (item.location ? item.location + '&nbsp' : 'Worldwide &nbsp') +
          '</div>' +
          '<div class="homepage_event_category_li_text_creator">' +
          'Created by: <span class="homepage_event_category_li_text_creator_span_search">' +
          item.creatorUser +
          '</span>' +
          '</div>' +
          '</div>'
        return $("<li>")
          .addClass('homepage_event_li search_input_autocomplete_li')
          .attr('id', item.id + '_' + item.label)
          .data("item.autocomplete", item)
          .append(listItem)
          .appendTo(ul);
      };
    },
    getRandomEvent: function () {
      ws.getRandomEvent(function (resp) {
        if (resp && resp[0]) {
          Backbone.history.navigate('event/' + encodeURIComponent(decodeEntities(resp[0].name)) + '/' + resp[0].id, true);
        }
      }, function (error) {
        console.log('fail')
      });
    },
    goToMyEvents: function () {
      $('.header_user_management_dropdown').hide()
      Backbone.history.navigate('myEvents', true);
    },
    // === Create event modal logic ===
    showCreateEventModal: function (cb, editDates, isMobile) {
      addCreateEventModalHandlers(cb)
      this.locationSearch()
      
      if(editDates)
        this.addEventDatePickers(editDates)
      else 
        this.addEventDatePickers()
        
      $('#createEventLocation').attr('maxlength', '255')
      $('[data-toggle="tooltip"]').tooltip({
        html: true
      });
      
      $('#createEventModal').modal('show')
      $('.modal-backdrop').appendTo('#header_container')
    },
    createEvent: function() {
      $('#createEventAlertDiv').addClass('display_none')
      event.preventDefault()
      var that = this
      var createEventDetails = {}
      createEventDetails.name = $('#createEventName').val()
      createEventDetails.location = $('#createEventLocation').val()
      createEventDetails.locationMagicKey = that.getLocationMagicKey()
      
      createEventDetails.backgroundImage = $(".selected_background_image").attr('data-image-id')
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
      
      createEventDetails.countryCode = that.getLocationCountryCode()
      
      that.createEventCallback(createEventDetails)
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
          $('#createEventForm').find("input").not(':input[type=submit]').val("")
          $('#createEventModal').modal('toggle')
          if(self.vent)
            self.vent.trigger("createEventRender");
          
          var eventParams
          try {
            eventParams = JSON.parse(resp)
            if(eventParams.id && eventParams.name) {
              Backbone.history.navigate('event/' + encodeURIComponent(self.decodeEntities(eventParams.name)) + '/' + eventParams.id, true);
            }
          } catch(err) {
            
          }
          var successMessageContainer = $('.success-message')
          successMessageContainer.addClass('show')
          successMessageContainer.html('Event succesfully created')
          setTimeout(function(){ 
            successMessageContainer.removeClass('show')
            successMessageContainer.html('')
          }, 3000);
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
    addEventDatePickers: function(editDates){
      var dateObj, dateObjTwo
      
      dateObj = {
        useCurrent: false,
        minDate: moment().toDate(),
        maxDate: moment().add(20, 'year').toDate(),
        format: 'YYYY/MM/DD HH:mm',
      }
      dateObjTwo = {
        useCurrent: false,
        maxDate: moment().add(20, 'year').toDate(),
        format: 'YYYY/MM/DD HH:mm',
      }
      
      if(editDates){
        dateObj.minDate = moment()
        dateObjTwo.minDate = moment()
        dateObj = _.extend(dateObj, {defaultDate: editDates.startDate})
        dateObjTwo = _.extend(dateObjTwo, {defaultDate: editDates.endDate})
      }
      
      if(!editDates ||  (editDates && moment().add(1, 'minute').toDate() < editDates.startDate && moment().add(1, 'minute').toDate() < editDates.endDate)){
        $('#datePickerEventStartDate').datetimepicker(dateObj)
        $('#datePickerEventEndDate').datetimepicker(dateObjTwo)

        $("#datePickerEventStartDate").on("dp.change", function (e) {
            $('#datePickerEventEndDate').data("DateTimePicker").minDate(e.date);
        })
        $("#datePickerEventEndDate").on("dp.change", function (e) {
            $('#datePickerEventStartDate').data("DateTimePicker").maxDate(e.date);
        })
      } else {
        $('#datePickerEventStartDate').addClass('display_none')
        $('#datePickerEventEndDate').addClass('display_none')
        $('#datePickerEventStartDateLabel').addClass('display_none')
        $('#datePickerEventEndDateLabel').addClass('display_none')
        $('#isLocalCheckbox').addClass('display_none')
        $('#isLocalCheckboxLabel').addClass('display_none')
        $('.isLocalInfoIcon').addClass('display_none')
      }
    },
    setLocationMagicKey: function(magicKey){
      locationMagicKey = magicKey
    },
    getLocationMagicKey: function(){
      return locationMagicKey
    },
    setLocationCountryCode: function(countryCodeLocation){
      locationCountryCode = countryCodeLocation
    },
    getLocationCountryCode: function(){
      return locationCountryCode
    },
    locationSearch: function (e) {
      var temp = true
      $("#createEventLocation").focusout(function(event) {
        if($("#createEventLocation").val() !== locationName){
          locationMagicKey = ""
          locationCountryCode = ""
          $('#createEventForm').validate().element("#createEventLocation");
        }
      })
      
      var searchSuggestions = $('#createEventLocation').autocomplete({
        source: function (request, response) {
          ws.getLocationSuggestion(request.term, function (resp) {
            response(_.map(resp, function (e) {
              var locationArray = []
              if(e.location) {
                if(e.location.street)
                  locationArray.push(e.location.street)
                if(e.location.city)
                  locationArray.push(e.location.city)
                if(e.location.country)
                  locationArray.push(e.location.country)
              }
              return {
                value: e.name,
                location: locationArray && locationArray.length ? locationArray.join(', ') : e.name,
                magicKey: e.id,
                countryCode: e.location && e.location.country
              };
            }));
          }, function (error) {
            console.log('fail')
          });
        },
        minLength: 2,
        delay: 200,
        open: function () {
          $('ul.ui-menu').width($(this).innerWidth())
        },
        select: function (event, ui) {
          event.preventDefault()
          temp = true
          setLocationKeys(ui.item)
          return false;
        }
      }).
      focus(function () {
        if (temp) {
          $(this).autocomplete('search')
          temp = false
        }
      })
      
      function setLocationKeys(item){
        var selectedLocationName = item.value + (item.value !== item.location ? ', ' + item.location : '')
        $('#createEventLocation').val(selectedLocationName)
        locationMagicKey = item.magicKey
        locationCountryCode = item.countryCode
        locationName = selectedLocationName
      }
      
      searchSuggestions.data('ui-autocomplete')._renderItem = function (ul, item) {
        ul.addClass('autocomplete_default_ul')
        
        var listItem
        listItem = '<div class="autocomplete_default_li__text autocomplete_default_li__title ellipsis">' + item.value + '</div>' +
          '<div class="autocomplete_default_li__text ellipsis">' + item.location + '</div>'
        
        return $('<li>')
          .addClass('autocomplete_default_li')
          .data('item.autocomplete', item)
          .append(listItem)
          .appendTo(ul);
      };
    }
  };
});
