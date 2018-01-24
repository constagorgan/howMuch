/* global define, console */

define([
  'jquery',
  'jquery-ui-autocomplete',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2012-2022',
  'countdown',
  'backbone',
  'ws',
  'common',
  'text!../../../templates/mainview/mainview.html'
], function ($, ui, _, moment, countdown, Backbone, ws, common, mainviewTemplate) {
  'use strict'

  var events = {};

  var MainviewView = Backbone.View.extend({
    close: function () {
      _.each(this.subViews, function (view) {
        view.remove();
      });
      this.remove();
    },
    events: {
      'click .btn_search': 'navigateToSearch',
      'keypress #search-input': 'onEnterNavigateToSearch',
      'click .homepage_event_category_li_text_creator_span': 'searchUserCreatedEvents'
    },
    closeSearchOverlayIfOpen: function (e) {
      if (e.target.className == 'black_overlay_search_input') {
          $('.black_overlay_search_input').remove();
      }
    },
    navigateToSearch: function (e) {
      var itemName = $('.search_input').val();
      if (itemName)
        window.location.hash = '#search/' + encodeURIComponent(itemName) 
      else 
        window.location.hash = '#search/' + encodeURIComponent(' ') 
    },
    onEnterNavigateToSearch: function(e) {
      if (e.which == 13) {
        this.navigateToSearch()
      }
    },
    searchUserCreatedEvents: function(e) {
      e.stopPropagation()
      window.location.hash = '#searchUser/' + encodeURI(e.currentTarget.innerHTML)
    },
    render: function () {
      var that = this

      var template = _.template(mainviewTemplate)

      ws.getEventsByCategory(function (response, locationDetails) {
        that.$el.html(template({
          response: response,
          moment: moment,
          countryCode: locationDetails
        }))
        addHandlers()
      }, function (response) {
        addHandlers()
      })

      return this
    },
    initialize: function () {
      var that = this
      $(document).click(function (event) {
        if (!$(event.target).closest('#search_container_main_view').length) {
          that.closeSearchOverlayIfOpen(event)
        }
      })
    }
  })

  function addHandlers() {
    common.addSearchBarEvents()

    if (($(window).height() + 100) < $(document).height()) {
      $('#top-link-block').removeClass('hidden').affix({
        // how far to scroll down before link "slides" into view
        offset: {
          top: 100
        }
      });
    }
  }

  return MainviewView
})
