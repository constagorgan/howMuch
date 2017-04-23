/*global define, console, alert */
/*jslint nomen: true */
define([

  "jquery",
  "underscore",
  "backbone",
  "bootstrap-datepicker",
  "ws",
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2012-2022'
], function ($, _, Backbone, bootstrapDatePicker, ws, moment) {
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
  return {
    scrollToTopOfPage: function() {
      $('body').scrollTop(0);
    },
    addDatePicker: function () {
       if (!$.fn.bootstrapDP && $.fn.datepicker && $.fn.datepicker.noConflict) 
        {
          var datepicker = $.fn.datepicker.noConflict();
          $.fn.bootstrapDP = datepicker;
        }
      $('#datePickerSignUp').bootstrapDP({container: '.sign_up_form', format: 'dd/mm/yyyy'})
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
            Backbone.history.navigate('#event/' + encodeURIComponent(ui.item.label) + '/' + ui.item.id, true)
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
          Backbone.history.navigate('#event/' + encodeURIComponent(resp[0].name) + '/' + resp[0].id, true)
        }
      }, function (error) {
        console.log('fail')
      });
    }
  };
});
