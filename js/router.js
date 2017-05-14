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
  'views/notfoundview/notfoundview',
  'views/userdashboardview/userdashboardview',
  'common'
], function ($, _, moment, countdown, Backbone, Router, ws, CommonHeaderView, CommonFooterView, SideMenuView, TimerView, MainView, CategoryView, ConfirmSignUpView, ConfirmResetPasswordView, NotFoundView, UserDashboardView, common) {
  'use strict'

  var init

  Router = Backbone.Router.extend({
    initialize: function() {
      changeHomepageBg();
    },
    execute: function(callback, args) {
      common.checkUserTimezone();
      if(localStorage.getItem('eventSnitchAccessToken') || sessionStorage.getItem('eventSnitchAccessToken'))
        ws.refreshAccessToken()
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
      'event/:name/:id': 'dynamicRoute',
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
      },
      'myEvents': function(){
        var userDashboardView
        userDashboardView = new UserDashboardView()
        this.show(userDashboardView)
      },
      '*notfound': function(){
        var notFoundView

        notFoundView = new NotFoundView()
        this.show(notFoundView)
      }
    },
    show: function (view, isTimerView) {
      this.view && (this.view.close ? this.view.close() : this.view.remove());
      this.view = view;
      var timerEl = $('#main'),
          headerEl = $('#header_container'),
          sideMenuEl = $('#side_menu_container'),
          footerEl = $('#footer_container'),
          chatEl = $('#chat_container');
      
      if(!this.headerView){
        this.headerView = new CommonHeaderView();
        headerEl.html(this.headerView.render().el);
      }
      this.sideMenuView = new SideMenuView();
      sideMenuEl.html(this.sideMenuView.render().el);
      
      timerEl.html(view.render().el);
      
      // Checks if path starts with anything other than "event"
      if(isTimerView) {
        if(this.footerView) {
            this.footerView.close ? this.footerView.close() : this.footerView.remove();    
        }   
      } else {
        this.footerView = new CommonFooterView();
        footerEl.html(this.footerView.render().el);
        $('html').css({
          'background': 'url(../Content/img/homepage_bg.jpg) no-repeat center center fixed',
          'background-size': 'cover'
        })
      }
      
    },
    dynamicRoute: function(name, id){
        var timerView

        timerView = new TimerView({
          name: name,
          id: id
        })
        this.show(timerView, true)
    }
  })
  
  function changeHomepageBg() {
    $('html').css({'background': 'url(../Content/img/homepage_bg.jpg) no-repeat center center fixed', 'background-size': 'cover'})
  }

  init = function () {
    var router = new Router()
    Backbone.history.start()
  }

  return {
    init: init
  }
})
