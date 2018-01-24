/*global define, console */
define([
  "jquery",
  "underscore",
  "backbone",
  "ws",
  "moment",
  "config",
  "common"
], function ($, _, Backbone, ws, moment, config, common) {
  "use strict";
  
  var crawler = {}
  var posts = {}
  var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig
  var request
  
  function addItemsToCrawler(event) {
    if(($(window).scrollTop() + $(window).height())/$(document).height() >= 0.9 && event.data && event.data.length) {
      removeYoutubeEvents()
      removeGPImageErrorHandler()
      var numberOfNewElements = event.data.length < 6 ? event.data.length : 5
      for(var i=0;i<numberOfNewElements;i++) { 
        $('#crawlerContainer').append(event.data.splice(0,1)[0])
      }
      window.spliceCounter+=1
      if(window.spliceCounter%4 === 1) {
        buildAdsenseInFeed()
      }
      
      if(!event.data.length) {
        addEndSlot()
      }
      
      addYoutubeEvents()
      addGPImageErrorHandler()
      checkShowMore()
    }
  }
  
  function addEndSlot() {
    var slot = '<div id="crawlerSlotEnd" class="crawler__slot-end">' +
            '<div id="crawlerSlotEndCheckMore" class="crawler__slot-content end" style="height: ' + $(window).width()/2.6 + 'px;">' +
            '</div>' +
            '</div>'
      $('#crawlerContainer').append(slot)
      $("#crawlerSlotEnd").bind('click.crawlerSlotEndNavigate', function(){
        common.getRandomEvent()
      });
      $(window).bind('orientationchange.resizeCrawlerSlotEnd', function(){
        $('#crawlerSlotEndCheckMore').css({
          height: $(window).width()/2.7
        })
      })
  }
  
  function buildAdsenseInFeed() {
    var ad = '<div class="crawler__slot">' +
          '<div class="crawler__slot-logo es"></div>' +
          '<div class="crawler__slot-content ad">'
      if(config.client.isProduction) {
        ad += '<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>' +
          '<ins class="adsbygoogle"' +
               'style="display:block"' +
               'data-ad-client="ca-pub-7339410185917998"' +
               'data-ad-slot="8380570014"' +
               'data-ad-format="auto"></ins>' +
          '<script>' +
          '(adsbygoogle = window.adsbygoogle || []).push({});' +
          '</script>'
      } else {
        ad += 'No ad. This is not production.'
      }
      ad += '</div></div>'
      $('#crawlerContainer').append(ad)
  }
  
  function checkShowMore() {
    _.each($(".crawler__slot-content-description-show-more"), function(elem) {
      if($(elem).prev().children().height() <= 60) {
        $(elem).addClass('display_none')
        $(elem).prev().removeClass("crawler__slot-content-description-hidden")
      }  
    })
  }
  function removeYoutubeEvents() {
    $(".crawler__slot-secondary-content-overlay").unbind('.changeToIframe')
    $(".crawler__slot-content-description-show-more a").unbind('.showMoreText')
  }
  
  function removeGPImageErrorHandler() {
    $(".crawler__slot-secondary-content-overlay").unbind('.removeBadImage')
  }
  
  function addYoutubeEvents() {
    $(".crawler__slot-secondary-content-overlay").bind('click.changeToIframe', function(){
      $(this).siblings()[0].remove()
      $(this).replaceWith("<iframe height='300' width='400' frameborder='0' allowfullscreen class='video crawler__slot-image' src='"+$(this).data('src')+"?rel=0&amp;autoplay=1'></iframe>");
    });
    
    $(".crawler__slot-content-description-show-more a").on("click.showMoreText", function() {
      var $this = $(this); 
      var $content = $this.parent().prev()

      if($this.parent().prev().hasClass("crawler__slot-content-description-hidden")){
          $content.removeClass("crawler__slot-content-description-hidden");
          $content.addClass("crawler__slot-content-description-shown");
          $this.text("Show less");
      } else {
          $content.removeClass("crawler__slot-content-description-shown");
          $content.addClass("crawler__slot-content-description-hidden");
          $this.text("Show more");
      };
    });
  }
  
  function addGPImageErrorHandler() {
    $('.crawler__slot-image-gp').bind("error.removeBadImage", function () {
      $(this).parent().parent().parent().addClass('display_none')
    });
  }
  
  function buildHyperlink(value, link){
    return '<a target="_blank" href="' + link + '" >' + value + '</a>';
  }
  
  function setHyperlink(text, value, link){
    if(value && text.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
       text = text.substring(0, text.toLowerCase().indexOf(value.toLowerCase())) + buildHyperlink(value, link) + text.substring(text.toLowerCase().indexOf(value.toLowerCase()) + value.length, text.length); 
    }
    return text;
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
  
  function buildTwitterPost(content) {
    var post
    var verifiedBadgePath = '/Content/img/tw-verified.png'
    var mediaUrl = content.media && content.media[0] && content.media[0].url
    
    content.text = setTwitterHyperlinks(content.text, content.urls, content.user_mentions, content.hashtags, mediaUrl)
    
    post =
      '<div class="crawler__slot">' +
        '<div class="crawler__slot-logo tw"></div>' +
        '<div class="crawler__slot-content">' +
          '<div class="crawler__slot-content-header">' +
            '<div class="crawler__slot-content-header--source">Twitter</div>' +
            (content.userVerified ? '<img class="crawler__slot-content-header--source-verified tw" src="' + verifiedBadgePath + '">' : '') +
            '<div class="crawler__slot-content-header--user ellipsis">@' + (content.userName ? content.userName : 'Unknown') + '</div>' +
            '<div class="crawler__slot-content-header--date">' + (moment(content.date).format("DD MMM YYYY")) + '</div>' +
          '</div>' +
          '<div class="crawler__slot-content-description">' +
            '<img class="crawler__slot-content-description-image" src="' + content.userProfileImageUrlHttps + '">' +
            '<div class="crawler__slot-content-description-text">' + content.text + '</div>' +
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
            '<div class="crawler__slot-content-information--text">Followers: <span class="bold-text">' + getMinifiedNumber(content.userFollowersCount) + '</span></div>' +
          '</div>' +
        '</div>' +
        (content.extendedMedia && content.extendedMedia.length && content.extendedMedia[0].video_info &&  content.extendedMedia[0].video_info.variants
         && content.extendedMedia[0].video_info.variants.length && content.extendedMedia[0].video_info.variants[0].url ? 
          '<div class="crawler__slot-secondary tw">' +
            '<div class="crawler__slot-secondary-content">' +
              '<a target="_blank" href= "' + content.extendedMedia[0].url + '" >' +
                '<video class="crawler__slot-image"' + (content.extendedMedia[0].type === "animated_gif" ? 'autoplay loop' : 'controls') + ' >' +
                  '<source src="' + content.extendedMedia[0].video_info.variants[0].url + '" type="' + content.extendedMedia[0].video_info.variants[0].content_type+ '"/>' +
                '</video>' + 
              '</a>' +
            '</div>' +
          '</div>' : 
        (content.media && content.media.length ? 
          '<div class="crawler__slot-secondary tw">' +
            '<div class="crawler__slot-secondary-content">' +
              '<a target="_blank" href= "' + content.media[0].url + '" >' +
                '<img class="crawler__slot-image" src="' + content.media[0].media_url_https + '">' +
              '</a>' +
            '</div>' +
          '</div>' : '')) +
      '</div>'
        
    return post
  }
  
  function setTwitterHyperlinks(text, urls, userMentions, hashtags, tweetUrl) {
    
    text = setHyperlink(text, tweetUrl, tweetUrl);
    
    _.each(urls, function(url) {
      text = setHyperlink(text, url.url, url.url);
    })
    
    _.each(hashtags, function(hashtag) {
      text = setHyperlink(text, '#' + hashtag.text, 'https://twitter.com/hashtag/' + hashtag.text + '?src=hash');
    })
    
    _.each(userMentions, function(user) {
      text = setHyperlink(text, '@' + user.screen_name, 'https://twitter.com/' + (user.screen_name ? user.screen_name : user.name));
    })
    
    return text;
  }
  
  function buildYoutubePost(content) {
    var post
    content.description  = setYoutubeHyperlinks(content.description)

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
            '<div class="crawler__slot-content-description-hidden">' +
              '<div class="crawler__slot-content-description-text">' +
                content.description + 
              '</div>' +
            '</div>' +
            '<div class="crawler__slot-content-description-show-more no_select">' + 
              '<a>Show more</a>' +
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
            '<img class="video crawler__slot-image crawler__slot-iframe-placeholder yt" src="https://img.youtube.com/vi/' +  content.id + '/hqdefault.jpg" / >' + 
            '<div class="crawler__slot-iframe-placeholder crawler__slot-secondary-content-overlay yt" data-src="//www.youtube.com/embed/' + content.id + '">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    
    return post
  }

  function setYoutubeHyperlinks(text) {
      return text.replace(urlRegex, function(url) {
          return '<a target="_blank" href="' + url + '">' + url + '</a>';
      });
    
    text = setHyperlink(text, tweetUrl, tweetUrl);

    return text;
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
          '<div class="crawler__slot-content-description">' +
            '<img class="crawler__slot-content-description-image" src="' + 
              content.actor.image.url +
            '">' +
            '<div class="crawler__slot-content-description-hidden">' +
              '<div class="crawler__slot-content-description-text gp">' +
                (content.objectContent ? content.objectContent : (content.attachments && content.attachments.length && content.attachments[0].displayName ? content.attachments[0].displayName : content.title)) +
              '</div>' +
            '</div>' +
            '<div class="crawler__slot-content-description-show-more no_select">' + 
              '<a>Show more</a>' +
            '</div>' +
          '</div>' +
          '<div class="crawler__slot-content-information gp">' +
            '<div class="crawler__slot-content-information--statistics-container gp">' +
              '<div class="crawler__slot-content-information--statistics-symbol gp">' + 
                (content.replies || content.replies === 0 ? ('<div class="crawler__slot-content-information--text gp"><span class="crawler__slot-content-information--statistics-value glyphicon glyphicon-comment glyphicon-grey"></span>' + getMinifiedNumber(content.replies) + '</div>') : '') +
                (content.plusoners || content.plusoners === 0 ? ('<div class="crawler__slot-content-information--text gp"><span class="crawler__slot-content-information--statistics-value glyphicon glyphicon-plus glyphicon-grey"></span>' + getMinifiedNumber(content.plusoners) + '</div>') : '') +
                (content.reshares || content.reshares === 0 ? ('<div class="crawler__slot-content-information--text gp"><span class="crawler__slot-content-information--statistics-value glyphicon glyphicon-share-alt glyphicon-grey"></span>' + getMinifiedNumber(content.reshares) + '</div>') : '') +
                (content.access && content.access.items && content.access.items.length && content.access.items[0].type === "public" ? ('<div class="crawler__slot-content-information--text access-rights">Shared Publicly</div>') : '') +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        (content.attachments && content.attachments.length && content.attachments[0].image && content.attachments[0].image.url ? 
          ('<div class="crawler__slot-secondary gp">' +
            '<div class="crawler__slot-secondary-content">' +
              '<a target="_blank" href= "' + content.url + '" ><img class="crawler__slot-image crawler__slot-image-gp" src="' + 
                content.attachments[0].image.url + '"></a>' +
            '</div>' +
          '</div>') : '') +
      '</div>'
    
    return post
  }
  
  crawler.abortCrawlerRequests = function() {
    if(request)
      request.abort()
  }
  crawler.buildCrawler = function(hashtag, name, id) {
    
    posts.twitterPosts = []
    posts.youtubePosts = []
    posts.googlePlusPosts = []
    // buildCrawler function
    request = ws.getEventInfo(hashtag, name, id, function(result){
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
        addYoutubeEvents()
        sortCrawlerSlotsArray(crawlerSlotsArray)
        addItemsToCrawler({data: crawlerSlotsArray})
        $(window).bind('scroll.scrollBuildArray', crawlerSlotsArray, _.throttle(addItemsToCrawler, 500))  
        $(window).bind('touchmove.touchmoveBuildArray', crawlerSlotsArray, _.throttle(addItemsToCrawler, 500))        
        $('#crawlerLoader').addClass('display_none')
      } catch (err) {
        
      }
    }, function(){

    })
  }
  
  return crawler
});
