<?php

require_once('vendor/autoload.php');
use \Facebook\Facebook; 
use \Firebase\JWT\JWT; 

class GetEventLocation {
  public static function getEventLocations(){    
    $data = json_decode(file_get_contents('php://input'), true);
    $configs = include('config.php');  
    
    $http_origin = $_SERVER['HTTP_ORIGIN'];
    if ($http_origin == "http://localhost:8001" || $http_origin == "http://www.eventsnitch.com")
    {  
        header("Access-Control-Allow-Origin: $http_origin");
    }
    
    if($data && array_key_exists('jwtToken', $data)){
      $token = $data['jwtToken'];
      try {
        $DecodedDataArray = JWT::decode($token, $configs->mySecretKeyJWT, array($configs->mySecretAlgorithmJWT));
        
        $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
        mysqli_set_charset($link,'utf8');
        
        $queryLocationName = mysqli_real_escape_string($link, $data['name']);

        $fb = new \Facebook\Facebook([
          'app_id' => $configs->eventSnitchFacebookAppId,
          'app_secret' => $configs->eventSnitchFacebookAppSecret,
          'default_graph_version' => 'v2.10'
        ]);
        try {
          $requestLocations = $fb->request('GET', '/search?access_token='.$configs->eventSnitchFacebookAppId.'|'.$configs->eventSnitchFacebookAppSecret.'&type=place&fields=location,name&limit=6&q='.$queryLocationName);
          $response = $fb->getClient()->sendRequest($requestLocations);
        } catch(\Facebook\Exceptions\FacebookResponseException $e) {
          echo 'Graph returned an error: ' . $e->getMessage();
          exit;
        } catch(\Facebook\Exceptions\FacebookSDKException $e) {
          echo 'Facebook SDK returned an error: ' . $e->getMessage();
        }
        $graphEdge = $response->getGraphEdge();
        print($graphEdge);
      } catch (Exception $e) {               
        unset($data['jwtToken']);   
        error_log('Add event invalid token. Data:'.json_encode($data), 0);
        http_response_code(401);
      }
    } else {                      
        unset($data['jwtToken']);   
        error_log('Add event missing token. Data:'.json_encode($data), 0);
        http_response_code(401);
    }  
  }
}
