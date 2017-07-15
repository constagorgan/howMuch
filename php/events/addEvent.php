<?php

require_once('vendor/autoload.php');
use \Firebase\JWT\JWT; 

class AddEvent {
  
  public static function addEvents(){    
    $data = json_decode(file_get_contents('php://input'), true);
    $configs = include('config.php');
    $countriesMap = include('mapCountries.php');
    
    header("Access-Control-Allow-Origin: ".$configs->eventSnitchCORS);
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
        $isLocal = '';
        $background = '';
        $location = '';
        $locationMagicKey = '';
        $locationCountryCode = '';
        $countryCode = '';
        $description = '';
        $date = new DateTime();
        date_add($date, date_interval_create_from_date_string('20 years'));
        $time = new DateTime();
        $time = $time->format('Y/m/d H:i');
        
        if($data){
          if(array_key_exists('name', $data) && preg_match('/^.{6,255}$/', $data['name']))
            $name = htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8');
          
          if(array_key_exists('hashtag', $data))
            $hashtag = mysqli_real_escape_string($link, $data['hashtag']);
          
          if(array_key_exists('eventStartDate', $data) && date_format($date, 'Y/m/d H:i') >= $data['eventStartDate'] && $time <= $data['eventStartDate']){
            $eventDate = mysqli_real_escape_string($link, $data['eventStartDate']);
            if(array_key_exists('eventEndDate', $data) && $data['eventEndDate'] >= $data['eventStartDate'] && date_format($date, 'Y/m/d H:i') >= $data['eventEndDate'])
            { 
              $duration = strtotime($data['eventEndDate']) - strtotime($data['eventStartDate']);
            }
          }
          if(array_key_exists('location', $data))
            $location = mysqli_real_escape_string($link, $data['location']);
          if(array_key_exists('locationMagicKey', $data))
            $locationMagicKey = mysqli_real_escape_string($link, $data['locationMagicKey']);
          if(array_key_exists('countryCode', $data))
            $countryCode = mysqli_real_escape_string($link, $data['countryCode']);
          if(array_key_exists('isLocal', $data))
            $isLocal = mysqli_real_escape_string($link, $data['isLocal']);
          if(array_key_exists('backgroundImage', $data)){
            if ($data['backgroundImage'] == 'homepage_bg') {
              $background = mysqli_real_escape_string($link, $data['backgroundImage']);
            } else if (is_numeric($data['backgroundImage']) && (int)$data['backgroundImage'] >= 0 && (int)$data['backgroundImage'] < 15 ){
              $background = mysqli_real_escape_string($link, $data['backgroundImage']);  
            }
          }
          if(array_key_exists('description', $data))
            $description = mysqli_real_escape_string($link, $data['description']);
          $username = $DecodedDataArray->data->username;
        }
        
        if($name != '' && ($duration != '' || $duration == 0) && $hashtag != '' && $eventDate != '' && $isLocal != '' && $background != '' && $location != '' && $locationMagicKey != ''){
          
          foreach ($countriesMap as $country) {
            if($countryCode != ''){
              $locationSplitString = array($countryCode);
            } else {
              $locationSplitString = explode(", ", $location);
            }
            if(strcmp($country->alphaThree, end($locationSplitString)) === 0){
                $locationCountryCode = $country->alphaTwo; 
            }
          }
          
          $sql = "INSERT INTO `events` (`createdAt`, `name`, `duration`, `counter`, `hashtag`, `eventDate`, `featured`, `isLocal`, `private`, `background`, `creatorUser`, `location`, `locationMagicKey`, `locationCountryCode`, `description`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

          $autoFillZero = '0';
        
          $descriptionReference = null;
            
          $stmt = $link->prepare($sql);
          $stmt->bind_param('sssssssssssssss', $time, $name, $duration, $autoFillZero, $hashtag, $eventDate, $autoFillZero, $isLocal, $autoFillZero,  $background, $username , $location, $locationMagicKey, $locationCountryCode, $descriptionReference);
          if($description)
            $descriptionReference = $description;
          
          $stmt->execute();
          
          if (mysqli_error($link)) {            
            unset($data['jwtToken']);
            error_log('Add event bad request. Possible duplicate. Username: '.json_encode($username).' Email: '.$DecodedDataArray->data->name.'Data: '.json_encode($data), 0);
            if(mysqli_errno($link) == 1062)
              http_response_code(409);
            else
              http_response_code(400);
          }
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
