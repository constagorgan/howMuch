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
        $secretKey = base64_decode($configs->mySecretKeyJWT); 
        $DecodedDataArray = JWT::decode($token, $secretKey, array($configs->mySecretAlgorithmJWT));

        $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
        mysqli_set_charset($link,'utf8');
        $name = '';
        $creatorUser = '';
        $duration = '';
        $hashtag = '';
        $eventDate = '';
        $private = '';
        $isGlobal = '';
        $background = '';
        $description = '';
        if($data){
          if(array_key_exists('name', $data))
            $name = mysqli_real_escape_string($link, $data['name']);
          if(array_key_exists('creatorUser', $data))
            $creatorUser = mysqli_real_escape_string($link, $data['creatorUser']);
          if(array_key_exists('duration', $data))
            $duration = mysqli_real_escape_string($link, $data['duration']);
          if(array_key_exists('hashtag', $data))
            $hashtag = mysqli_real_escape_string($link, $data['hashtag']);
          if(array_key_exists('eventDate', $data))
            $eventDate = mysqli_real_escape_string($link, $data['eventDate']);
          if(array_key_exists('private', $data))
            $private = mysqli_real_escape_string($link, $data['private']);
          if(array_key_exists('isGlobal', $data))
            $isGlobal = mysqli_real_escape_string($link, $data['isGlobal']);
          if(array_key_exists('background', $data))
            $background = mysqli_real_escape_string($link, $data['background']);
          if(array_key_exists('description', $data))
            $description = mysqli_real_escape_string($link, $data['description']);
        }

        if($name || $creatorUser || $duration || $hashtag || $eventDate || $private || $isGlobal || $background || $description){


          $sql = "INSERT INTO `events` (`name`, `creatorUser`, `duration`, `counter`, `hashtag`, `eventDate`, `featured`, `private`, `isGlobal`, `background`, `description`) VALUES ('$name', '$creatorUser', '$duration', 0, '$hashtag', '$eventDate', 0, '$private', '$isGlobal', '$background'";
          if($description)
            $sql .= ", '$description');";
          else 
            $sql .= ", null);";
          $result = mysqli_query($link,$sql);

          if (!$result) {
            if(mysqli_errno($link) == 1062)
              http_response_code(409);
            else
              http_response_code(400);
          }
          $eventId = mysqli_insert_id($link);
          mysqli_close($link);

          exit();
        } else {
          echo "{'status' : 'fail' ,'msg':'Bad request'}";
          http_response_code(400);
        }
      } catch (Exception $e) {
        echo "{'status' : 'fail' ,'msg':'Unauthorized'}";
        http_response_code(401);
      }
    } else {
        echo "{'status' : 'fail' ,'msg':'Unauthorized'}";
        http_response_code(401);
    }
  }
}
