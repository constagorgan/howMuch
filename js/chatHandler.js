/*global define, console, alert */
/*jslint nomen: true */
define([

  "jquery",
  "underscore",
  "backbone",
  "moment",
  "config",
  "../../../socket.io/socket.io.js"
], function ($, _, Backbone, moment, config, io) {
  "use strict";
  var socket

  if(config.chat.enable){
    socket = io.connect(config.chat.url)

  socket.on('connect', function () {
  
  })
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
    $('[data-toggle="tooltip"]').tooltip({
      html: true
    });
      
  })
  socket.on('disconnect', function () {
      //reset connection = > no more update history? 
  })
  socket.on('notConnected', function () {
    isGuest()
  })
  
  }
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
      '<a data-toggle="tooltip" data-placement="left" title="' + moment(new Date(date)).format('MMMM Do, YYYY HH:mm') + '"><p class="chat_username' + (localStorage.getItem('eventSnitchLoggedUser') && localStorage.getItem('eventSnitchLoggedUser') === username ? ' chat_own_message ' : "") + '" chat-username-initials="' + username.substring(0,2) + '">' + username + '</p></a>' +
      '</div>' +
      '<div class="chat_message_container">' +
      '<p class="chat_message">' + data +
      '</p>' +
      '</div>' +
      '</div>' +
      '</li>';
  }

  var chatHandlerFunctions = {
    scrollBottom: scrollBottom
  }
  
  if (config.chat.enable){
    chatHandlerFunctions.sendMessage = function(message){
      socket.emit('sendchat', message);
    }
    chatHandlerFunctions.leaveRoom = function(){
      if(socket && socket.connected)
        socket.emit('leaveRoom');
    }
    chatHandlerFunctions.getSocket = function () {
      return socket;
    }
    chatHandlerFunctions.joinRoom = function (options) {
      socket.emit('adduser', options.id + '_' + options.name)
    }
  }
  return chatHandlerFunctions;
});
