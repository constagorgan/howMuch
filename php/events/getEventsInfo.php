<?php
require_once('vendor/autoload.php');
use Abraham\TwitterOAuth\TwitterOAuth;

class GetEventsInformation {

  public static function getEventsInfo(){  
    $configs = include('config.php');
    $data = json_decode(file_get_contents('php://input'), true);
    $configs = include('config.php');
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    header("Access-Control-Allow-Origin: ".$configs->eventSnitchCORS);
    
    if($data && array_key_exists('name', $data) && array_key_exists('id', $data) && array_key_exists('keywords', $data)) {
      $eventName = mysqli_real_escape_string($link, $data['name']);
      $eventId = mysqli_real_escape_string($link, $data['id']);
      
      $stmt = $link->prepare("SELECT id, name FROM events WHERE `id`=? AND `name`=? LIMIT 1;");
      $stmt->bind_param('ss', $eventId, $eventName);
      $stmt->execute();

      $result = $stmt->get_result();
      while($r = mysqli_fetch_assoc($result)) {
        $eventGetId = $r['id'];
      }
      if(!isset($eventGetId)){
        error_log('Invalid get event info name and id');
        http_response_code(400);
      } else {
        //cache file name cu offset 
        $returnObj = (object) array(
          'youtubeVideos' => get_new_or_cached_api_responses('getYoutubeVideos', $data['keywords'], $data['name'], $data['id'], 'youtube', 600),
          'twitterPosts' => get_new_or_cached_api_responses('getTwitterPosts', $data['keywords'], $data['name'], $data['id'], 'twitter', 3660),
          'googlePlusPost' => get_new_or_cached_api_responses('getGooglePlusPosts', $data['keywords'], $data['name'], $data['id'], 'googlePlus', 43200),
        );

        print json_encode($returnObj);
        http_response_code(200); 
      }
    } else {
       error_log('Invalid get event info request.');
       http_response_code(400);
    }
  }
}

function getTwitterPosts($twitterKeywords) {
  $configs = include('config.php');
  $connection = new TwitterOAuth($configs->eventSnitchTwitterConsumerKey, $configs->eventSnitchTwitterSecretKey, $configs->eventSnitchTwitterAccessTokenKey, $configs->eventSnitchTwitterAccessTokenSecretKey);
  $content = $connection->get("account/verify_credentials");
  $statuses = $connection->get("search/tweets", ["count" => "100", "lang" => "en", "q" => str_replace("//", "%7C", $twitterKeywords), "result_type" => "mixed", "exclude_replies" => "true"]);
  
  $tweets = array();

  foreach ($statuses->statuses as $searchResult) {
    $tweetObj = (object) array(
      'id' => $searchResult->id,
      'text' => $searchResult->text,
      'userName' => $searchResult->user->screen_name,
      'userDescription' => $searchResult->user->description,
      'userFollowersCount"' => $searchResult->user->followers_count,
      'userFriendsCount' => $searchResult->user->friends_count,
      'userVerified' => $searchResult->user->verified,
      'userListedCount' => $searchResult->user->listed_count,
      'userFavouritesCount' => $searchResult->user->favourites_count,
      'userStatusesCount' => $searchResult->user->statuses_count,
      'date' => $searchResult->created_at,
      'retweetCount' => $searchResult->retweet_count,
      'favoriteCount' => $searchResult->favorite_count
    );
    array_push($tweets, $tweetObj); 
  }
  
  return $tweets;

}

