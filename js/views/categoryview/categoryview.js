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
  'text!../../../templates/categoryview/categoryview.html',
  './eventlistview'
], function ($, ui, _, moment, countdown, Backbone, ws, common, categoryviewTemplate, EventListView) {
  'use strict'

  var CategoryviewView = Backbone.View.extend({
    initialize: function (options) {
      this.eventList = new EventListView();
      options.pageIndex = 0;
      this.options = options;
      _.bindAll(this, 'render');
      var that = this
      $(document).click(function (event) {
        if (!$(event.target).closest('#search_container_category_view').length) {
          that.closeSearchOverlayIfOpen(event)
        }
      })
    },
    events: {
      'click #btn_sort_by': 'showSortByOptions',
      'keyup #search-input-filter': 'searchEventByName',
      'click .list_controller_dropdown_item': 'getOrderContent',
      'click .btn_search': 'navigateToSearch',
      'keypress #search-input': 'onEnterNavigateToSearch'
    },
    closeSearchOverlayIfOpen: function (e) {
      if (e.target.className == 'black_overlay_search_input') {
          $('.black_overlay_search_input').remove();
      }
    },
    showSortByOptions: function () {
      if ($("#list_controller_dropdown").hasClass("display_block")) {
        $("#list_controller_dropdown").removeClass("display_block");
        $("#category_sort_by_arrow").removeClass("gray_up_arrow_5px")
        $("#category_sort_by_arrow").addClass("gray_down_arrow_5px")
      } else {
        $("#list_controller_dropdown").addClass("display_block");
        $("#category_sort_by_arrow").addClass("gray_up_arrow_5px")
        $("#category_sort_by_arrow").removeClass("gray_down_arrow_5px")
      }
    },
    searchEventByName: _.debounce(function (e) {
      if (!this.options)
        this.options = {}
      this.options.name = $(e.currentTarget).val()
      this.options.pageIndex = 0;
      this.renderEventList(this.options)
    }, 150),
    searchEventsByOrderType: function (e) {
      if (!this.options)
        this.options = {}
      this.options.orderType = $(e.currentTarget).val()
      this.render()
    },
    navigateToEvent: function (e) {
      var itemId = $(e.currentTarget).attr('id').split(/_(.*)/);
      if (itemId && itemId.length)
        Backbone.history.navigate('event/' + encodeURIComponent(itemId[1]).replace(/%20/g, '+').toLowerCase() + '/' + itemId[0], true)
    },
    onEnterNavigateToSearch: function(e){
      if (e.which == 13) {
        this.navigateToSearch()
      }
    },
    navigateToSearch: function (e) {
      var itemName = $('.search_input').val();
      if (itemName)
        Backbone.history.navigate('search/' + encodeURIComponent(itemName).replace(/%20/g, '+').toLowerCase(), true)
      else 
        Backbone.history.navigate('search/' + encodeURIComponent(' '), true)
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
      
      ws.getEventsInCategory(false, options.categoryName, options.orderType, options.pageIndex, options.name, options.userName, options.countryCode, function (response) {
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

      
      if(!options || !options.categoryName) {
        $('.list_controller').addClass('display_none')
        if(!options.categoryName && !options.userName && options.name) {
            options.orderType = 'relevance';
        } else {
          options.orderType = 'popular';
        }
      } else {
        if (options && options.categoryName && options.categoryName === 'upcoming')
          options.orderType = 'chronological';
        else {
          options.orderType = 'popular';
        }
      }
      var template = _.template(categoryviewTemplate)
      
      ws.getEventsInCategory(true, options.categoryName, options.orderType, '0', options.name, options.userName, options.countryCode, function (response) {
        that.$el.html(template({
          response: response,
          options: options,
          moment: moment
        }))
        that.$('.events_list_anchor').html(that.eventList.$el);
        that.eventList.render(response, options);
        that.hightlightSelectedOrderType(options.orderType)
        
        if(!options || !options.categoryName){
          $('#category_filter_input').addClass('display_none')
          $("#list_controller_dropdown").addClass("display_block");
        } else if(options.categoryName === "upcoming" || options.categoryName === "popular"){
          $("#category_sort_by_arrow").addClass("display_none")
          $(".search_input_blue_bg").css("width", "100%")
        }
        common.addSearchBarEvents()
        if(options && options.categoryName) {
          var metaDescription = "Check out the latest news about " + options.categoryName + " events! Join the countdowns on Event Snitch or create your own and share them with the world!"
          $("meta[name='description']").attr("content", metaDescription)
          $(document).attr("title", "Event Snitch " + options.categoryName.charAt(0).toUpperCase() + options.categoryName.slice(1) + ' events')
        }
        
      }, function (error) {
        console.log('fail')
        common.addSearchBarEvents()
      })


      return this
    }

  })


  return CategoryviewView
})
