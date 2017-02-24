/* global define, console */
/* jslint nomen: true */
define([
  'jquery',
  'underscore',
  'moment',
  'countdown',
  'backbone',
  'router',
  'views/common/headerview',
  'views/common/footerview',
  'views/common/sidemenu',
  'views/timerview/timerview',
  'views/mainview/mainview',
  'views/upcomingview/upcomingview'
], function ($, _, moment, countdown, Backbone, Router, CommonHeaderView, CommonFooterView, SideMenuView, TimerView, MainView, UpcomingView) {
  'use strict'

  var init

  Router = Backbone.Router.extend({
    routes: {
      '': function () {
        var mainView

        mainView = new MainView()
        this.show(mainView)
      },
      ':event/:name/:id' : 'dynamicRoute',
      'upcoming': function () {
          var upcomingView

          upcomingView = new UpcomingView()
          this.show(upcomingView)
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
      this.view && (this.view.close ? this.view.close() : this.view.remove());
      this.view = view;
      var timerEl = $('#main'),
          headerEl = $('#header_container'),
          sideMenuEl = $('#side_menu_container'),
          footerEl = $('#footer_container'),
          chatEl = $('#chat_container');

      this.headerView = new CommonHeaderView();
      headerEl.html(this.headerView.render().el);
      
      this.sideMenuView = new SideMenuView();
      sideMenuEl.html(this.sideMenuView.render().el);
      
      timerEl.html(view.render().el);
      
      this.footerView = new CommonFooterView();
      footerEl.html(this.footerView.render().el);
      
    },
    dynamicRoute: function(mod, name, id){
        var timerView

        timerView = new TimerView({name: name, id: id})
        this.show(timerView)
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
