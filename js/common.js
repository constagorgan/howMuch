/*global define, console, alert */
/*jslint nomen: true */
define([

  "jquery",
  "underscore",
  "backbone",
  "bootstrap-datepicker",
  "ws",
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2012-2022',
  "bootstrap-datetimepicker",
    '../Content/resources/resources'
], function ($, _, Backbone, bootstrapDatePicker, ws, moment, bootstrapDateTimePicker, Resources) {
  "use strict";
  var setOverlayDiv = function () {
    var overlayDiv = $('.black_overlay_search_input');
    if (!overlayDiv || !overlayDiv.length) {
      $('#main').append('<div class="black_overlay_search_input"></div>')
    }
  }
  var removeOverlayDiv = function () {
    $('.black_overlay_search_input').remove();
  }

  function addChangePasswordModalHandlers() {
    var myBackup = $('#changePasswordModal').clone();
    $('#changePasswordModal').on('hidden.bs.modal', function () {
      $('#changePasswordModal').remove()
      var myClone = myBackup.clone()
      $('#header').parent().append(myClone)
    });

    $("#changePasswordForm").validate({
      showErrors: function (errorMap, errorList) {
        $.each(this.validElements(), function (index, element) {
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

          $('#changePasswordAlertDiv').addClass('display_none')
        });
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
          regex: "^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]{8,}$",
          notEqual: '#oldChangePassEmail'
        },
        confirmNewChangePassEmail: {
          required: true,
          equalTo: '#newChangePassEmail'
        }
      },
      messages: {
        newChangePassEmail: {
          regex: "Password must have minimum 8 characters with at least one lowercase, one uppercase, one number and one special character.",
          notEqual: "New password must be different than old password"
        },
        confirmNewChangePassEmail: {
          equalTo: 'The passwords do not match, please try again.'
        }
      }
    });
  }
  
  function addCreateEventModalHandlers(){
    $("#createEventForm").validate({
      showErrors: function (errorMap, errorList) {
        $.each(this.validElements(), function (index, element) {
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
        });
      },
      rules: {
        createEventName: {
          required: true,
          regex: '^([a-zA-Z0-9_-]){6,255}$'
        },
        createEventLocation: {
          required: true
        },
        datePickerEventStartDate: {
          required: true
        },
        datePickerEventEndDate: {
          required: true
        }
      },
      messages: {
        createEventName: {
          regex: 'Event name can only contain letters and numbers. Minimum size: 6 characters. Maximum size: 255 characters'
        }
      }
    });
  }
  
  function addSignUpModalHandlers() {
    var myBackup = $('#signUpModal').clone();
    $('#signUpModal').on('hidden.bs.modal', function () {
      $('#signUpModal').remove()
      var myClone = myBackup.clone()
      $('#header').parent().append(myClone)
      grecaptcha.reset()
      $('#g-recaptcha').empty()
      window.renderRecaptcha('g-recaptcha')
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
      event.preventDefault()
      event.stopImmediatePropagation()
      var that = $(this);
      $(this).find(".dropdown-menu li.active a").focus()

      $(document).keyup(_.debounce(function (e) {
        var key = String.fromCharCode(e.which);
        var foundLi = false
        that.find("li").each(function (idx, item) {
          if ($(item).text().replace(/ /g, "").replace(/(^[ \t]*\n)/gm, "").charAt(0).toLowerCase() == key.toLowerCase()) {
            if (!foundLi) {
              $(".dropdown-menu li.active").removeClass("active")
              $(item).addClass("active")
              that.find(".dropdown-menu li.active a").focus()
              foundLi = true
            }
          }
        });
      }, 300, true))

      $('.country_dropdown_menu li').click(function (event) {
        event.preventDefault()
        event.stopImmediatePropagation()
        $('ul.dropdown-menu li.selected').removeClass('selected')
        $(this).addClass('selected')
        var selText = $(this).text().replace(/\w\S*/g, function (txt) {
          return txt.charAt(0).toUpperCase() + (txt.indexOf(".") > -1 ? txt.substr(1).toUpperCase() : txt.substr(1).toLowerCase())
        })
        $(this).parents('#country_code_dropdown').find('.dropdown-toggle').html(selText + ' <span class="caret country_dropdown_caret"></span>');
        $('#sign_up_country_selected').val('selText')
        $("#signUpForm").validate().element("#sign_up_country_selected");
        $(this.parentElement.parentElement).removeClass('open')
        return false
      })
    })

    $("#sign_in_form").validate({
      showErrors: function (errorMap, errorList) {
        $.each(this.validElements(), function (index, element) {
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

          $('#signInAlertDiv').addClass('display_none')
        });
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
        $.each(this.validElements(), function (index, element) {
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

          $('#signUpAlertDiv').addClass('display_none')
        });
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
          regex: "^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]{8,}$"
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
          regex: "Password must have minimum 8 characters with at least one lowercase, one uppercase, one number and one special character."
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
      showErrors: function (errorMap, errorList) {
        $.each(this.validElements(), function (index, element) {
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
        });
      },
      rules: {
        email_sign_in: {
          valid_email: true,
          required: true
        }
      }
    });
  }
  
  
  $.validator.addMethod("valid_email", function (value, element) {
    value = value.toLowerCase()
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

  $.validator.addMethod("notEqual", function (value, element, param) {
    return this.optional(element) || value != $(param).val();
  }, "This has to be different...");

  $.validator.addMethod(
    "listMustHaveValue",
    function (value, element) {
      var liselected = $('.country_dropdown_menu .selected')
      if (liselected.length < 1) {
        $('#country_dropdown').addClass('common_modal__error')
        $('#country_dropdown').siblings('span').removeClass('display_none')
          .attr('title', "Please select a country")
          .tooltip('fixTitle')
          .addClass("error");
        $('#country_dropdown_none_selected_error').click(function(e){
          e.stopPropagation();
          $("#country_dropdown").dropdown('toggle');// this doesn't
        })
        $('.country_dropdown_caret').addClass('display_none')
      } else {
        $('#country_dropdown').data("title", "")
          .removeClass("error")
          .tooltip("hide");
        $('.country_dropdown_caret').removeClass('display_none')
        $('#country_dropdown').removeClass('common_modal__error')

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
    goToMainPage: function () {
      window.location.hash = '#'
    },
    checkUserTimezone: function () {
      try {
        if (localStorage.getItem('userTimezone') == null || !this.isTimezoneCompliant())
          this.storeDefaultUserTimezone();
      } catch (err) {
        alert('This browser does not support Event Snitch in incognito mode.')
      }
    },
    storeDefaultUserTimezone: function () {
      var currentTimezoneName = moment.tz(moment.tz.guess())
      localStorage.setItem('userTimezone', currentTimezoneName._z.name);
    },

    // Check if the set timezone is correctly named
    isTimezoneCompliant: function () {
      var timezoneExists = _.find(Resources.timezones, function (el) {
        return el === localStorage.getItem('userTimezone')
      })
      if (timezoneExists) {
        //console.log("it's compliant")
        return true;
      } else {
        //console.log("it's NOT compliant")
        return false;
      }
    },
    getTimezoneDisplay: function (timezone) {
      return timezone._z.name + ' GMT' + timezone.format('Z')
    },
    updateClientTimezone: function (id) {
      updateTimezoneInfoText(id)
      localStorage.setItem('userTimezone', $(id + ' option:selected').data('timezoneName'))
    },
    signOut: function () {
      localStorage.setItem('eventSnitchAccessToken', '')
      sessionStorage.setItem('eventSnitchAccessToken', '')
      localStorage.setItem('eventSnitchLoggedUser', '')
      sessionStorage.setItem('eventSnitchLoggedUser', '')
      window.location.reload()
    },
    signIn: function () {
      $('#signUpModal').modal('show')
      this.addDatePicker()
      addSignUpModalHandlers()
    },
    changePassword: function () {
      $('#changePasswordModal').modal('show')
      addChangePasswordModalHandlers()
    },
    timezoneModal: function () {
      $('#timezoneModal').modal('show')
    },
    scrollToTopOfPage: function () {
      $('body').scrollTop(0);
    },
    addDatePicker: function () {
      $('#datePickerSignUp').datepicker({
        container: '.sign_up_form',
        format: 'yyyy/mm/dd',
        autoclose: true,
        endDate: moment().subtract(5, 'year').toDate(),
        startDate: '01/01/1900'
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
                isGlobal: e.isGlobal,
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
        delay: 500,
        select: function (event, ui) {
          removeOverlayDiv()
          var url = ui.item.label
          if (url != '#') {
            window.location.hash = '#event/' + encodeURIComponent(ui.item.label) + '/' + ui.item.id
          }
        }
      })

      auto.data("ui-autocomplete")._resizeMenu = function () {
        var ul = this.menu.element;
        ul.outerWidth(this.element.outerWidth());
      }

      auto.data("ui-autocomplete")._renderItem = function (ul, item) {
        ul.addClass("homepage_event_category_ul")
        ul.addClass("search_input_autocomplete")
        var listItem = '<div class="li_background_pic" style="background: url(../Content/img/' + item.background + '.jpg);"></div>' +
          '<div class="black_overlay position_absolute"></div>' +
          '<div class="homepage_event_category_li_date">' +
          ((item.isGlobal && parseInt(item.isGlobal)) ? moment(item.eventDate).format("D") : moment(new Date(moment.utc(item.eventDate))).format("D")) +
          '<div class="homepage_event_category_li_date_month">' +
          ((item.isGlobal && parseInt(item.isGlobal)) ? moment(item.eventDate).format("MMM") : moment(new Date(moment.utc(item.eventDate))).format("MMM")) +
          '</div>' +
          '<div class="homepage_event_category_li_date_year">' +
          ((item.isGlobal && parseInt(item.isGlobal)) ? moment(item.eventDate).format("YYYY") : moment(new Date(moment.utc(item.eventDate))).format("YYYY")) +
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
          .addClass('homepage_event_li homepage_event_category_li')
          .attr('id', item.id + '_' + item.label)
          .data("item.autocomplete", item)
          .append(listItem)
          .appendTo(ul);
      };
    },
    getRandomEvent: function () {
      ws.getRandomEvent(function (resp) {
        if (resp && resp[0]) {
          window.location.hash = '#event/' + encodeURIComponent(resp[0].name) + '/' + resp[0].id
        }
      }, function (error) {
        console.log('fail')
      });
    },
    goToMyEvents: function () {
      $('.header_user_management_dropdown').hide()
      window.location.hash = '#myEvents'
    },
    // === Create event modal logic ===
    showCreateEventModal: function () {
      $('#createEventModal').modal('show')
      this.locationSearch()
      this.addEventDatePickers()
      $('#createEventLocation').attr('maxlength', '255')
      $('[data-toggle="tooltip"]').tooltip({
        html: true
      });
      addCreateEventModalHandlers()
    },
    addEventDatePickers: function(){
      $('#datePickerEventStartDate').datetimepicker({
        minDate: moment(),
        maxDate: moment().add(20, 'year').toDate(),
        format: 'YYYY/MM/DD HH:mm A',
      })
      $('#datePickerEventEndDate').datetimepicker({
        useCurrent: false,
        minDate: moment(),
        maxDate: moment().add(20, 'year').toDate(),
        format: 'YYYY/MM/DD HH:mm A',
      })
      $("#datePickerEventStartDate").on("dp.change", function (e) {
          $('#datePickerEventEndDate').data("DateTimePicker").minDate(e.date);
      })
      $("#datePickerEventEndDate").on("dp.change", function (e) {
          $('#datePickerEventStartDate').data("DateTimePicker").maxDate(e.date);
      })
    },
    locationSearch: function (e) {
      var temp = true
      var searchSuggestions = $('#createEventLocation').autocomplete({
        source: function (request, response) {
          ws.getLocationSuggestion(request.term, function (resp) {
            response(_.map(resp.suggestions, function (e) {
              return {
                text: e.text,
                magicKey: e.magicKey
              };
            }));
          }, function (error) {
            console.log('fail')
          });
        },
        minLength: 2,
        delay: 500,
        open: function () {
          $('ul.ui-menu').width($(this).innerWidth())
        },
        select: function (event, ui) {
          event.preventDefault()
          temp = true
          var selectedLocationName = ui.item.text
          $('#createEventLocation').val(selectedLocationName)
          var selectedMagicKey = ui.item.magicKey
          console.log('Trebuie facut request-ul de salvare in baza pt magic key: ' + selectedMagicKey)

          return false;
        }
      }).
      focus(function () {
        if (temp) {
          $(this).autocomplete('search')
          temp = false
        }
      })

      searchSuggestions.data('ui-autocomplete')._renderItem = function (ul, item) {
        ul.addClass('autocomplete_default_ul')
        var listItem

        var commaIndex = item.text.indexOf(',');
        if (commaIndex != -1) {
          var locationName = item.text.substring(0, commaIndex);
          listItem = '<div class="autocomplete_default_li__text autocomplete_default_li__title ellipsis">' + locationName + '</div>' +
            '<div class="autocomplete_default_li__text ellipsis">' + item.text.substring(commaIndex + 2, item.text.length - 1) + '</div>'
        } else {
          listItem = '<div class="autocomplete_default_li__text autocomplete_default_li__title ellipsis">' + item.text + '</div>' +
            '<div class="autocomplete_default_li__text ellipsis">' + item.text + '</div>'
        }

        return $('<li>')
          .addClass('autocomplete_default_li')
          .attr('id', 'unIdPacPacRatzaStaPeLac')
          .data('item.autocomplete', item)
          .append(listItem)
          .appendTo(ul);
      };

    }

  };
});
