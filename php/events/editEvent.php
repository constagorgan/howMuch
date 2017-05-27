<?php

require_once('vendor/autoload.php');
use \Firebase\JWT\JWT; 

class EditEvent {
  public static function editEvents(){   
    
    function refValues($arr){
      if (strnatcmp(phpversion(),'5.3') >= 0) //Reference is required for PHP 5.3+
      {
          $refs = array();
          foreach($arr as $key => $value)
              $refs[$key] = &$arr[$key];
          return $refs;
      }
      return $arr;
    }
    $data = json_decode(file_get_contents('php://input'), true);
    $configs = include('config.php');
    $countriesMap = include('mapCountries.php');

    header("Access-Control-Allow-Origin: ".$configs->eventSnitchCORS);
    if($data && array_key_exists('jwtToken', $data)){
      $token = $data['jwtToken'];
      
      $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
      
      if(array_key_exists('id', $data))
        $key = mysqli_real_escape_string($link, $data['id']);
      
      if(array_key_exists('id', $data) && $key){
        $sqlFind = "select id, name, eventDate, description, hashtag, creatorUser, duration, featured, private, isGlobal, background, location, locationMagicKey, locationCountryCode from events WHERE id=?;";
        
        $stmt = $link->prepare($sqlFind);
        $stmt->bind_param('s', $key);

        $stmt->execute();
        
        $resultFind = $stmt->get_result();

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
            $location = '';
            $locationMagicKey = '';
            $locationCountryCode = '';
            $description = '';
            $time = new DateTime();
            $time = $time->format('Y-m-d H:i:s');
            $date = new DateTime();
            date_add($date, date_interval_create_from_date_string('20 years'));
            if($data){
              if(array_key_exists('name', $data))
                $name = mysqli_real_escape_string($link, $data['name']);
              if(array_key_exists('duration', $data))
                $duration = mysqli_real_escape_string($link, $data['duration']);
              if(array_key_exists('hashtag', $data))
                $hashtag = mysqli_real_escape_string($link, $data['hashtag']);
              if(array_key_exists('eventDate', $data))
                $eventDate = mysqli_real_escape_string($link, $data['eventDate']);
              if(array_key_exists('location', $data))
                $location = mysqli_real_escape_string($link, $data['location']);
              if(array_key_exists('locationMagicKey', $data))
                $locationMagicKey = mysqli_real_escape_string($link, $data['locationMagicKey']);
              if(array_key_exists('isGlobal', $data))
                $isGlobal = mysqli_real_escape_string($link, $data['isGlobal']);
              if(array_key_exists('background', $data))
                $background = mysqli_real_escape_string($link, $data['background']);
              if(array_key_exists('description', $data))
                $description = mysqli_real_escape_string($link, $data['description']);
            }
            if($eventDate != '' && (date_format($date, 'Y-m-d H:i:s') <= $eventDate || $time >= $eventDate)){
              http_response_code(400);
            } else if($name != '' || $duration != '' || $hashtag != '' || $eventDate != '' || $isGlobal != '' || $background != '' || $description!= '' || ($location != '' && $locationMagicKey != '')){
        
              $sql = "UPDATE `events` SET ";
              $bind = array();
              $dataCount = count($data);
              
              if($name){
                $sql .= "name=?, ";
                array_push($bind, $name);
              }
              if($duration != ''){
                $sql .= "duration=?, ";
                array_push($bind, $duration);
              }
              if($hashtag != ''){
                $sql .= "hashtag=?, ";
                array_push($bind, $hashtag);
              }
              if($eventDate != ''){ 
                $sql .= "eventDate=?, ";
                array_push($bind, $eventDate);             
              } 
              if($isGlobal != '') {              
                $sql .= "isGlobal=?, ";
                array_push($bind, $isGlobal);
              }   
              if($background != '') {
                $sql .= "background=?, ";
                array_push($bind, $background);
              }     
              if($description != ''){
                $sql .= "description=?, ";
                array_push($bind, $description);
              }
              if($location != '' && $locationMagicKey != ''){
                $sql .="location=?, locationMagicKey=?, locationCountryCode=?, ";
                foreach ($countriesMap as $country) {
                  $locationSplitString = explode(", ", $location);
                  if(strcmp($country->alphaThree, end($locationSplitString)) === 0){
                      $locationCountryCode = $country->alphaTwo; 
                  }
                }
                $dataCount += 1;
                array_push($bind, $location, $locationMagicKey, $locationCountryCode);
              }
              
              $sql .= "lastUpdated=? ";
              array_push($bind, $time);
              
              $sql .= "WHERE id=?";
              array_push($bind, $id);
              
              $types = str_repeat("s", $dataCount);
                           
              $stmtTwo = $link->prepare($sql);                 
              array_unshift($bind, $types);

              call_user_func_array(array($stmtTwo, 'bind_param'), refValues($bind));

              $stmtTwo->execute();

                            
              if (mysqli_error($link)) {
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
