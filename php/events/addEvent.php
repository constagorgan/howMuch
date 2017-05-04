<?php

require_once('vendor/autoload.php');
use \Firebase\JWT\JWT; 

class AddEvent {
  
  public static function addEvents(){    
    $data = json_decode(file_get_contents('php://input'), true);
    $configs = include('config.php');
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    if($data && array_key_exists('jwtToken', $data)){
      $token = $data['jwtToken'];
      try {
        $DecodedDataArray = JWT::decode($token, $configs->mySecretKeyJWT, array($configs->mySecretAlgorithmJWT));

        $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
        mysqli_set_charset($link,'utf8');
        $name = '';
        $duration = '';
        $hashtag = '';
        $eventDate = '';
//        $private = '';
        $isGlobal = '';
        $background = '';
        $description = '';
        if($data){
          if(array_key_exists('name', $data))
            $name = mysqli_real_escape_string($link, $data['name']);
          if(array_key_exists('duration', $data))
            $duration = mysqli_real_escape_string($link, $data['duration']);
          if(array_key_exists('hashtag', $data))
            $hashtag = mysqli_real_escape_string($link, $data['hashtag']);
          if(array_key_exists('eventDate', $data))
            $eventDate = mysqli_real_escape_string($link, $data['eventDate']);
//          if(array_key_exists('private', $data))
//            $private = mysqli_real_escape_string($link, $data['private']);
          if(array_key_exists('isGlobal', $data))
            $isGlobal = mysqli_real_escape_string($link, $data['isGlobal']);
          if(array_key_exists('background', $data))
            $background = mysqli_real_escape_string($link, $data['background']);
          if(array_key_exists('description', $data))
            $description = mysqli_real_escape_string($link, $data['description']);
          $username = $DecodedDataArray->data->username;
        }
        $time = new DateTime();
        $time = $time->format('Y-m-d H:i:s');
        if($name != '' && $duration != '' && $hashtag != '' && $eventDate != '' && $isGlobal != '' && $background != '' ){
          $sql = "INSERT INTO `events` (`createdAt`, `name`, `duration`, `counter`, `hashtag`, `eventDate`, `featured`, `isGlobal`, `private`, `background`, `creatorUser`, `location`, `locationMagicKey`, `description`) VALUES ('$time', '$name', '$duration', 0, '$hashtag', '$eventDate', 0, '$isGlobal', 0,  '$background', '$username' ,'test', 'abdsd123423'";
          if($description)
            $sql .= ", '$description');";
          else 
            $sql .= ", null);";
          
          $result = mysqli_query($link,$sql);

          if (!$result) {            
            unset($data['jwtToken']);
            error_log('Add event bad request. Possible duplicate. Username: '.json_encode($username).' Email: '.$DecodedDataArray->data->name.'Data: '.json_encode($data), 0);
            if(mysqli_errno($link) == 1062)
              http_response_code(409);
            else
              http_response_code(400);
          }
          $eventId = mysqli_insert_id($link);
          mysqli_close($link);

          exit();
        } else {                        
          unset($data['jwtToken']);
          error_log('Add event invalid parameters. Username: '.json_encode($username).' Email: '.$DecodedDataArray->data->name.' Data: '.json_encode($data), 0);
          http_response_code(400);
        }
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
