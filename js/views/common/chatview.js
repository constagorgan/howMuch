/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "moment",
  "text!../../../templates/common/chatview.html",
  '../../../socket.io/socket.io.js'
], function ($, _, Backbone, moment, commonChatViewTemplate, io) {
  "use strict";
  var socket;
  var CommonChatView = Backbone.View.extend({
    close: function () {
      if (socket)
        socket.disconnect()
      this.remove();
    },
    events: {
      'shown.bs.collapse #collapseOne': 'scrollBottom',
      'click #toggle_chat_btn': 'setArrowOrientation',
      'keyup #data': 'enableSendAndEnterClick',
      'click #datasend': 'sendMessage'
    },
    scrollBottom: function () {
      $('#conversation').scrollTop($('#conversation')[0].scrollHeight)
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
      var message = JSON.stringify({message: $('#data').val(), token: localStorage.getItem('eventSnitchAccessToken') || sessionStorage.getItem('eventSnitchAccessToken')});
      $('#data').val('');
      socket.emit('sendchat', message);
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
      addHandlers(this.options, this.scrollBottom)
      return this;
    }
  })

  return CommonChatView;

  function addHandlers(options, scrollBottom) {

    $(function () {
//      var token = localStorage.getItem('eventSnitchAccessToken') || sessionStorage.getItem('eventSnitchAccessToken')
//      socket = io.connect('http://localhost:8081')
//      socket.on('connect', function () {
//        socket.emit('adduser', options.id + '_' + options.name)
//        if (token) {
//          isLoggedIn()
//        }
//      })
//      socket.on('updatechat', function (username, data, date) {
//        $('#chat_messages').append(getMessage(username, data, date))
//        scrollBottom()
//      })
//
//      socket.on('updatehistory', function (history) {
//        var sentMessagesBeforeReset = $('.chat-body-message-li');
//        if (!sentMessagesBeforeReset || !sentMessagesBeforeReset.length) {
//          _.each(history, function (hist) {
//            $('#chat_messages').append(getMessage(hist.user, hist.content, hist.created))
//          })
//        }
//      })
//      socket.on('disconnect', function () {
//        //reset connection = > no more update history? 
//      })
//      socket.on('notConnected', function () {
//        isGuest()
//      })
    })
  }

  function isLoggedIn() {
    $('.chat_footer_guest_user').addClass('display_none')
    $('.chat_footer_send_input').removeClass('display_none')
  }

  function isGuest() {
    $('.chat_footer_guest_user').removeClass('display_none')
    $('.chat_footer_send_input').addClass('display_none')
  }

  function getMessage(username, data, date) {
    return '<li class="chat-body-message-li">' +
      '<div class="chat-body clearfix">' +
      '<div class="chat_header">' +
      '<strong class="primary-font">' + username + '</strong> <small class="pull-right text-muted">' +
      moment(new Date(date)).format('YYYY-MM-DD hh:mm:ss') +
      '</small>' +
      '</div>' +
      '<p>' + data +
      '</p>' +
      '</div>' +
      '</li>';
  }

});
