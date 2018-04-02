/* global define, console */

define([
  'jquery',
  'underscore',
  'moment',
  'countdown',
  'backbone',
  'router',
  'raven-js'
], function ($, _, moment, countdown, Backbone, Router, Raven) {
  'use strict'
  
  var init = function () {
    Raven.config('https://3052c3974a954844961eb5d77b606181@sentry.io/539304').install();
    // init router
    Router.init()
  }
  
  $(document).ready(function() {
      var cookie = false
      var cookieContent = $('.cookie-disclaimer')

      checkCookie()

      if (cookie === true) {
        cookieContent.hide()
      }

      function setCookie(cname, cvalue, exdays) {
        var d = new Date()
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
        var expires = "expires=" + d.toGMTString()
        document.cookie = cname + "=" + cvalue + "; " + expires
      }

      function getCookie(cname) {
        var name = cname + "="
        var ca = document.cookie.split(';')
        for (var i = 0; i < ca.length; i++) {
          var c = ca[i].trim()
          if (c.indexOf(name) === 0) return c.substring(name.length, c.length)
        }
        return "";
      }

      function checkCookie() {
        var check = getCookie("eventSnitchCookieLawCookie")
        if (check !== "") {
          return cookie = true
        } else {
            document.getElementsByClassName('cookie-disclaimer')[0].style.display = 'inline'
            return cookie = false
        }

      }
      $('.accept-cookie').click(function () {
        setCookie("eventSnitchCookieLawCookie", "accepted", 365)
        cookieContent.hide(500)
      })
      
      $('.cookie-policy-button').click(function(){
        Backbone.history.navigate('info/cookiepolicy', true);
      })
    })

  return {
    init: init
  }
})
