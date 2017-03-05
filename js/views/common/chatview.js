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
      // tell server to execute 'sendchat' and send along one parameter
      socket.emit('sendchat', message);
    },
    onEnterClickSendMessage: function (e) {
      if (e.which == 13) {
        $(this).blur();
        $('#datasend').focus().click();
      }
    },
    initialize: function (options) {
      this.options = options;
      _.bindAll(this, 'render');
    },
    render: function () {

      var template = _.template(commonSideMenuTemplate);
      this.$el.html(template({

      }));
      socket = io.connect('http://eventsnitch.go.ro:8080')
      addHandlers(this.options)
      return this;
    }
  })

  return CommonChatView;

  function addHandlers(options) {
    $(function () {
      socket.on('connect', function () {
        //Trimis usernameul cumva, sa nu fie editabil cu un string, sa isi ia din sesiune cumva, nu stiu
        if (options && options.name)
          socket.emit('adduser', options.name);
      });

      // listener, whenever the server emits 'updatechat', this updates the chat body
      socket.on('updatechat', function (username, data, date) {
        $('#chat_messages').append(getMessage(username, data, date));
        $('#conversation').scrollTop($('#conversation')[0].scrollHeight);
      });
      socket.on('ping', function (data) {
        socket.emit('pong', {
          beat: 1
        });
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
