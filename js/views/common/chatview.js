/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "moment",
  "text!../../../templates/common/chatview.html",
  'chatHandler'
], function ($, _, Backbone, moment, commonChatViewTemplate, chatHandler) {
  "use strict";
  var socket;
  var CommonChatView = Backbone.View.extend({
    close: function () {
      chatHandler.leaveRoom()
      this.remove();
    },
    events: {
      'shown.bs.collapse #collapseOne': 'scrollBottom',
      'click #toggle_chat_btn': 'setArrowOrientation',
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
        $('.chat_toggle_arrow').addClass('glyphicon-chevron-up')
        $('.chat_toggle_arrow').removeClass('glyphicon-chevron-down')
      } else {
        $('#collapseOne').collapse("show")
        $('.chat_toggle_arrow').addClass('glyphicon-chevron-down')
        $('.chat_toggle_arrow').removeClass('glyphicon-chevron-up')
      }
    },
    sendMessage: function () {
      var message = JSON.stringify({
        message: $('#data').val(),
        token: localStorage.getItem('eventSnitchAccessToken') || sessionStorage.getItem('eventSnitchAccessToken')
      });
      $('#data').val('');
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
    },
    render: function () {
      var template = _.template(commonChatViewTemplate);
      this.$el.html(template({
        options: this.options
      }));
      var that = this
      var socket = chatHandler.getSocket()
      if (socket && socket.connected) {
        chatHandler.joinRoom(that.options)
      } else {
        socket.on('connect', function () {
          chatHandler.joinRoom(that.options)
        })
      }

      return this;
    }
  })
  
  return CommonChatView;

});
