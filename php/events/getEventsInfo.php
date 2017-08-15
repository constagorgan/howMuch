<?php
require_once('vendor/autoload.php');
use Abraham\TwitterOAuth\TwitterOAuth;

class GetEventsInformation {

  public static function getEventsInfo(){  
    $configs = include('config.php');
    $data = json_decode(file_get_contents('php://input'), true);
    header("Access-Control-Allow-Origin: ".$configs->eventSnitchCORS);
    
    $returnObj = (object) array(
      'youtubeVideos' => getYoutubeVideos($data['keywords']),
      'twitterPosts' => getTwitterPosts($data['keywords'])
    );
    
    print json_encode($returnObj);
    http_response_code(200);    
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