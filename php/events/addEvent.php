<?php

require_once('vendor/autoload.php');
use \Firebase\JWT\JWT; 

class AddEvent {
  
  public static function addEvents(){    
    $data = json_decode(file_get_contents('php://input'), true);
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    if($data && array_key_exists('jwtToken', $data)){
      $token = $data['jwtToken'];
      try {
        include_once(dirname(__DIR__).'/conf/config.inc.php');
        $secretKey = base64_decode($mySecretKeyJWT); 
        $DecodedDataArray = JWT::decode($token, $secretKey, array($mySecretAlgorithmJWT));

        $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
        mysqli_set_charset($link,'utf8');

        $name = mysqli_real_escape_string($link, $data['name']);
        $creatorUser = mysqli_real_escape_string($link, $data['creatorUser']);
        $duration = mysqli_real_escape_string($link, $data['duration']);
        $hashtag = mysqli_real_escape_string($link, $data['hashtag']);
        $eventDate = mysqli_real_escape_string($link, $data['eventDate']);
        $private = mysqli_real_escape_string($link, $data['private']);
        $isGlobal = mysqli_real_escape_string($link, $data['isGlobal']);
        $background = mysqli_real_escape_string($link, $data['background']);
        if($data && array_key_exists('description', $data))
          $description = mysqli_real_escape_string($link, $data['description']);


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
        echo "{'id': '$eventId', 'name': '$name'}";
        mysqli_close($link);

        exit();

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
