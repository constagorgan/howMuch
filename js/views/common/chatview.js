/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "moment",
  "config",
  "text!../../../templates/common/chatview.html",
  'chatHandler'
], function ($, _, Backbone, moment, config, commonChatViewTemplate, chatHandler) {
  "use strict";
  var socket;
  var CommonChatView = Backbone.View.extend({
    close: function () {
      if (config.chat.enable)
        chatHandler.leaveRoom()

      this.remove();
    },
    events: {
      'shown.bs.collapse #collapseOne': 'scrollBottom',
      'click .panel-heading': 'setArrowOrientation',
      'keyup #data': 'enableSendAndEnterClick',
      'click #datasend': 'sendMessage'
    },
    scrollBottom: function () {
      chatHandler.scrollBottom()
    },
    setArrowOrientation: function () {
      var isChatExpanded = $('#collapseOne').is(':visible')
      if (isChatExpanded) {    
        $('#collapseOne').collapse("hide")
        setTimeout(function () {
          $('.chat_box').removeClass('chat_fully_visible')
          $('.chat_toggle_arrow').addClass('glyphicon-chevron-up')
          $('.chat_toggle_arrow').removeClass('glyphicon-chevron-down') 
        }, 400)
      } else {   
        $('.chat_box').addClass('chat_fully_visible')
        setTimeout(function () {
            $('#collapseOne').collapse("show")
            $('.chat_toggle_arrow').addClass('glyphicon-chevron-down')
            $('.chat_toggle_arrow').removeClass('glyphicon-chevron-up')
        }, 800)
      }
    },
    sendMessage: function () {
      var message = JSON.stringify({
        message: $('#data').val(),
        token: localStorage.getItem('eventSnitchAccessToken') || sessionStorage.getItem('eventSnitchAccessToken')
      });
      $('#data').val('')
      
      if (config.chat.enable)
        chatHandler.sendMessage(message)
    },
    enableSendAndEnterClick: function (e) {
      var message = $('#data').val();
      if (message && message.length > 0) {
        if (e.which == 13) {
          $(this).blur()
          $('#datasend').click()
          $("#datasend").attr("disabled", true);
        } else {
          $('#datasend').removeAttr("disabled");
        }
      } else {
        $("#datasend").attr("disabled", true);
      }
    },
    initialize: function (options) {
      this.options = options;
      _.bindAll(this, 'render');
      $(window).on('resize', setConversationContainerHeight);
    },
    render: function () {
      var template = _.template(commonChatViewTemplate);
      this.$el.html(template({
        options: this.options
      }));
      var that = this
      
      setConversationContainerHeight()
      stopScrollEventPropagation()      
      
      if (config.chat.enable){
      var socket = chatHandler.getSocket()
        if (socket && socket.connected) {
          chatHandler.joinRoom(that.options)
        } else {
          socket.on('connect', function () {
            chatHandler.joinRoom(that.options)
          })
        }
      }
      return this;
    }
  })
  
  function setConversationContainerHeight(){
    if($(window).width() < 768){
      $('#conversation').outerHeight($(window).height() - $('.header').outerHeight() - $('.panel-heading').outerHeight() - 30) //30 is equal to $('.panel-footer').outerHeight()) it is 0 at render because it is collapsed
    } else {
      $('#conversation').outerHeight($(window).height() - $('.header').outerHeight() - 35 - $('.panel-heading').outerHeight() - 30 - $('.crawler__header').outerHeight()) //30 is equal to $('.panel-footer').outerHeight()) it is 0 at render because it is collapsed 
      //35 is the difference between the header container height and the and it's parent
    }
  }
  
  function stopScrollEventPropagation(e) {
    if($(window).width() < 768){
      //to do when normal scroll is added to phone
    } else {
      $('#conversation').bind('mousewheel DOMMouseScroll', function(e) {
        var delta = e.originalEvent.wheelDelta || e.originalEvent.detail;
        this.scrollTop += ( delta < 0 ? 1 : -1 ) * 8;
        e.preventDefault();
      });
    }
  }
  
  return CommonChatView;

});
