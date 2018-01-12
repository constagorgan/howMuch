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
  'views/cookiepolicyview/cookiepolicyview',
  'views/privacypolicyview/privacypolicyview',
  'views/contact/contact',
  'common',
  'config'
], function ($, _, moment, countdown, Backbone, Router, ws, CommonHeaderView, CommonFooterView, SideMenuView, TimerView, MainView, CategoryView, ConfirmSignUpView, ConfirmResetPasswordView, NotFoundView, UserDashboardView, CookiePolicyView, PrivacyPolicyView, ContactView, common, config) {
  'use strict'

  var init
  var vent = _.extend({}, Backbone.Events);

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
      var metaDescription = "Check out the latest news about the hottest events around the globe. Join the countdowns on Event Snitch or create your own and share them with the world!"
      $("meta[name='description']").attr("content", metaDescription)
      $(document).attr("title", "Event Snitch")
      $("meta[name='og:image']").attr("content", 'https://eventsnitch.com/Content/img/eventsnitch_logo_black_200x200.png')
      $("meta[name='og:description']").attr("content", "Check out the latest news about the hottest events around the globe. Join the countdowns on Event Snitch or create your own and share them with the world!")
      $("meta[name='og:title']").attr("content", "Event Snitch")
      $("meta[name='og:url']").attr("content", "https://www.eventsnitch.com")
    },
    routes: {
      '': function () {
        var mainView
        updateAnalytics()
        mainView = new MainView()
        this.show(mainView)
      },
      'event/:name/:id': 'dynamicRoute',
      'category/:categoryName': function(categoryName) {
       var categoryView
       updateAnalytics()
       categoryView = new CategoryView({
         categoryName: categoryName.split('&')[0],
         countryCode: categoryName.split('&')[1]
       })
       this.show(categoryView)
      },
      'search/:searchName': function(searchName) {
         var categoryView
         updateAnalytics()
         categoryView = new CategoryView({
           name: searchName
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
        userDashboardView = new UserDashboardView({vent: vent})
        this.show(userDashboardView)
      },
      'contact': function() {
        var contactView
        updateAnalytics()
        contactView = new ContactView()
        this.show(contactView, false, true)
      },
      'info/cookiepolicy': function(){
        var cookiePolicyView
        cookiePolicyView = new CookiePolicyView()
        this.show(cookiePolicyView)
      },
      'info/privacypolicy': function() {
        var privacyPolicyView
        privacyPolicyView = new PrivacyPolicyView()
        this.show(privacyPolicyView) 
      },
      '*notfound': function(){
        var notFoundView
        notFoundView = new NotFoundView()
        this.show(notFoundView)
      }
    },
    show: function (view, isTimerView, isContactView) {
      this.view && (this.view.close ? this.view.close() : this.view.remove());
      this.view = view;
      var timerEl = $('#main'),
          headerEl = $('#header_container'),
          sideMenuEl = $('#side_menu_container'),
          footerEl = $('#footer_container'),
          chatEl = $('#chat_container');
      
      if(!this.headerView){
        this.headerView = new CommonHeaderView({vent: vent});
        headerEl.html(this.headerView.render().el);
      }
      this.sideMenuView = new SideMenuView();
      sideMenuEl.html(this.sideMenuView.render().el);
      
      timerEl.html(view.render().el);
      
      // Checks if path starts with anything other than "event"
      if (isTimerView) {
        $('#header_container').addClass('fixed').removeClass('without_fixed_header');
        if(this.footerView) {
          this.footerView.close ? this.footerView.close() : this.footerView.remove();    
        }
      } else if (isContactView) {
        $('#header_container').removeClass('fixed').addClass('without_fixed_header');
        this.footerView = new CommonFooterView();
        footerEl.html(this.footerView.render().el);
        $('html').css({
          'background': 'url(../Content/img/background/contact_bg_large.jpg) no-repeat center center fixed',
          'background-size': 'cover'
        })
      } else {
        $('#header_container').removeClass('fixed').addClass('without_fixed_header');
        this.footerView = new CommonFooterView();
        footerEl.html(this.footerView.render().el);
        $('html').css({
          'background': 'url(../Content/img/background/homepage_bg_large.jpg) no-repeat center center fixed',
          'background-size': 'cover'
        })
      }
      
    },
    dynamicRoute: function(name, id){
      var timerView
      updateAnalytics()
      timerView = new TimerView({
        name: name,
        id: id
      })
      this.show(timerView, true)
    }
  })
  
  function changeHomepageBg() {
    $('html').css({'background': 'url(../Content/img/background/homepage_bg_large.jpg) no-repeat center center fixed', 'background-size': 'cover'})
  }
  
  function updateAnalytics() {
    try {
      if(gtag && config.client.isProduction) {
        var path = Backbone.history.getFragment()
        gtag('config', 'UA-109524202-1', {
          'page_path': path
        });
      }
    } catch(e) {
      
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
