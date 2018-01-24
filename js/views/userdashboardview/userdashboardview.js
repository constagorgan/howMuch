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
      $(document).click(function (event) {
        if (!$(event.target).closest('#search_container_userdashboard_view').length) {
          that.closeSearchOverlayIfOpen(event)
        }
      })
    },
    events: {
      'click .list_controller_dropdown_item': 'getOrderContent',
      'click .btn_search': 'navigateToSearch',
      'keypress #search-input': 'onEnterNavigateToSearch',
      'click .category_event_li': 'navigateToEvent',
      'click .edit_event_icon': 'showEditEventModal'
    },
    navigateToEvent: function (e) {
      var itemId = $(e.currentTarget).attr('id').split('_');
      if (itemId && itemId.length)
        window.location.hash = '#event/' + encodeURIComponent(itemId[1]) + '/' + itemId[0]
    },
    showEditEventModal: function (e){
      e.stopImmediatePropagation()
      var eventNameId = $(e.currentTarget).parent().attr('id').split('_');
      this.options.eventId = eventNameId[0]
      var that = this
      ws.getEvent(false, eventNameId[0], eventNameId[1], function(result){
        e.preventDefault()
        if(result && result[0]){
          var startDate, endDate
          if(result[0].isLocal){
            var startDateUtc = moment.utc(result[0].eventDate).toDate();
            var endDateUtc = moment.utc(result[0].eventDate).add(result[0].duration, 'seconds').toDate();
            
            startDate  = moment(startDateUtc).local().format('YYYY/MM/DD HH:mm');
            endDate = moment(endDateUtc).local().format('YYYY/MM/DD HH:mm')
          } else {
            startDate = moment(result[0].eventDate).format('YYYY/MM/DD HH:mm')
            endDate = moment(result[0].eventDate).add(result[0].duration, 'seconds').format('YYYY/MM/DD HH:mm')
          }

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
      else 
        window.location.hash = '#search/' + encodeURIComponent(' ') 
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
      
      ws.getLoggedUserEvents(false, options.orderType, options.pageIndex, function (response) {
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
      
      ws.getLoggedUserEvents(true, options.orderType, options.pageIndex, function (response) {
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
