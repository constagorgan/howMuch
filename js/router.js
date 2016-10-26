/* global define, console */
/* jslint nomen: true */
define([
  'jquery',
  'underscore',
  'moment',
  'countdown',
  'backbone',
  'router',
  'views/timerview/timerview',
  'views/mainview/mainview'
], function ($, _, moment, countdown, Backbone, Router, TimerView, MainView) {
  'use strict'

  var init

  Router = Backbone.Router.extend({
    routes: {
      '': function () {
        var mainView
        
        mainView = new MainView()
        this.show(mainView)
      },
      'event': function() {           
        var timerView
        
        timerView = new TimerView()
        this.show(timerView)
      
      }
      /* '(:dashboard)(/:minDate)(/:maxDate)': function (dashboard, minDate, maxDate) {
        var dashboardView = new DashboardView({
          minDate: minDate,
          maxDate: maxDate
        })
        this.show(dashboardView, 'PDF Review', 'Dashboard')
      } */
    },
    show: function (view) {
      var timerEl = $('#main')

      timerEl.html(view.render().el)
    }
  })

  init = function () {
    var router = new Router()
    Backbone.history.start()
  }

  return {
    init: init
  }
})