function getYoutubeVideos($youtubeKeywords){    
  $configs = include('config.php');
  $DEVELOPER_KEY = $configs->eventSnitchGoogleApiKey;

  $client = new Google_Client();
  $client->setDeveloperKey($DEVELOPER_KEY);

  // Define an object that will be used to make all API requests.
  $youtube = new Google_Service_YouTube($client);

  try {

    // Call the search.list method to retrieve results matching the specified
    // query term.
    $searchResponse = $youtube->search->listSearch('id,snippet', array(
      'q' => str_replace("//", "%7C", $youtubeKeywords),
      'type' => 'video',
      'maxResults' => '10',
      'order' => 'relevance',
      'relevanceLanguage' => 'en',
      'regionCode' => 'us'
    ));

    $videos = array();
    
    foreach ($searchResponse['items'] as $searchResult) {
      $videoObj = (object) array(
        'id' => $searchResult['id'],
        'title' => $searchResult['snippet']['title'],
        'description' => $searchResult['snippet']['description'],
        'date' => $searchResult['snippet']['publishedAt'],
        'channelId' => $searchResult['snippet']['channelId'],
        'channelTitle' => $searchResult['snippet']['channelTitle']
      );
      array_push($videos, $videoObj); 
    }
    
    return $videos;
    
  } catch (Google_Service_Exception $e) {
      htmlspecialchars($e->getMessage());
  } catch (Google_Exception $e) {
      htmlspecialchars($e->getMessage());
  }
}

function getGooglePlusPosts($googlePlusKeywords) {
  $configs = include('config.php');
  $DEVELOPER_KEY = $configs->eventSnitchGoogleApiKey;

  $client = new Google_Client();
  $client->setDeveloperKey($DEVELOPER_KEY);

  // Define an object that will be used to make all API requests.
  $plus = new Google_Service_Plus($client);
  
  $query = str_replace("//", "OR", $googlePlusKeywords);    
  $params = array(
        'orderBy' => 'recent',
        'maxResults' => '20',
  );

  $googlePlusResults = $plus->activities->search($query, $params);
  
  $googlePlusReturnObj = new stdClass();
  $googlePlusReturnObj->nextPageToken = $googlePlusResults['nextPageToken'];
    
  $googlePlusPostItems = array();
    
  foreach ($googlePlusResults['items'] as $searchResult) {
    $gPlusObj = (object) array(
      'id' => $searchResult['id'],
      'etag' => $searchResult['etag'],
      'title' => $searchResult['title'],
      'date' => $searchResult['published'],
      'actor' => $searchResult['actor'],
      'verb' => $searchResult['type'],
      'address' => $searchResult['address'],
      'placeName' => $searchResult['placeName'],
      'url' => $searchResult['url'],
      'replies' => $searchResult['object']['replies'],
      'reshares' => $searchResult['object']['reshares']
    );
    array_push($googlePlusPostItems, $gPlusObj);
  }
  
  $googlePlusReturnObj->googlePlusPostItems = $googlePlusPostItems;
  
  return $googlePlusReturnObj;
}

function get_new_or_cached_api_responses($apiFunction, $keywords, $eventName, $eventId, $infoType, $time) {
  global $request_type, $purge_cache, $limit_reached, $request_limit;

  $cache_file = dirname(__FILE__) . '/../eventsCache/' . $eventName . '-' . $eventId . '-' .$infoType .'cache.json';
  $expires = time() - $time;

  if (!file_exists(dirname(__FILE__) . '/../eventsCache')) {
    mkdir(dirname(__FILE__) . '/../eventsCache', 0777, true);
  }

  if( !file_exists($cache_file) )  { 
    $fh = fopen($cache_file, 'w'); //daca nu merge trebuie chmod 777 pe folder
    fwrite($fh, '');
    fclose($fh);
  }

  // Check that the file is older than the expire time and that it's not empty
  if ( filectime($cache_file) < $expires || file_get_contents($cache_file)  == '' || $purge_cache && intval($_SESSION['views']) <= $request_limit ) {
      $api_results = $apiFunction($keywords);
      $json_results = json_encode($api_results);
      // Remove cache file on error to avoid writing wrong xml
      if ( $api_results && $json_results )
          file_put_contents($cache_file, $json_results);
      else
          unlink($cache_file);
  } else {
      $json_results = file_get_contents($cache_file);
      $request_type = 'JSON';
  }

  return json_decode($json_results);
}