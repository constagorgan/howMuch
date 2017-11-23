/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "moment",
  "config",
  "text!../../../templates/common/chatview.html",
  'chatHandler',
  'userAgent',
  'common'
], function ($, _, Backbone, moment, config, commonChatViewTemplate, chatHandler, userAgent, common) {
  "use strict";
  var socket;
  var mobileOperatingSystem = userAgent.getMobileOperatingSystem()
  var iosBrowserIsSafari

  if (mobileOperatingSystem === 'iOS')
    iosBrowserIsSafari = userAgent.getIOSSafari()

  var CommonChatView = Backbone.View.extend({
    close: function () {
      if (config.chat.enable)
        chatHandler.leaveRoom()

      if ($(window).width() <= 1024) {
        $('#conversation').unbind('touchmove DOMMouseScroll', stopScrollEventPropagationCallback);
        $('#conversation').unbind('.swipeChatStart');
        $('#conversation').unbind('.swipeChatMove');
      } else {
        $('#conversation').unbind('mousewheel DOMMouseScroll', stopScrollEventPropagationCallback);
      }
      $(window).unbind('resize', setConversationContainerHeight);


      chatHandler.closeInterval()
      this.remove();
    },
    events: {
      'shown.bs.collapse #collapseOne': 'scrollBottom',
      'click .panel-heading': 'openCloseChat',
      'keyup #data': 'enableSendAndEnterClick',
      'input #data': 'enableSend',
      'click #datasend': 'sendMessage',
      'click .chat_log_in_btn': 'signInChat'
    },
    signInChat: function() {
      common.signIn()
    },
    scrollBottom: function () {
      chatHandler.scrollBottom()
    },
    openCloseChat: function () {
      chatHandler.openCloseChat()
    },
    sendMessage: function () {
      var message = JSON.stringify({
        message: $('#data').val(),
        token: localStorage.getItem('eventSnitchAccessToken') || sessionStorage.getItem('eventSnitchAccessToken')
      });
      if(!localStorage.getItem('eventSnitchAccessToken') && !sessionStorage.getItem('eventSnitchAccessToken')) {
        try {
          localStorage.setItem('eventSnitchChatSignInText', $('#data').val())
          localStorage.setItem('eventSnitchChatSignInId', this.options.id)
        } catch (e) {

        }
      }
      $('#data').val('')
      $("#datasend").attr("disabled", true);

      if (config.chat.enable)
        chatHandler.sendMessage(message)
    },
    enableSend: function (e) {
      var message = $('#data').val();
      if (message && message.length > 0) {
        $('#datasend').removeAttr("disabled");
      } else {
        $("#datasend").attr("disabled", true);
      }
    },
    enableSendAndEnterClick: function (e) {
      var message = $('#data').val();
      if (message && message.length > 0) {
        if (e.which == 13) {
          $(this).blur()
          $('#datasend').click()
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
    },
    render: function () {
      if (mobileOperatingSystem === 'iOS' && !iosBrowserIsSafari) {
        $(document).bind('resize', setConversationContainerHeight);
      }
      else
        $(window).bind('resize', setConversationContainerHeight);
      var template = _.template(commonChatViewTemplate);
      this.$el.html(template({
        options: this.options
      }));
      var that = this
      
      setConversationContainerHeight()
      stopScrollEventPropagation()
      
      if (config.chat.enable) {
        var socket = chatHandler.getSocket()
        if (socket && socket.connected) {
          chatHandler.joinRoom(that.options)
        } else {
          socket.on('connect', function () {
            chatHandler.joinRoom(that.options)
          })
        }
      }
      setSessionStorageChatText(that.options)
      return this;
    }
  })

  function setSessionStorageChatText(options) {
    try {
      if(localStorage.getItem('eventSnitchChatSignInText') && localStorage.getItem('eventSnitchChatSignInId') && localStorage.getItem('eventSnitchChatSignInId') === options.id)
        $('#data').val(localStorage.getItem('eventSnitchChatSignInText'))
        if($('#data').val().length > 0) {
          $("#datasend").attr("disabled", false)
        }
        localStorage.setItem('eventSnitchChatSignInId', "")
        localStorage.setItem('eventSnitchChatSignInText', "")
    } catch(e) {
      
    }
  }

  function setConversationContainerHeight() {
    if ($(window).width() <= 1024) {
      $('#conversation').outerHeight(window.innerHeight - $('.header').outerHeight() - $('.panel-heading').outerHeight() - 30) //30 is equal to $('.panel-footer').outerHeight()) it is 0 at render because it is collapsed
    } else {
      $('#conversation').outerHeight($(window).height() - $('.header').outerHeight() - 35 - $('.panel-heading').outerHeight() - 30 - $('.crawler__header').outerHeight()) //30 is equal to $('.panel-footer').outerHeight()) it is 0 at render because it is collapsed 
        //35 is the difference between the header container height and the and it's parent
    }
  }

  function stopScrollEventPropagationCallback(e) {
    var delta = e.originalEvent.wheelDelta || e.originalEvent.detail;
    this.scrollTop += (delta < 0 ? 1 : -1) * -8;
    e.preventDefault();
  }

  function stopScrollEventPropagationCallbackMobile(e) {}

  function stopScrollEventPropagation(e) {
    if ($(window).width() <= 1024) {
      var y = 0;

      function touchStart(event) {
        y = event.originalEvent.touches[0].pageY;
      }

      function touchMove(event) {
        var convScrollTop = $('#conversation').scrollTop()
        $('#conversation').scrollTop(convScrollTop + (y - event.originalEvent.touches[0].pageY < 0 ? 1 : -1) * -11)
        event.preventDefault()
      }
      $('#conversation').bind('touchstart.swipeChatStart', touchStart);
      $('#conversation').bind('touchmove.swipeChatMove', touchMove);
      $('#chatHeader').bind('touchmove.swipeOutsideChat', function (e) {
        e.preventDefault()
      })
      $('#chatFooter').bind('touchmove.swipeOutsideChat', function (e) {
        e.preventDefault()
      })
    } else {
      $('#conversation').bind('mousewheel DOMMouseScroll', stopScrollEventPropagationCallback);
    }
  }

  return CommonChatView;

});
