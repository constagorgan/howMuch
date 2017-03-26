/*global define, console, alert */
/*jslint nomen: true */
define([

  "jquery",
  "underscore",
  "backbone",
  "ws",
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020'
], function ($, _, Backbone, ws, moment) {
  "use strict";

  return {
    addSearchBarEvents: function () {
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
            var overlayDiv = $('.black_overlay_search_input');
            if(!overlayDiv || !overlayDiv.length){
              $('#main').append('<div class="black_overlay_search_input"></div>')
            }
          }, function (error) {
              console.log('fail')
            });
        },
        minLength: 3,
        select: function (event, ui) {
          $('.black_overlay_side_menu').remove();
          var url = ui.item.label;
          if (url != '#') {
            Backbone.history.navigate('#event/' + encodeURIComponent(ui.item.label) + '/' + ui.item.id, true)
          }
        }
    })
          
    auto.data("ui-autocomplete")._renderItem = function (ul, item) {
      ul.addClass( "homepage_event_category_ul" )
      var listItem  = '<div class="li_background_pic" style="background: url(../Content/img/'+item.background+'.jpg);"></div>' + 
            '<div class="black_overlay position_absolute"></div>' +       
            '<div class="homepage_event_category_li_date">' + 
              ((item.isGlobal && parseInt(item.isGlobal)) ?  moment(item.eventDate).format("D") : moment(new Date(moment.utc(item.eventDate))).format("D")) + 
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
                (item.cityName ? item.cityName  + '&nbsp': '&nbsp') + 
                (item.regionName ?  item.regionName + '&nbsp': '&nbsp') +
                (item.countryName && item.countryName.toUpperCase() !== "WORLDWIDE" ?  item.countryName + '&nbsp': '&nbsp') +
              '</div>' + 
              '<div class="homepage_event_category_li_text_creator">' +
                  'Created by: <span class="homepage_event_category_li_text_creator_span_search">' +
                    item.creatorUser + 
                  '</span>'+ 
                '</div>' +
            '</div>'
        return $( "<li>" )
            .addClass('homepage_event_li homepage_event_category_li')
            .attr('id', item.id + '_' + item.label)
            .data("item.autocomplete", item)
            .append(listItem)
            .appendTo(ul);
        };
    },
    getRandomEvent: function(){
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
