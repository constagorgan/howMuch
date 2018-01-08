/* global define, console */

define([
  'jquery',
  'underscore',
  'moment',
  'countdown',
  'backbone',
  'router',
  'bootstrap'
], function ($, _, moment, countdown, Backbone, Router) {
  'use strict'

  var init = function () {
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
          window.location.hash = '#info/cookiepolicy'
      })
    })

  return {
    init: init
  }
})
