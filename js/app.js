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

  return {
    init: init
  }
})
