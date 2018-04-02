/* global define, console */

define([
  'jquery',
  'jquery-ui-autocomplete',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2012-2022',
  'backbone',
  'ws',
  'common',
  'text!../../../templates/userdashboardview/userdashboardview.html',
  './userdashboardlistview'
], function ($, ui, _, moment, Backbone, ws, common, userdashboardviewTemplate, UserDashboardEventListView) {
  'use strict'

  var UserdashboardviewView = Backbone.View.extend({
    close: function () {
      this.remove();
      this.vent.unbind("createEventRender")
    },
    initialize: function (createEventOptions) {
      this.eventList = new UserDashboardEventListView();
      var options = {}
      options.pageIndex = 0
      this.options = options
      _.bindAll(this, 'render')
      if(createEventOptions && createEventOptions.vent) {
        this.vent = createEventOptions.vent
        this.vent.bind("createEventRender", this.createEventRender, this);
      }
      var that = this
    },
    events: {
      'click #btn_sort_by': 'showSortByOptions',
      'click .list_controller_dropdown_item': 'getOrderContent',
      'click .btn_search': 'navigateToSearch',
      'keypress #search-input': 'onEnterNavigateToSearch',
      'click .category_event_li': 'navigateToEvent',
      'click .edit_event_icon': 'showEditEventModal',
      'keyup #search-input-filter': 'searchEventByName',
    },
    navigateToEvent: function (e) {
      var itemId = $(e.currentTarget).attr('id').split(/_(.*)/);
      if (itemId && itemId.length)
        Backbone.history.navigate('event/' + encodeURIComponent(itemId[1]).replace(/%20/g, '+').toLowerCase() + '/' + itemId[0], true)
    },
    showSortByOptions: function () {
      if ($("#list_controller_dropdown").hasClass("display_block")) {
        $("#list_controller_dropdown").removeClass("display_block");
        $("#user_dashboard_sort_by_arrow").removeClass("gray_up_arrow_5px")
        $("#user_dashboard_sort_by_arrow").addClass("gray_down_arrow_5px")
      } else {
        $("#list_controller_dropdown").addClass("display_block");
        $("#user_dashboard_sort_by_arrow").addClass("gray_up_arrow_5px")
        $("#user_dashboard_sort_by_arrow").removeClass("gray_down_arrow_5px")
      }
    },
    showEditEventModal: function (e){
      e.stopImmediatePropagation()
      var eventNameId = $(e.currentTarget).parent().attr('id').split(/_(.*)/);
      this.options.eventId = eventNameId[0]
      var that = this
      $('.map_view_anchor_create_initial').addClass('visibility_hidden')
      ws.getEvent(false, eventNameId[0], encodeURIComponent(eventNameId[1]), function(result){
        e.preventDefault()
        if(result && result[0]){
          var startDate, endDate
          if(result[0].isLocal){
            var startDate = moment.tz(result[0].eventDate, common.decodeEntities(result[0].dateTimezone)).format('YYYY/MM/DD HH:mm');
            var endDate = moment.tz(result[0].eventDate, common.decodeEntities(result[0].dateTimezone)).add(result[0].duration, 'seconds').format('YYYY/MM/DD HH:mm');
          } else {
            startDate = moment(result[0].eventDate).format('YYYY/MM/DD HH:mm')
            endDate = moment(result[0].eventDate).add(result[0].duration, 'seconds').format('YYYY/MM/DD HH:mm')
          }
          ws.getLocation(result[0].locationMagicKey, result[0].id, function (location) {
            common.showCreateEventModal(function(){
              that.editEvent()
            }, {
              startDate: new Date(startDate),
              endDate: new Date(endDate),
            })
            $('.create_event_title').text('Edit Event')
            $('#submitButtonCreateEvent').attr('value', 'edit event')

            $('#createEventName').val(common.decodeEntities(result[0].name))
            $('#createEventDescription').val(common.decodeEntities(result[0].description))
            $('#isLocalCheckbox').prop('checked', result[0].isLocal)
            $('#createEventLocation').val(result[0].location)
            $('.map_view_anchor_create_initial').attr("src", "https://www.google.com/maps/embed/v1/search?key=AIzaSyDe_XPlHeAqc80-JsW9Qd2zU7u7ppRSEwQ&q=" + location.location.latitude + ',' +  location.location.longitude + "&zoom=16")
            $('.map_view_anchor_create_initial').removeClass('visibility_hidden')
            common.setLocationMagicKey(result[0].locationMagicKey)
            try {
              var imageId = parseInt(result[0].background)
              if(imageId){
                $('.selected_background_image').removeClass('selected_background_image')
                $('.common_modal__bg_picker_media').css({
                  'background': 'url(../Content/img/background/' + imageId + '_medium.jpg) no-repeat center',
                  'background-size': 'cover'})
                $('figure[data-image-id=' + imageId + ']').addClass('selected_background_image')
              }
            } catch(err){

            }
          }, function () {

          })
        }
      }, function (error) {
      
      });
    },
    editEvent: function(event){
      $('#createEventAlertDiv').addClass('display_none')
      var that = this
      
      var editEventDetails = {}
      editEventDetails.name = $('#createEventName').val()
      editEventDetails.location = $('#createEventLocation').val()
      editEventDetails.locationMagicKey = common.getLocationMagicKey()
      
      editEventDetails.backgroundImage = $(".selected_background_image").attr('data-image-id')
      if(!editEventDetails.backgroundImage)
        editEventDetails.backgroundImage = "1"
        
      editEventDetails.eventStartDate = $('#datePickerEventStartDate').val()
      editEventDetails.eventEndDate = $('#datePickerEventEndDate').val()
      editEventDetails.description = $('#createEventDescription').val()
      editEventDetails.id = this.options.eventId
      
      if(!$('#datePickerEventStartDate').hasClass('display_none')) {
        if($('#isLocalCheckbox').prop('checked')){
          editEventDetails.isLocal = 1
          editEventDetails.eventStartDate = moment.utc(new Date($('#datePickerEventStartDate').val())).format("YYYY/MM/DD HH:mm")
          editEventDetails.eventEndDate = moment.utc(new Date($('#datePickerEventEndDate').val())).format("YYYY/MM/DD HH:mm")
        }
        else {
          editEventDetails.isLocal = 0
          editEventDetails.eventStartDate = $('#datePickerEventStartDate').val()
          editEventDetails.eventEndDate = $('#datePickerEventEndDate').val()
        }
      }
      editEventDetails.jwtToken = ws.getAccessToken()

      editEventDetails.countryCode = common.getLocationCountryCode()
      
      this.editEventCallback(editEventDetails)
    },
    createEventRender: function(){
      this.render()
    },
    editEventCallback: function(editEventDetails){
      var self = this
      var v = grecaptcha.getResponse(recaptchaCreateEventClientId);
      if(v.length == 0)
      {          
        $('#createEventAlertDiv').removeClass('display_none')
        $('#submitButtonCreateEventLabel').text("You can't leave Captcha Code empty")
        grecaptcha.reset(recaptchaCreateEventClientId)
      } else {
        editEventDetails.recaptchaCode = v
        ws.editEvent(editEventDetails, function (resp) {
          $('#isLocalCheckbox').prop('checked', true)
          $('#createEventForm').find("input").not(':input[type=submit]').val("")
          $('#createEventModal').modal('toggle');

          self.render()
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
    searchEventsByOrderType: function (e) {
      if (!this.options)
        this.options = {}
      this.options.orderType = $(e.currentTarget).val()
      this.render()
    },
    searchEventByName: _.debounce(function (e) {
      if (!this.options)
        this.options = {}
      this.options.name = $(e.currentTarget).val()
      this.options.pageIndex = 0;
      this.renderEventList(this.options)
    }, 150),
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
      
      ws.getLoggedUserEvents(false, options.orderType, options.pageIndex, options.name, function (response) {
        if(!response) {
          response = JSON.stringify({ 
            results: [],
            totalResults: 0,
            error: true
          })
        }
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

      if(!options.orderType)
        options.orderType = 'popular';
      
      if(!options.pageIndex)
        options.pageIndex = 0;
      
      var template = _.template(userdashboardviewTemplate)
      
      ws.getLoggedUserEvents(true, options.orderType, options.pageIndex, options.name, function (response) {
        if(!response) {
          response = JSON.stringify({ 
            results: [],
            totalResults: 0,
            error: true
          })
        }
        that.$el.html(template({
          response: response,
          options: options,
          moment: moment
        }))
        that.$('.events_list_anchor').html(that.eventList.$el);
        that.eventList.render(response, options);
        that.hightlightSelectedOrderType(options.orderType) 
        
      }, function (error) {
        console.log('fail')
      })


      return this
    }

  })

  return UserdashboardviewView
})
