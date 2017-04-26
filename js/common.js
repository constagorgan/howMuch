/*global define, console, alert */
/*jslint nomen: true */
define([

  "jquery",
  "underscore",
  "backbone",
  "bootstrap-datepicker",
  "ws",
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2012-2022',
    '../Content/resources/resources'
], function ($, _, Backbone, bootstrapDatePicker, ws, moment, Resources) {
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
      errorClass: "sign_up_form_invalid",
      validClass: "sign_up_form_valid",
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
          regex: "^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,}$",
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
  }
  
  function addSignUpModalHandlers() {
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
        email_sign_in: {
          valid_email: true,
          required: true
        },
        userSignUp: {
          required: true,
          regex: '^([a-zA-Z0-9_-]){6,24}$'
        },
        passSignUp: {
          required: true,
          regex: "^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,}$"
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
        email_sign_in: {
          valid_email: true,
          required: true
        }
      }
    });
  }
  
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
  
  
  function updateTimezoneInfoText(id) {
    var selectedText = $(id + ' option:selected').text()
    $('#utcText').text(selectedText);
    $('#sideMenuTimezoneDisplay').text(selectedText.split(' ')[0])
    $('#sideMenuTimezoneGmt').text(selectedText.split(' ')[1])
  }

  return {
    goToMainPage: function(){
      window.location.hash = '#'
    },
    checkUserTimezone: function () {
      if (localStorage.getItem('userTimezone') == null || !this.isTimezoneCompliant())
        this.storeDefaultUserTimezone();
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
    //verificat textul pus prima data pe timerview si pus si pe side menu
    signOut: function () {
      localStorage.setItem('eventSnitchAccessToken', '')
      sessionStorage.setItem('eventSnitchAccessToken', '')
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
      if (!$.fn.bootstrapDP && $.fn.datepicker && $.fn.datepicker.noConflict) {
        var datepicker = $.fn.datepicker.noConflict();
        $.fn.bootstrapDP = datepicker;
      }
      $('#datePickerSignUp').bootstrapDP({
        container: '.sign_up_form',
        format: 'dd/mm/yyyy',
        autoclose: true,
        endDate: moment().subtract(5, 'year').toDate(),
        startDate: '01/01/1900'
      })
    },
    addSearchBarEvents: function () {
      $("#search-input").keyup(function (e) {
        if ($(this).val().length < 2) {
          removeOverlayDiv()
        }
      });
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
                cityName: e.cityName,
                regionName: e.regionName,
                countryName: e.countryName,
                creatorUser: e.creatorUser
              };
            }));
            setOverlayDiv();
          }, function (error) {
            console.log('fail')
          });
        },
        minLength: 2,
        select: function (event, ui) {
          removeOverlayDiv()
          var url = ui.item.label
          if (url != '#') {
            window.location.hash = '#event/' + encodeURIComponent(ui.item.label) + '/' + ui.item.id
          }
        }
      })

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
          '<div class="homepage_event_category_li_text_location">' +
          (item.cityName ? item.cityName + '&nbsp' : '&nbsp') +
          (item.regionName ? item.regionName + '&nbsp' : '&nbsp') +
          (item.countryName && item.countryName.toUpperCase() !== "WORLDWIDE" ? item.countryName + '&nbsp' : '&nbsp') +
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
    }
  };
});
