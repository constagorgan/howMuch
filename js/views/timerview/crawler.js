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

  
  function buildTwitterPost(testparam) {
    var post
    
    post = '<div class="crawler__slot">' +
            '<div class="crawler__slot-logo tw"></div>' +
    '<div class="crawler__slot-content">' + testparam + 
    '</div>' + 
    '</div>'
    
    return post
  }
  
  function buildYoutubeVideo(testparam) {
    var post
    
    post = '<div class="crawler__slot">' +
            '<div class="crawler__slot-logo yt"></div>' +
    '<div class="crawler__slot-content">' + testparam + 
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
            _.each(result[key], function(ytVid) {
              crawlerSlotsArray.push(buildYoutubeVideo(ytVid.title))
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
