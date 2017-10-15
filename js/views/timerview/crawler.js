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
  
  function addItemsToCrawler(event) {
    if(($(window).scrollTop() + $(window).height())/$(document).height() >= 0.9 && event.data) {
      var numberOfNewElements = event.data.length < 6 ? event.data.length : 5
      for(var i=0;i<numberOfNewElements;i++) { 
        $('#crawlerContainer').append(event.data.splice(0,1)[0])  
      }
    }
  }
  
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
  
  function getMinifiedNumber(likeNumber) {
    return (Math.floor(likeNumber / 1000000) > 0 ? Math.floor(likeNumber / 1000000) + 'M' : (Math.floor(likeNumber/1000) > 0 ? Math.floor(likeNumber/1000) + 'k' : likeNumber))
  }
  
  function numberWithSeparator(nr) {
    // Depending on locale it can be a dot or comma
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
            '<div class="crawler__slot-content-header--user ellipsis">@' + (content.userName) + '</div>' +
            '<div class="crawler__slot-content-header--date">' + (moment(content.date).format("DD MMM YYYY")) + '</div>' +
          '</div>' +
          '<div class="crawler__slot-content-description">' +
            (content.text) + 
          '</div>' +
          '<div class="crawler__slot-content-information">' +
            '<div class="crawler__slot-content-information--statistics-container">' +
              '<div class="crawler__slot-content-information--statistics-symbol">' + 
                '<span class="crawler__slot-content-information--statistics-value glyphicon glyphicon-retweet glyphicon-grey"></span>' + getMinifiedNumber(content.retweetCount) + 
              '</div>' +
              '<div class="crawler__slot-content-information--statistics-symbol">' + 
                '<span class="crawler__slot-content-information--statistics-value glyphicon glyphicon-heart-empty glyphicon-grey"></span>' + getMinifiedNumber(content.favoriteCount) + 
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="crawler__slot-content-information">' +
            '<div class="crawler__slot-content-information--text">User\'s stats:</div>' +
            '<div class="crawler__slot-content-information--text">Tweets: <span class="bold-text">' + getMinifiedNumber(content.userStatusesCount) + '</span></div>' +
            '<div class="crawler__slot-content-information--text">Following: <span class="bold-text">' + getMinifiedNumber(content.userFriendsCount) + '</span></div>' +
            '<div class="crawler__slot-content-information--text">Following: <span class="bold-text">' + getMinifiedNumber(content.userFollowersCount) + '</span></div>' +
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
            '<div class="crawler__slot-content-description-text yt">' +
              content.description + 
            '</div>' +
          '</div>' +
          '<div class="crawler__slot-content-information">' +
            '<div class="crawler__slot-content-information--text">Views: <span class="bold-text">' + numberWithSeparator(content.statistics.viewCount) + '</span></div>' +
            '<div class="crawler__slot-content-information--statistics-container">' +
              '<div class="crawler__slot-content-information--statistics-symbol">' + 
                '<span class="crawler__slot-content-information--statistics-value glyphicon glyphicon-thumbs-up glyphicon-grey"></span>' + getMinifiedNumber(content.statistics.likeCount) + 
              '</div>' +
              '<div class="crawler__slot-content-information--statistics-symbol">' + 
                '<span class="crawler__slot-content-information--statistics-value glyphicon glyphicon-thumbs-down glyphicon-grey"></span>' + getMinifiedNumber(content.statistics.dislikeCount) + 
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

    var secondaryContent = 'https://images.unsplash.com/photo-1489440543286-a69330151c0b?dpr=1&auto=compress,format&fit=crop&w=1950&h=&q=80&cs=tinysrgb&crop='

    post =
      '<div class="crawler__slot">' +
        '<div class="crawler__slot-logo gp"></div>' +
        '<div class="crawler__slot-content">' + 
          '<div class="crawler__slot-content-header">' +
            '<div class="crawler__slot-content-header--source">Google+</div>' +
            (content.actor && content.actor.verification && content.actor.verification.adHocVerified && content.actor.verification.adHocVerified.toLowerCase() === "passed" ? '<svg class="crawler__slot-content-header--source-verified gp" height="20px" width="14px" viewBox="0 0 24 24"><path class="Ce1Y1c" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"></path></svg>' : '') + 
            '<div class="crawler__slot-content-header--user gp ellipsis">@' + (content.actor ? content.actor.displayName : 'Unknown') + '</div>' +
            '<div class="crawler__slot-content-header--date">' + moment(content.date).format("DD MMM YYYY") + '</div>' +
          '</div>' +
          '<div class="crawler__slot-content-title">' + 
          '</div>' +
          '<div class="crawler__slot-content-description gp">' +
            '<img class="crawler__slot-content-description-image gp" src="' + 
              content.actor.image.url +
            '">' +
            '<div class="crawler__slot-content-description-text gp">' +
              (content.objectContent ? content.objectContent : (content.attachments && content.attachments.length && content.attachments[0].displayName ? content.attachments[0].displayName : content.title)) +
            '</div>' +
          '</div>' +
          '<div class="crawler__slot-content-information gp">' +
            (content.replies || content.replies === 0 ? ('<div class="crawler__slot-content-information--text"><span class="bold-text crawler__slot-content-information--statistics-value glyphicon glyphicon-comment glyphicon-grey"></span>' + getMinifiedNumber(content.replies) + '</div>') : '') +
            (content.plusoners || content.plusoners === 0 ? ('<div class="crawler__slot-content-information--text"><span class="bold-text crawler__slot-content-information--statistics-value glyphicon glyphicon-plus glyphicon-grey"></span>' + getMinifiedNumber(content.plusoners) + '</div>') : '') +
            (content.reshares || content.reshares === 0 ? ('<div class="crawler__slot-content-information--text"><span class="bold-text crawler__slot-content-information--statistics-value glyphicon glyphicon-share-alt glyphicon-grey"></span>' + getMinifiedNumber(content.reshares) + '</div>') : '') +
            (content.access && content.access.items && content.access.items.length && content.access.items[0].type === "public" ? ('<div class="crawler__slot-content-information--access-type"><span class="bold-text">Shared Publicly</span></div>') : '') +
          '</div>' +
        '</div>' +
        (content.attachments && content.attachments.length && content.attachments[0].fullImage && content.attachments[0].fullImage.url ? 
          ('<div class="crawler__slot-secondary gp">' +
            '<div class="crawler__slot-secondary-content">' +
              '<a target="_blank" href= "' + content.url + '" ><img class="crawler__slot-image" src="' + 
                content.attachments[0].fullImage.url + '"></a>' +
            '</div>' +
          '</div>') : '') +
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
                  posts.googlePlusPosts.push(buildGooglePlusPost(gpPost))
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
        $(window).bind('scroll', crawlerSlotsArray, _.debounce(addItemsToCrawler, 30))        
      } catch (err) {
        
      }
    }, function(){

    })
  }
  
  return crawler
});
