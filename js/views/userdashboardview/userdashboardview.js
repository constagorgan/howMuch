/* global define, console */

define([
  'jquery',
  'jquery-ui',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2012-2022',
  'backbone',
  'ws',
  'common',
  'text!../../../templates/userdashboardview/userdashboardview.html',
  './userdashboardlistview'
], function ($, ui, _, moment, Backbone, ws, common, userdashboardviewTemplate, EventListView) {
  'use strict'

  var UserdashboardviewView = Backbone.View.extend({
    initialize: function () {
      this.eventList = new EventListView();
      var options = {}
      options.pageIndex = 0
      this.options = options
      _.bindAll(this, 'render')
      var that = this
      $(document).click(function (event) {
        if (!$(event.target).closest('#search_container_userdashboard_view').length) {
          that.closeSearchOverlayIfOpen(event)
        }
      })
    },
    events: {
      'click .list_controller_dropdown_item': 'getOrderContent',
      'click .btn_search': 'navigateToSearch',
      'keypress #search-input': 'onEnterNavigateToSearch'
    },
    closeSearchOverlayIfOpen: function (e) {
      if (e.target.className == 'black_overlay_search_input') {
          $('.black_overlay_search_input').remove();
      }
    },
    searchEventsByOrderType: function (e) {
      if (!this.options)
        this.options = {}
      this.options.orderType = $(e.currentTarget).val()
      this.render()
    },
    onEnterNavigateToSearch: function(e){
      if (e.which == 13) {
        this.navigateToSearch()
      }
    },
    navigateToSearch: function (e) {
      var itemName = $('.search_input').val();
      if (itemName)
        window.location.hash = '#search/' + encodeURIComponent(itemName)
    },
    getOrderContent: function(e){
      var pageOrder = $(e.currentTarget).attr('data-page-order')
      if(pageOrder !== this.options.orderType){
        this.options.orderType = pageOrder
        this.options.pageIndex = 0
        this.renderEventList(this.options)
      }
    },
    hightlightSelectedOrderType: function(orderType){
      var oldSelectedElement = $(".list_controller_dropdown_item_selected")
      oldSelectedElement.removeClass("list_controller_dropdown_item_selected")
      var selectedElement = $(".list_controller_dropdown_item[data-page-order='" + orderType + "']")
      selectedElement.addClass("list_controller_dropdown_item_selected")
    },
    renderEventList: function (myOptions) {
      var that = this
      
      if (!myOptions)
        myOptions = {}
        
      var options = myOptions
      
      this.hightlightSelectedOrderType(options.orderType)
      
      ws.getLoggedUserEvents(options.orderType, options.pageIndex, function (response) {
        that.$('.events_list_anchor').html(that.eventList.$el);
        that.eventList.render(response, options);
      }, function (error) {
        console.log('fail')
      })
    },
    render: function () {
      var that = this
      if (!this.options)
        this.options = {}
      var options = this.options

      options.orderType = 'popular';

      var template = _.template(userdashboardviewTemplate)
      
      ws.getLoggedUserEvents(options.orderType, '0', function (response) {
        that.$el.html(template({
          response: response,
          options: options,
          moment: moment
        }))
        that.$('.events_list_anchor').html(that.eventList.$el);
        that.eventList.render(response, options);
        that.hightlightSelectedOrderType(options.orderType)
        
        common.addSearchBarEvents()
        
      }, function (error) {
        console.log('fail')
        common.addSearchBarEvents()
      })


      return this
    }

  })


  return UserdashboardviewView
})
