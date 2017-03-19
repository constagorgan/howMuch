/* global define, console */

define([
  'jquery',
  'jquery-ui',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020',
  'countdown',
  'backbone',
  'ws',
  'text!../../../templates/categoryview/eventlistview.html'
], function ($, ui, _, moment, countdown, Backbone, ws, eventListTemplate) {
  'use strict'
  
  var EventListView = Backbone.View.extend({
//    initialize : function(){
//        this.listenTo(this.model, 'sync', this.render);
//    },
//
    render : function(){
//        this.$el.html(this.template(this.model.toJSON()));
      var template = _.template(eventListTemplate);
      this.$el.html(template({

      }));
      return this;
    }
  });
  
  return EventListView
})