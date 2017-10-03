/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "ws",
], function ($, _, Backbone, ws) {
  "use strict";
  
  var crawler = {}

  
  // random de la 1 la cate surse avem
  // in functie de ce pica la random, splice pe elementul de 0 (cel mai important), si scos din array, pus in arrayul mare
  // contor pe fiecare splice, sa nu fie mai mult de 3 la rand din fiecare
  // contor impartit la 3 si sa se duca pe ala cu cele mai putine daca e diferenta mare intre toate fata de altul
  
//  var arrayCuChestiiDeLaTwitter = [a,b,c,d,e]
//  var arrayCuChestiiDeLaYoutube = [f,g,h,i,j,k]
//  var arrayCuChestiiDeLaFacebook = [1,2,3,4,5, 6]
//  var arrayCuChestiiDeLaStiri = [6,7,8,9,10]

  function buildFacebookPost(content, secondaryContent) {
    var post
    var testLink = 'https://images.unsplash.com/photo-1473042904451-00171c69419d?dpr=1&auto=compress,format&fit=crop&w=1975&h=&q=80&cs=tinysrgb&crop='
    
    post =
      '<div class="crawler__slot">' +
        '<div class="crawler__slot-logo fb"></div>' +
        '<div class="crawler__slot-content">' + content + '</div>' +
        '<div class="crawler__slot-secondary fb">' +
          '<div class="crawler__slot-secondary-content>' +
            '<img class="crawler__slot-image" src="' + secondaryContent + '">' +
          '</div>' +
        '</div>' +
      '</div>'
    
    return post
  }
  
  function buildTwitterPost(content, secondaryContent) {
    var post
    
    post =
      '<div class="crawler__slot">' +
        '<div class="crawler__slot-logo tw"></div>' +
        '<div class="crawler__slot-content">' + content + '</div>' +
        '<div class="crawler__slot-secondary tw">' +
          '<div class="crawler__slot-secondary-content>' +
            '<img class="crawler__slot-image" src="' + secondaryContent + '">' +
          '</div>' +
        '</div>' +
      '</div>'
    
    return post
  }
  
  function buildYoutubePost(content, secondaryContent) {
    var post
    var testLink = 'https://images.unsplash.com/photo-1473042904451-00171c69419d?dpr=1&auto=compress,format&fit=crop&w=1975&h=&q=80&cs=tinysrgb&crop='
    
    post =
      '<div class="crawler__slot">' +
        '<div class="crawler__slot-logo yt"></div>' +
        '<div class="crawler__slot-content">' + content + '</div>' +
        '<div class="crawler__slot-secondary yt">' +
          '<div class="crawler__slot-secondary-content>' +
            '<img class="crawler__slot-image" src="' + secondaryContent + '">' +
          '</div>' +
        '</div>' +
      '</div>'
    
    return post
  }
  
  function buildInstagramPost(content, secondaryContent) {
    var post
    var testLink = 'https://images.unsplash.com/photo-1473042904451-00171c69419d?dpr=1&auto=compress,format&fit=crop&w=1975&h=&q=80&cs=tinysrgb&crop='
    
    post =
      '<div class="crawler__slot">' +
        '<div class="crawler__slot-logo ig"></div>' +
        '<div class="crawler__slot-content">' + content + '</div>' +
        '<div class="crawler__slot-secondary ig">' +
          '<div class="crawler__slot-secondary-content>' +
            '<img class="crawler__slot-image" src="' + secondaryContent + '">' +
          '</div>' +
        '</div>' +
      '</div>'
    
    return post
  }
  
  crawler.buildCrawler = function(hashtag, name, id) {
    // buildCrawler function
    ws.getEventInfo(hashtag, name, id, function(result){
      var crawlerSlotsArray = []
      _.keys(result, function(key) {
        switch(key) {
          case "twitterPosts":
            _.each(result[key], function(twPost) {
              crawlerSlotsArray.push(buildTwitterPost(twPost.title))
            })
            break;
          case "youtubeVideos":
            _.each(result[key], function(ytPost) {
              crawlerSlotsArray.push(buildYoutubePost(ytPost.title))
            })
            break;
          default:
            console.log('entered in the default case for switch statement');
        }
          
      })
      _.each(crawlerSlotsArray, function(slot){
        $('#crawlerContainer').append(slot)  
      })
    }, function(){

    })
  }
  
  return crawler
});
