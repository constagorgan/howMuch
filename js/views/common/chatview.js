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
    initialize: function () {
      Backbone.history.on("route", function (route, router) {
        if (socket && socket.connected)
          socket.disconnect();
      });
    },
    render: function () {

      var template = _.template(commonSideMenuTemplate);
      this.$el.html(template({

      }));
      socket = io.connect('http://eventsnitch.go.ro:8080')
      addHandlers()
      return this;
    }
  })

  return CommonChatView;

  function addHandlers() {
    $(function () {
      socket.on('connect', function () {
        //replace eventName with event.name after consta sends the id as parameter
        debugger;
        socket.emit('adduser', 'justinn', 'EVENTNAME');
        //Trimis usernameul cumva, sa nu fie editabil cu un string, sa isi ia din sesiune cumva, nu stiu
        socket.emit('adduser', 'EVENTNAME');
      });

      // listener, whenever the server emits 'updatechat', this updates the chat body
      socket.on('updatechat', function (username, data, date) {
        $('#chatMessages').append(getMessage(username, data, date));
        $('#conversation').scrollTop($('#conversation')[0].scrollHeight);
      });
      socket.on('ping', function (data) {
        socket.emit('pong', {
          beat: 1
        });
      })

      $('#collapseOne').on('shown.bs.collapse', function () {
        $('#conversation').scrollTop($('#conversation')[0].scrollHeight);
      })
      
      $('#datasend').click(function () {
        var message = $('#data').val();
        $('#data').val('');
        // tell server to execute 'sendchat' and send along one parameter
        socket.emit('sendchat', message);
      });

      // when the client hits ENTER on their keyboard
      $('#data').keypress(function (e) {
        if (e.which == 13) {
          $(this).blur();
          $('#datasend').focus().click();
        }
      })

    })
  }

  function getMessage(username, data, date) {
    return '<li>' +
      '<div class="chat-body clearfix">' +
      '<div class="chatHeader">' +
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
