/*global define, console, alert */
/*jslint nomen: true */
define([

  "jquery",
  "underscore",
  "backbone",
  "moment",
  "../../../socket.io/socket.io.js"
], function ($, _, Backbone, moment, io) {
  "use strict";
  var socket

  socket = io.connect('http://localhost:8081')

  socket.on('connect', function () {
    socket.on('updatechat', function (username, data, date) {
      $('#chat_messages').append(getMessage(username, data, date))
      scrollBottom()
    })

    socket.on('updatehistory', function (history) {
      var sentMessagesBeforeReset = $('.chat-body-message-li');
      if (!sentMessagesBeforeReset || !sentMessagesBeforeReset.length) {
        _.each(history, function (hist) {
          $('#chat_messages').append(getMessage(hist.user, hist.content, hist.created))
        })
      }
    })
    socket.on('disconnect', function () {
      //reset connection = > no more update history? 
    })
    socket.on('notConnected', function () {
      isGuest()
    })
  })
  function scrollBottom(){
    $('#conversation').scrollTop($('#conversation')[0].scrollHeight)
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

  return {
    scrollBottom: scrollBottom,
    sendMessage: function(message){
      socket.emit('sendchat', message);
    },
    leaveRoom: function(){
      if(socket && socket.connected)
        socket.emit('leaveRoom');
    },
    getSocket: function () {
      return socket;
    },
    joinRoom: function (options) {
      socket.emit('adduser', options.id + '_' + options.name)
    }
  };
});
