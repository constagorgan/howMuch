/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "ws",
  "moment",
], function ($, _, Backbone, ws, moment) {
  "use strict";
  
  var crawler = {}
  var posts = {};
  posts.twitterPosts = [];
  posts.youtubePosts = [];
  posts.googlePlusPosts = [];
  
  function sortCrawlerSlotsArray(crawlerSlotsArray) {
    var postsDataCounter = {}
    var postsDataKeys = []
    
    _.keys(posts).forEach(function(key) {
      postsDataCounter[key + 'Counter'] = 0;
      postsDataKeys.push(key)
    })
    
    while(_.any(posts, function(a){ return a.length > 0; })) {
      pushToCrawlerSlot();
    }
    
    function pushToCrawlerSlot() {
      var random = Math.floor((Math.random() * postsDataKeys.length))
      var postKey = postsDataKeys[random];
      
      if(posts[postKey].length === 0) {
        delete posts[postKey]
        postsDataKeys.splice(_.findIndex(postsDataKeys, function(e){return e === postKey}), 1)
        pushToCrawlerSlot()
      } else if(postsDataCounter[postKey + 'Counter'] >= 2 && postsDataKeys.length > 1) {
        pushToCrawlerSlot()
      } else {
        _.each(postsDataCounter, function(e, key){
          if(key !== postKey + 'Counter')
            postsDataCounter[key] = 0
          else 
            postsDataCounter[key] += 1
        })
        crawlerSlotsArray.push(posts[postKey].splice(0,1))
      }
    }
    return crawlerSlotsArray;
  }
  
  function getLikesFormat(likeNumber) {
    return (Math.floor(likeNumber / 1000000) > 0 ? Math.floor(likeNumber / 1000000) + 'M' : (Math.floor(likeNumber/1000) > 0 ? Math.floor(likeNumber/1000) + 'k' : likeNumber))
  }
  
  function numberWithSeparator(nr) {
    //depending on locale it can be a dot or comma
    return nr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function buildFacebookPost(content, secondaryContent) {
    var post
    var secondaryContent = 'https://images.unsplash.com/photo-1473042904451-00171c69419d?dpr=1&auto=compress,format&fit=crop&w=1975&h=&q=80&cs=tinysrgb&crop='
    
    post =
      '<div class="crawler__slot">' +
        '<div class="crawler__slot-logo fb"></div>' +
        '<div class="crawler__slot-content">' + content + '</div>' +
        '<div class="crawler__slot-secondary fb">' +
          '<div class="crawler__slot-secondary-content">' +
            '<img class="crawler__slot-image" src="' + secondaryContent + '">' +
          '</div>' +
        '</div>' +
      '</div>'
    
    return post
  }
  
  function buildTwitterPost(content, secondaryContent) {
    var post
    var secondaryContent = 'https://images.unsplash.com/photo-1465405092061-4db6005a2be0?dpr=1&auto=compress,format&fit=crop&w=1868&h=&q=80&cs=tinysrgb&crop='
    
    post =
      '<div class="crawler__slot">' +
        '<div class="crawler__slot-logo tw"></div>' +
        '<div class="crawler__slot-content">' +
          '<div class="crawler__slot-content-header">' +
            '<div class="crawler__slot-content-header--source">Twitter</div>' +
            '<div class="crawler__slot-content-header--user ellipsis">@' + content.userName + '</div>' +
            '<div class="crawler__slot-content-header--date">' + moment(content.date).format("DD MMM YYYY") + '</div>' +
          '</div>' +
          '<div class="crawler__slot-content-description">' +
            content.text + 
          '</div>' +
        '</div>' +
        '<div class="crawler__slot-secondary tw">' +
          '<div class="crawler__slot-secondary-content">' +
            '<img class="crawler__slot-image" src="' + secondaryContent + '">' +
          '</div>' +
        '</div>' +
      '</div>'
        
    return post
  }
  
  function buildYoutubePost(content) {
    var post
    
    post =
      '<div class="crawler__slot">' +
        '<div class="crawler__slot-logo yt"></div>' +
        '<div class="crawler__slot-content">' + 
          '<div class="crawler__slot-content-header">' +
            '<div class="crawler__slot-content-header--source">YouTube</div>' +
            '<div class="crawler__slot-content-header--user ellipsis">@' + content.channelTitle + '</div>' +
            '<div class="crawler__slot-content-header--date">' + moment(content.date).format("DD MMM YYYY") + '</div>' +
          '</div>' +
          '<div class="crawler__slot-content-title">' + 
            content.title + 
          '</div>' +
          '<div class="crawler__slot-content-description">' +
            content.description + 
          '</div>' +
          '<div class="crawler__slot-content-information">' +
            '<div class="crawler__slot-content-information--views">VIEWS: ' + numberWithSeparator(content.statistics.viewCount) + '</div>' +
            '<div class="crawler__slot-content-information--statistics-container">' +
              '<div class="crawler__slot-content-information--statistics-symbol">' + 
                '<span class="crawler__slot-content-information--statistics-value glyphicon glyphicon-thumbs-up glyphicon-grey"></span>' + getLikesFormat(content.statistics.likeCount) + 
              '</div>' +
              '<div class="crawler__slot-content-information--statistics-symbol">' + 
                '<span class="crawler__slot-content-information--statistics-value glyphicon glyphicon-thumbs-down glyphicon-grey"></span>' + getLikesFormat(content.statistics.dislikeCount) + 
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="crawler__slot-secondary yt">' +
          '<div class="crawler__slot-secondary-content">' +
            '<iframe width="430" height="300" class="video crawler__slot-image" frameborder="0" src="//www.youtube.com/embed/' + content.id + '" allowfullscreen></iframe>' +
          '</div>' +
        '</div>' +
      '</div>'
    
    return post
  }
  
  function buildInstagramPost(content, secondaryContent) {
    var post
    var secondaryContent = 'https://images.unsplash.com/photo-1473042904451-00171c69419d?dpr=1&auto=compress,format&fit=crop&w=1975&h=&q=80&cs=tinysrgb&crop='
    
    post =
      '<div class="crawler__slot">' +
        '<div class="crawler__slot-logo ig"></div>' +
        '<div class="crawler__slot-content">' + content + '</div>' +
        '<div class="crawler__slot-secondary ig">' +
          '<div class="crawler__slot-secondary-content">' +
            '<img class="crawler__slot-image" src="' + secondaryContent + '">' +
          '</div>' +
        '</div>' +
      '</div>'
    
    return post
  }

  function buildGooglePlusPost(content, secondaryContent) {
    var post
    var secondaryContent = 'https://images.unsplash.com/photo-1473042904451-00171c69419d?dpr=1&auto=compress,format&fit=crop&w=1975&h=&q=80&cs=tinysrgb&crop='
    
    post =
      '<div class="crawler__slot">' +
        '<div class="crawler__slot-logo gp"></div>' +
        '<div class="crawler__slot-content">' + content + '</div>' +
        '<div class="crawler__slot-secondary gp">' +
          '<div class="crawler__slot-secondary-content">' +
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

      try {
        result = JSON.parse(result)    
        _.each(_.keys(result), function(key) {
          switch(key) {
            case "facebookPost":
              _.each(result[key], function(fbPost) {
                posts.facebookPosts.push(buildFacebookPost(fbPost))
              })
              break;
            case "twitterPost":
              _.each(result[key], function(twPost) {
                posts.twitterPosts.push(buildTwitterPost(twPost))
              })
              break;
            case "youtubePost":
              _.each(result[key], function(ytPost) {
                posts.youtubePosts.push(buildYoutubePost(ytPost))
              })
              break;
            case "googlePlusPost":
              if(result[key].googlePlusPostItems && result[key].googlePlusPostItems.length) {
                _.each(result[key].googlePlusPostItems, function(gpPost) {
                  posts.googlePlusPosts.push(buildGooglePlusPost(gpPost.title))
                })
              }
              break;
            case "instagramPost":
              _.each(result[key], function(igPost) {
                posts.instagramPosts.push(buildInstagramPost(igPost.title))
              })
              break;
            default:
              console.log('entered in the default case for switch statement');
          }
        })
        
        sortCrawlerSlotsArray(crawlerSlotsArray);
        
        _.each(crawlerSlotsArray, function(slot){
          $('#crawlerContainer').append(slot)  
        })
      } catch (err) {
        
      }
    }, function(){

    })
  }
  
  return crawler
});
