/* global define, console */
/* jslint nomen: true */
define([
  'jquery',
  'underscore',
  'moment',
  'countdown',
  'backbone',
  'router',
  'views/mainview/mainview'
], function ($, _, moment, countdown, Backbone, Router, MainView) {
  'use strict'

  var init

  Router = Backbone.Router.extend({
    routes: {
      '': function () {
        var mainView

        mainView = new MainView()
        this.show(mainView)
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
      var mainEl = $('#main')

      mainEl.html(view.render().el)
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
