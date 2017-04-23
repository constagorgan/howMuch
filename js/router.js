/* global define, console */
/* jslint nomen: true */
define([
  'jquery',
  'underscore',
  'moment',
  'countdown',
  'backbone',
  'router',
  'ws',
  'views/common/headerview',
  'views/common/footerview',
  'views/common/sidemenu',
  'views/timerview/timerview',
  'views/mainview/mainview',
  'views/categoryview/categoryview',
  'views/emailresponseview/confirmsignupview',
  'views/emailresponseview/confirmresetpassview',
  '../Content/resources/resources'
], function ($, _, moment, countdown, Backbone, Router, ws, CommonHeaderView, CommonFooterView, SideMenuView, TimerView, MainView, CategoryView, ConfirmSignUpView, ConfirmResetPasswordView, Resources) {
  'use strict'

  var init

  Router = Backbone.Router.extend({
    initialize: function() {
//      ws.refreshAccessToken()
      changeHomepageBg();
    },
    execute: function(callback, args) {
      checkUserTimezone();
      
      if (callback) {
        //this must be called to pass to next route
        callback.apply(this, args);
      }
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
           name: searchName,
           userName: searchName
         })
         this.show(categoryView)
      },
      'searchUser/:searchName': function(searchName) {
         var categoryView
         
         categoryView = new CategoryView({
           userName: searchName
         })
         this.show(categoryView)
      },
      'confirmSignUp?email=:email&key=:signUpToken': function(email, token) {
        var confirmSignUpView
        confirmSignUpView = new ConfirmSignUpView({
          email: email,
          token: token
        })
        this.show(confirmSignUpView)
      },
      'confirmResetPassword?email=:email&username=:username&key=:resetToken': function(email, username, token) {
        var confirmResetPasswordView
        confirmResetPasswordView = new ConfirmResetPasswordView({
          email: email,
          token: token,
          username: username
        })
        this.show(confirmResetPasswordView)
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
  
  function changeHomepageBg() {
    $('html').css({'background': 'url(../Content/img/homepage_bg.jpg) no-repeat center center fixed', 'background-size': 'cover'})
  }
  
  function checkUserTimezone() {
    if (localStorage.getItem('userTimezone') == null || !isTimezoneCompliant())
      storeDefaultUserTimezone();
  }
  
  // Stores the "default" user timezone name - the one guess()-ed by Moment.js
  function storeDefaultUserTimezone() {
    var currentTimezoneName = moment.tz(moment.tz.guess())
    // Put the timezone into local storage
    localStorage.setItem('userTimezone', currentTimezoneName._z.name);
  }
  
  // Check if the set timezone is correctly named
  function isTimezoneCompliant() {
    var timezoneExists = _.find(Resources.timezones, function(el) {
      return el === localStorage.getItem('userTimezone')
    })
    console.log(timezoneExists)
    if(timezoneExists) {
//console.log("it's compliant")
      return true;
    } else {
//console.log("it's NOT compliant")
      return false;
    }
  }

  init = function () {
    var router = new Router()
    Backbone.history.start()
  }

  return {
    init: init
  }
})
