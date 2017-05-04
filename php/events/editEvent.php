<?php

require_once('vendor/autoload.php');
use \Firebase\JWT\JWT; 

class EditEvent {
  
  public static function editEvents(){    
    header("Access-Control-Allow-Origin: *");
    $data = json_decode(file_get_contents('php://input'), true);
    $configs = include('config.php');
    if($data && array_key_exists('jwtToken', $data)){
      $token = $data['jwtToken'];
      
      $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
      
      if(array_key_exists('id', $data))
        $key = mysqli_real_escape_string($link, $data['id']);
      
      if(array_key_exists('id', $data) && $key){
        $sqlFind = "select id, name, eventDate, description, hashtag, creatorUser, duration, featured, private, isGlobal, background from events WHERE id=$key;";

        $resultFind = mysqli_query($link,$sqlFind);

        if (!$resultFind) {
          http_response_code(400);
        }

        $rows = array();
        while($r = mysqli_fetch_assoc($resultFind)) {
          $rows[] = $r;
        }
        
        try { 
          $DecodedDataArray = JWT::decode($token, $configs->mySecretKeyJWT, array($configs->mySecretAlgorithmJWT));
          
          mysqli_set_charset($link,'utf8');
          if($rows[0]['creatorUser'] == $DecodedDataArray->data->username){
            
            $id = $rows[0]['id'];
            $name = '';
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
              if(array_key_exists('duration', $data))
                $duration = mysqli_real_escape_string($link, $data['duration']);
              if(array_key_exists('hashtag', $data))
                $hashtag = mysqli_real_escape_string($link, $data['hashtag']);
              if(array_key_exists('eventDate', $data))
                $eventDate = mysqli_real_escape_string($link, $data['eventDate']);
//              if(array_key_exists('private', $data))
//                $private = mysqli_real_escape_string($link, $data['private']);
              if(array_key_exists('isGlobal', $data))
                $isGlobal = mysqli_real_escape_string($link, $data['isGlobal']);
              if(array_key_exists('background', $data))
                $background = mysqli_real_escape_string($link, $data['background']);
              if(array_key_exists('description', $data))
                $description = mysqli_real_escape_string($link, $data['description']);
            }
              
            if($name != '' || $duration != '' || $hashtag != '' || $eventDate != '' || $isGlobal != '' || $background != '' || $description!= '' ){
              $time = new DateTime();
              $time = $time->format('Y-m-d H:i:s');
              $sql = "UPDATE `events` SET ";
              if($name)
                $sql .= "name='$name', ";
              if($duration != '')
                $sql .= "duration='$duration', ";
              if($hashtag != '')
                $sql .= "hashtag='$hashtag', ";
              if($eventDate != '')
                $sql .= "eventDate='$eventDate', ";
//              if($private != '')
//                $sql .= "private='$private', ";
              if($isGlobal != '')
                $sql .= "isGlobal='$isGlobal', ";
              if($background != '')
                $sql .= "background='$background', ";
              if($description != '')
                $sql .= "description='$description', ";
              $sql .= "lastUpdated='$time' ";
              $sql .= "WHERE id='$id'";
              $result = mysqli_query($link,$sql);
              
              if (!$result) {
                unset($data['jwtToken']);
                error_log('Edit event bad request. Possible duplicate. Username: '.json_encode($DecodedDataArray->data->username).' Email: '.$DecodedDataArray->data->name.'Data: '.json_encode($data), 0);
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
              error_log('Edit event invalid parameters. Username: '.json_encode($DecodedDataArray->data->username).' Email: '.$DecodedDataArray->data->name.' Data: '.json_encode($data), 0);
              http_response_code(400);
            }
          } else {
              unset($data['jwtToken']);
              error_log('Edit event bad request. Creator user of event is not the user from token. Username: '.json_encode($DecodedDataArray->data->username).' Email: '.$DecodedDataArray->data->name.'Data: '.json_encode($data), 0);
              http_response_code(401);
          }
        } catch (Exception $e) {
          unset($data['jwtToken']);   
          error_log('Edit event invalid token. Data:'.json_encode($data), 0);
          http_response_code(401);
        }
      }else {
        unset($data['jwtToken']);   
        error_log('Edit event missing event id.', 0);
        http_response_code(401);
      }
    } else {
        unset($data['jwtToken']);   
        error_log('Edit event missing token. Data:'.json_encode($data), 0);
        http_response_code(401);
    }
  }
}
