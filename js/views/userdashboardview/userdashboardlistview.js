/* global define, console */

define([
  'jquery',
  'jquery-ui-autocomplete',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2012-2022',
  'backbone',
  'ws',
  'common',
  'text!../../../templates/userdashboardview/userdashboardlistview.html'
], function ($, ui, _, moment, Backbone, ws, common, eventListTemplate) {
  'use strict'
  
  var EventListView = Backbone.View.extend({
    events: {
      'click .list_footer_item': 'getPageContent',
      'click .list_footer_left_arrow': 'getPageContent',
      'click .list_footer_right_arrow': 'getPageContent',
      'change .list_footer_item_input_select': 'getPageContentDropdown'
    },
    render: function(response, options) {
      var template = _.template(eventListTemplate)
      this.$el.html(template({
        response: response,
        moment: moment,
        selectedPage: options.pageIndex,
        decodeEntities: common.decodeEntities
      }));
      this.highlightSelectedPage(options.pageIndex)
      this.delegateEvents()
      this.options = options
    },
    getPageContent: function(e) {
      var pageNumber = parseInt($(e.currentTarget).attr('data-page-number'))
      if (pageNumber !== this.pageIndex){
        this.options.pageIndex = pageNumber
        this.renderEventList(this.options)
      }
    },
    getPageContentDropdown: function(e) {
      var pageNumber = parseInt($(".list_footer_item_input_select option:selected").attr('data-page-number'))
      if (pageNumber !== this.pageIndex){
        this.options.pageIndex = pageNumber
        this.renderEventList(this.options)
      }
    },
    highlightSelectedPage: function (selectedPage) {
      var selectedElement = $(".list_footer_item[data-page-number='" + selectedPage + "']")
      selectedElement.addClass("list_footer_item_selected")
    },
    renderEventList: function (myOptions) {
      var that = this
      
      if (!myOptions)
        myOptions = {}
        
      var options = myOptions
      common.scrollToTopOfPage()
      this.hightlightSelectedOrderType(options.orderType)
      
      ws.getLoggedUserEvents(false, options.orderType, options.pageIndex, options.name, function (response) {
        if(!response) {
          response = JSON.stringify({ 
            results: [],
            totalResults: 0,
            error: true
          })
        }          
        that.$('.events_list_anchor').html(that.$el);
        that.render(response, options);
      }, function (error) {
        console.log('fail')
      })
    },
    hightlightSelectedOrderType: function(orderType){
      var oldSelectedElement = $(".list_controller_dropdown_item_selected")
      oldSelectedElement.removeClass("list_controller_dropdown_item_selected")
      var selectedElement = $(".list_controller_dropdown_item[data-page-order='" + orderType + "']")
      selectedElement.addClass("list_controller_dropdown_item_selected")
    }
  });
  
  return EventListView
})