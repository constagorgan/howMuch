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
  'views/categoryview/categoryview'
], function ($, _, moment, countdown, Backbone, Router, CommonHeaderView, CommonFooterView, SideMenuView, TimerView, MainView, CategoryView) {
  'use strict'

  var init

  Router = Backbone.Router.extend({
    initialize: function() {
      $('html').css({'background': 'url(../Content/img/homepage_bg.jpg) no-repeat center center fixed', 'background-size': 'cover'})
    },
    routes: {
      '': function () {
        var mainView

        mainView = new MainView()
        this.show(mainView)
      },
      ':event/:name/:id': 'dynamicRoute',
      'category/:categoryName': function(categoryName) {
         var categoryView
         
         categoryView = new CategoryView({
           categoryName: categoryName.split('&')[0],
           countryCode: categoryName.split('&')[1]
         })
         this.show(categoryView)
      },
      'search/:searchName': function(searchName) {
         var categoryView
         
         categoryView = new CategoryView({
           name: searchName
         })
         this.show(categoryView)
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

        timerView = new TimerView({
          name: name,
          id: id
        })
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
