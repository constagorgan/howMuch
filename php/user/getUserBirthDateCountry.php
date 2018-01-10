<?php

require_once('vendor/autoload.php');
use \Firebase\JWT\JWT; 

class GetUserBirthDateCountry {
  
  public static function getUsersBirthDateCountry(){    
    $data = json_decode(file_get_contents('php://input'), true);
    // connect to the mysql database
    $configs = include('config.php');
    
    $http_origin = $_SERVER['HTTP_ORIGIN'];
    if ($configs->allowCorsLocal == true || $http_origin == "http://localhost:8001" || $http_origin == "https://www.eventsnitch.com")
    {  
      header("Access-Control-Allow-Origin: $http_origin");
    }
    
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    mysqli_set_charset($link,'utf8');
    
    $secret = $configs->myCaptchaUlimateSecret;
    
    if($data && array_key_exists('jwtToken', $data)){
      $token = $data['jwtToken'];
      
      $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
      try { 
        $DecodedDataArray = JWT::decode($token, $configs->mySecretKeyJWT, array($configs->mySecretAlgorithmJWT));  

        $stmt = $link->prepare("SELECT country, birthDate from `users` WHERE id=?");
        $stmt->bind_param('s', $DecodedDataArray->data->id);
        $stmt->execute();

        $result = $stmt->get_result();
        if (!$result) {
          http_response_code(400);
        }

        $rows = array();
        while($r = mysqli_fetch_assoc($result)) {
          $rows[] = $r;
        }
        print json_encode($rows);

        mysqli_close($link);
      } catch (Exception $e) {
        unset($data['jwtToken']);   
        error_log('Edit event invalid token. Data:'.json_encode($data), 0);
        http_response_code(401);
      }
    } else {
      error_log('Edit event no token.', 0);
      http_response_code(400);
    }
    exit();
  }
}
