<?php

require_once('vendor/autoload.php');
use \Facebook\Facebook; 

class GetEventPlace {
  public static function getEventPlaces(){    
    $data = json_decode(file_get_contents('php://input'), true);
    $configs = include('config.php');
    header("Access-Control-Allow-Origin: ".$configs->eventSnitchCORS);
    $key = '';
    
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    mysqli_set_charset($link,'utf8');
    
    if(isset ( $_GET["key"] ))
      $key = mysqli_real_escape_string($link, $_GET['key']);
    
    if($key){
      $fb = new \Facebook\Facebook([
        'app_id' => $configs->eventSnitchFacebookAppId,
        'app_secret' => $configs->eventSnitchFacebookAppSecret,
        'default_graph_version' => 'v2.10'
      ]);
      try {
        $requestLocations = $fb->request('GET', '/'.$key.'?access_token='.$configs->eventSnitchFacebookAppId.'|'.$configs->eventSnitchFacebookAppSecret.'&fields=location,name,cover');
        $response = $fb->getClient()->sendRequest($requestLocations);
      } catch(\Facebook\Exceptions\FacebookResponseException $e) {
        echo 'Graph returned an error: ' . $e->getMessage();
        exit;
      } catch(\Facebook\Exceptions\FacebookSDKException $e) {
        echo 'Facebook SDK returned an error: ' . $e->getMessage();
      }
      $graphNode = $response->getGraphNode();
      print($graphNode); 
    } else {
      http_response_code(400);
    }
  }
}
