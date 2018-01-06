/*global define, console, alert */
/*jslint nomen: true */
define([

  "jquery",
  "underscore",
  "backbone",
  "moment",
  "config",
  "../socket.io/socket.io.js"
], function ($, _, Backbone, moment, config, io) {
  "use strict";
  var socket
  var receivedMessageInterval 
  var currentEventName
  
  if(config.chat.enable){
    socket = io.connect(config.chat.url)

    socket.on('connect', function () {

    })

    socket.on('updatechat', function (username, data, date) {
      $('#chat_messages').append(getMessage(username, data, date))
      scrollBottom()
      notifyUpdateChat()
    })

    socket.on('updatehistory', function (history, event) {
      var firstMessage = 'Hello' + (localStorage.getItem('eventSnitchLoggedUser') ?  ' ' + localStorage.getItem('eventSnitchLoggedUser') : '') + '!'
      var secondMessage = 'Got any rumours about ' + currentEventName + '?'
      var thirdMessage = 'Let others know about it or ask them any questions you might have!'
      notifyUpdateChat()
      _.each(history, function (hist) {
        $('#chat_messages').prepend(getMessage(hist.user, hist.content, hist.created))
      })
      $('#chat_messages').prepend(getMessage('EventSnitch', thirdMessage, null))
      $('#chat_messages').prepend(getMessage('EventSnitch', secondMessage, null))
      $('#chat_messages').prepend(getMessage('EventSnitch', firstMessage, null))
      $('#chat_messages').prepend(getWelcomeMessage())
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
  
  function closeInterval(){
    if(receivedMessageInterval) {
      clearInterval(receivedMessageInterval)
      $('.panel-primary > .panel-heading').removeClass('chat_received_message')
      receivedMessageInterval = null
    }
  }
  
  function openCloseChat() {
    var isChatExpanded = $('#collapseOne').is(':visible')
    if (isChatExpanded) {    
      $('#collapseOne').collapse("hide")
      setTimeout(function () {
      $('.chat_box').removeClass('chat_fully_visible')
      $('.chat_toggle_arrow').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up')
      }, 400)
    } else {   
      $('.chat_box').addClass('chat_fully_visible')
      
      closeInterval()
      if($(window).width() > 1024) {
        setTimeout(function () {
          $('#collapseOne').collapse("show")
          $('.chat_toggle_arrow').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down')
        }, 800)
      } else {
        $('#collapseOne').collapse("show")
        $('.chat_toggle_arrow').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down')
      }
    }
  }
        
  function scrollBottom(){
    $('#conversation').scrollTop($('#conversation')[0].scrollHeight)
  }

  function isGuest() {
    $('.chat_footer_guest_user').removeClass('display_none')
    $('.chat_footer_send_input').addClass('display_none')
  }
  
  function notifyUpdateChat() {
    var isChatExpanded = $('#collapseOne').is(':visible')
      if(!isChatExpanded && !receivedMessageInterval) {
        $('.panel-primary > .panel-heading').addClass('chat_received_message')
        receivedMessageInterval = setInterval(function() {
          $('.panel-primary > .panel-heading').toggleClass('chat_received_message')
        }, 1000);
      }
  }
  
  function getWelcomeMessage() {
    return '<li class="chat-body-message-li">' +
      '<div class="chat_welcome_message_container">' +
      'Welcome ' + (localStorage.getItem('eventSnitchLoggedUser') ?  localStorage.getItem('eventSnitchLoggedUser') : '') + ' to the ' + currentEventName + ' countdown!' + 
      '<br>' +
      "Join the chat to find out information about the event from other users or share your own!" + 
      '</div' +
      '</li>';
  }

  function getMessage(username, data, date) {
      return '<li class="chat-body-message-li">' +
        '<div class="chat-body clearfix">' +
        '<div class="chat_header">' +
        '<p class="chat_username' + (localStorage.getItem('eventSnitchLoggedUser') && localStorage.getItem('eventSnitchLoggedUser') === username ? ' chat_own_message ' : "") + '" chat-username-initials="' + username.substring(0,2) + '">' + username + '<span class="chat_message_date">' + (date ? ($(window).width() > 1024 ? moment(new Date(date)).format('MMMM Do, YYYY HH:mm') : moment(new Date(date)).format('YYYY/MM/DD HH:mm')) : '') + '</span></p>' +
        '</div>' +
        '<div class="chat_message_container">' +
        '<p class="chat_message">' + data +
        '</p>' +
        '</div>' +
        '</div>' +
        '</li>';
// code for tooltip on chat
//    else 
//       return '<li class="chat-body-message-li">' +
//        '<div class="chat-body clearfix">' +
//        '<div class="chat_header">' +
//        '<a data-toggle="tooltip" + data-placement="left" title="' + moment(new Date(date)).format('MMMM Do, YYYY HH:mm') + '"><p class="chat_username' + (localStorage.getItem('eventSnitchLoggedUser') && localStorage.getItem('eventSnitchLoggedUser') === username ? ' chat_own_message ' : "") + '" chat-username-initials="' + username.substring(0,2) + '">' + username + '</p></a>' +
//        '</div>' +
//        '<div class="chat_message_container">' +
//        '<p class="chat_message">' + data +
//        '</p>' +
//        '</div>' +
//        '</div>' +
//        '</li>';
  }

  var chatHandlerFunctions = {
    scrollBottom: scrollBottom,
    openCloseChat: openCloseChat,
    closeInterval: closeInterval
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
      currentEventName = options.name
      socket.emit('adduser', options.id + '_' + options.name)
    }
  }
  return chatHandlerFunctions;
});
