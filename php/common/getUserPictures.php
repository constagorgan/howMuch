<?php

require_once('vendor/autoload.php');
use \Firebase\JWT\JWT; 

class GetUserPicture {

  public static function getUserPictures(){
   $data = json_decode(file_get_contents('php://input'), true);
    $configs = include('config.php');
    
    $http_origin = $_SERVER['HTTP_ORIGIN'];
    if ($configs->allowCorsLocal == true || $http_origin == "http://localhost:8001" || $http_origin == "https://www.eventsnitch.com")
    {  
        header("Access-Control-Allow-Origin: $http_origin");
    }
        
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);

    if($data && array_key_exists('jwtToken', $data)){
        $token = $data['jwtToken'];
        
        try {
          $DecodedDataArray = JWT::decode($token, $configs->mySecretKeyJWT, array($configs->mySecretAlgorithmJWT));
          $email = $DecodedDataArray->data->name;  
          
          $stmt = $link->prepare('SELECT id, email, username, lastPassChange FROM users WHERE `email` = ? AND active=1  LIMIT 1');
          $stmt->bind_param('s', $email);
          $stmt->execute();
          
          $check_key = $stmt->get_result();

          if(mysqli_num_rows($check_key) != 0)  
          {
            $username = $DecodedDataArray->data->username;
            $sql = "select id, name from user_pictures WHERE creatorUser=?;";
        
            $stmtTwo = $link->prepare($sql);
            $stmtTwo->bind_param('s', $username);
            $stmtTwo->execute();

            $result = $stmtTwo->get_result();
            $rows = array();
            while($r = mysqli_fetch_assoc($result)) {
              $rows[] = $r;
            }
            
            print json_encode($rows);
          } else {
            http_response_code(401);
          }
          
        } catch (Exception $e) {
          http_response_code(401);
        }
       
     } else {
        http_response_code(401);
     }
  }

}
