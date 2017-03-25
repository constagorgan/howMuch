/* global define, console */

define([
  'jquery',
  'jquery-ui',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020',
  'countdown',
  'backbone',
  'ws',
  'text!../../../templates/categoryview/categoryview.html',
  './eventlistview'
], function ($, ui, _, moment, countdown, Backbone, ws, categoryviewTemplate, EventListView) {
  'use strict'

  var screen_height = $('body').height();
  //    var cur-y = $(window).scrollTop();
  var screen = $(window).height();

  var CategoryviewView = Backbone.View.extend({
    initialize: function (options) {
      this.eventList = new EventListView();
      options.pageIndex = 0;
      this.options = options;
      _.bindAll(this, 'render');
    },
    events: {
      'click #btn_sort_by': 'showSortByOptions',
      'keyup #search-input-filter': 'searchEventByName',
      'click .category_event_li': 'navigateToEvent',
      'click .list_controller_dropdown_item': 'getOrderContent',
      'click .btn_search': 'navigateToSearch'
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
    searchEventByName: function (e) {
      if (!this.options)
        this.options = {}
      this.options.name = $(e.currentTarget).val()
      this.options.pageIndex = 0;
      this.renderEventList(this.options)
    },
    searchEventsByOrderType: function (e) {
      if (!this.options)
        this.options = {}
      this.options.orderType = $(e.currentTarget).val()
      this.render()
    },
    navigateToEvent: function (e) {
      var itemId = $(e.currentTarget).attr('id').split('_');
      if (itemId && itemId.length)
        Backbone.history.navigate('#event/' + encodeURIComponent(itemId[1]) + '/' + itemId[0], true)
    },
    navigateToSearch: function (e) {
      var itemName = $('.search_input').val();
      if (itemName)
        Backbone.history.navigate('#search/' + encodeURIComponent(itemName) , true)
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
      
      ws.getEventsInCategory(options.categoryName, options.orderType, options.pageIndex, options.name, options.countryCode, function (response) {
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
      
      
      if(!options || !options.categoryName){
        $('.list_controller').addClass('display_none')
        options.orderType = 'popular';
      } else {
        if (options && options.categoryName && options.categoryName === 'upcoming')
          options.orderType = 'chronological';
        else
          options.orderType = 'popular';
      }
      var template = _.template(categoryviewTemplate)
      
      ws.getEventsInCategory(options.categoryName, options.orderType, '0', options.name, options.countryCode, function (response) {
        that.$el.html(template({
          response: response,
//          categoryName: options.categoryName,
//          pageIndex: options.pageIndex,
//          name: options.name,
//          countryCode: options.countryCode,
//          orderType: options.orderType,
          options: options,
          moment: moment
        }))
        that.$('.events_list_anchor').html(that.eventList.$el);
        that.eventList.render(response, options);
        that.hightlightSelectedOrderType(options.orderType)
        
        if(!options || !options.categoryName){
          $('#search-input-filter').addClass('display_none')
        } else if(options.categoryName === "upcoming" || options.categoryName === "popular"){
          $("#category_sort_by_arrow").addClass("display_none")
          $(".search_input_blue_bg").css("width", "100%")
        }
        addHandlers()
        
      }, function (error) {
        console.log('fail')
        addHandlers()
      })


      return this
    }

  })

  // nu merge drop down-ul aici, trebuie verificat
  function addHandlers() {
    $("#search-input").autocomplete({
      source: function (request, response) {
        var event = new ws.searchEvents();
        event.fetch({
          data: {
            name: request.term
          }
        }).done(function (resp) {
          response(_.map(resp, function (e) {
            return {
              id: e.id,
              label: e.name
            };
          }));
        })
      },
      minLength: 1,
      select: function (event, ui) {
        var url = ui.item.label;
        if (url != '#') {
          Backbone.history.navigate('#event/' + encodeURIComponent(ui.item.label) + '/' + ui.item.id, true)
        }
      }
    })
  }

  return CategoryviewView
})
