/* global define, console */

define([
  'jquery',
  'underscore',
  '../../../bower_components/moment-timezone/builds/moment-timezone-with-data-2010-2020',
  'countdown',
  'backbone',
  'text!../../../templates/mainview/mainview.html'
], function ($, _,  moment, countdown, Backbone, mainviewTemplate) {
  'use strict'
  
 var getEvents = Backbone.Model.extend({
    idAttribute: '_id',
    initialize: function () {
      $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        options.crossDomain = {
          crossDomain: true
        }
      })
    },
    urlRoot : 'http://localhost:8003/'
  }) 
  
  
  var MainviewView = Backbone.View.extend({
          tagName: "div",
          className: "fullHeight",
          render: function () {
          var template = _.template(mainviewTemplate)
          this.$el.html(template({

          }))
          return this
        },
        initialize: function() {
            var events = new getEvents();
            events.fetch({
                data: {table: 'events', id: 0}
            }).done(function(response){ 

        })

      }     
    })
  
    
  return MainviewView
})

