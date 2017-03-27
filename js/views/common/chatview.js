/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "moment",
  "text!../../../templates/common/chatview.html",
  '../../../socket.io/socket.io.js'
], function ($, _, Backbone, moment, commonSideMenuTemplate, io) {
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
      'keypress #data': 'onEnterClickSendMessage',
      'click #datasend': 'sendMessage'
    },
    scrollBottom: function () {
      $('#conversation').scrollTop($('#conversation')[0].scrollHeight);
    },
    setArrowOrientation: function () {
      var isChatExpanded = $('#toggle_chat_btn').attr('aria-expanded');
      if (isChatExpanded == false) {
        $('.chat_toggle_arrow').addClass('glyphicon-chevron-up')
        $('.chat_toggle_arrow').removeClass('glyphicon-chevron-down')
      } else {
        $('.chat_toggle_arrow').addClass('glyphicon-chevron-down')
        $('.chat_toggle_arrow').removeClass('glyphicon-chevron-up')
      }
    },
    sendMessage: function () {
      var message = $('#data').val();
      $('#data').val('');
      socket.emit('sendchat', message);
    },
    onEnterClickSendMessage: function (e) {
      if (e.which == 13) {
        $(this).blur()
        $('#datasend').click()
      }
    },
    initialize: function (options) {
      this.options = options;
      _.bindAll(this, 'render');
    },
    render: function () {
      var template = _.template(commonSideMenuTemplate);
      this.$el.html(template({
        options: this.options
      }));
      addHandlers(this.options)
      return this;
    }
  })

  return CommonChatView;

  function addHandlers(options) {
    
    $(function () {
      var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0OTA2MzAwNDQsImp0aSI6Imd0dnhzU2w3XC8xUmRPSXZ6WlgwZGZpMEZadVVveWdcL3FmQ3pwekkwNkQyYz0iLCJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3Q6ODAwMSIsIm5iZiI6MTQ5MDYzMDA1NCwiZXhwIjoxNDkxMjM0ODU0LCJkYXRhIjp7ImlkIjoiNTUiLCJuYW1lIjoidGVzdGFzdCJ9fQ.taoAR1mBIfw7zIPwn--VOrcWKUhv4wDdCpBeS7qcy5g";
      socket = io.connect('http://localhost:8081');
      socket.on('connect', function () {
        socket.emit('authenticate', {token: token}) //send the jwt
      });
      socket.on('authenticated', function () {
        socket.emit('adduser', options.id + '_' + options.name)
      })
      socket.on('unauthorized', function(msg) {
        console.log("unauthorized: " + JSON.stringify(msg.data))
      })
      socket.on('updatechat', function (username, data, date) {
          $('#chat_messages').append(getMessage(username, data, date));
          $('#conversation').scrollTop($('#conversation')[0].scrollHeight);
      });

      socket.on('updatehistory', function(history){
        _.each(history, function(hist){$('#chat_messages').append(getMessage(hist.user, hist.content, hist.created))})
        $('#conversation').scrollTop($('#conversation')[0].scrollHeight)
      })
      socket.on('disconnect', function(){
        //reset connection = > no more update history? 
      })
    })
  }

  function getMessage(username, data, date) {
    return '<li>' +
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
