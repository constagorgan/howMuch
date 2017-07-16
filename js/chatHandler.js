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
  var receivedMessageInterval 
  
  if(config.chat.enable){
    socket = io.connect(config.chat.url)

    socket.on('connect', function () {

    })

    socket.on('updatechat', function (username, data, date) {
      $('#chat_messages').append(getMessage(username, data, date))
      scrollBottom()
      var isChatExpanded = $('#collapseOne').is(':visible')
      if(!isChatExpanded && !receivedMessageInterval){
        $('.panel-primary > .panel-heading').addClass('chat_received_message')
        receivedMessageInterval = setInterval(function() {
          $('.panel-primary > .panel-heading').toggleClass('chat_received_message')
        }, 1000);
      }
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
  
  function openCloseChat() {
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
      
      if(receivedMessageInterval) {
        clearInterval(receivedMessageInterval)
        $('.panel-primary > .panel-heading').removeClass('chat_received_message')
        receivedMessageInterval = null
      }
      
      setTimeout(function () {
        $('#collapseOne').collapse("show")
        $('.chat_toggle_arrow').addClass('glyphicon-chevron-down')
        $('.chat_toggle_arrow').removeClass('glyphicon-chevron-up')
      }, 800)
    }
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
    scrollBottom: scrollBottom,
    openCloseChat: openCloseChat
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
