<?php

require_once('vendor/autoload.php');
use \Facebook\Facebook; 

class GetEventPlace {
  public static function getEventPlaces(){    
    $data = json_decode(file_get_contents('php://input'), true);
    $configs = include('config.php');
    
    $http_origin = $_SERVER['HTTP_ORIGIN'];
    if ($http_origin == "http://localhost:8001" || $http_origin == "http://www.eventsnitch.com")
    {  
        header("Access-Control-Allow-Origin: $http_origin");
    }
    
    $key = '';
    $id = '';
    
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    mysqli_set_charset($link,'utf8');
    
    if(isset ( $_GET["key"] ))
      $key = mysqli_real_escape_string($link, $_GET['key']);
    if(isset ( $_GET["id"] ))
      $id = mysqli_real_escape_string($link, $_GET['id']);
    
    if($key && $id){
      $fb = new \Facebook\Facebook([
        'app_id' => $configs->eventSnitchFacebookAppId,
        'app_secret' => $configs->eventSnitchFacebookAppSecret,
        'default_graph_version' => 'v2.10'
      ]);
      try {
        $requestLocations = $fb->request('GET', '/'.$key.'?access_token='.$configs->eventSnitchFacebookAppId.'|'.$configs->eventSnitchFacebookAppSecret.'&fields=location,name,cover');
        $response = $fb->getClient()->sendRequest($requestLocations);
      } catch(\Facebook\Exceptions\FacebookResponseException $e) {
        if($e->getCode() == 21) {   
          try {
            $posOne = strpos($e->getMessage(), "to page ID ") + 11;
            $posTwo = strpos($e->getMessage(), ".");
            $newLocationCode = substr($e->getMessage(), 48, $posTwo-$posOne);
            $sql = "update events set locationMagicKey=? WHERE id=? AND locationMagicKey=?";
            $stmt = $link->prepare($sql);
            $stmt->bind_param('sss', $newLocationCode, $id, $key);
            $stmt->execute();
            
            $requestLocationsTwo = $fb->request('GET', '/'.$newLocationCode.'?access_token='.$configs->eventSnitchFacebookAppId.'|'.$configs->eventSnitchFacebookAppSecret.'&fields=location,name,cover');
            $responseTwo = $fb->getClient()->sendRequest($requestLocationsTwo);
          } catch(\Facebook\Exceptions\FacebookResponseException $e) {
            echo 'Graph returned an error: ' . $e->getMessage();
            exit;
          } catch(\Facebook\Exceptions\FacebookSDKException $e) {
            echo 'Facebook SDK returned an error: ' . $e->getMessage();
          }
          $graphNode = $responseTwo->getGraphNode();
          print($graphNode); 
          exit;
        }
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
