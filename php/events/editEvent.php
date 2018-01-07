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
    require_once 'recaptchalib.php';   
    
    $http_origin = $_SERVER['HTTP_ORIGIN'];
    if ($configs->allowCorsLocal == true || $http_origin == "http://localhost:8001" || $http_origin == "https://www.eventsnitch.com")
    {  
        header("Access-Control-Allow-Origin: $http_origin");
    }
    
    $secret = $configs->myCaptchaUlimateSecret;
    $response = null;
    $reCaptcha = new ReCaptcha($secret);
    
    if($data && array_key_exists('jwtToken', $data)){
      $token = $data['jwtToken'];
      
      $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
      
              
      $response = $reCaptcha->verifyResponse(
        $_SERVER["REMOTE_ADDR"],
        mysqli_real_escape_string($link, $data['recaptchaCode'])
      );
      if ($response != null && $response->success) {
          
        if(array_key_exists('id', $data))
          $key = mysqli_real_escape_string($link, $data['id']);

        if(array_key_exists('id', $data) && $key){
          $sqlFind = "select id, name, eventDate, description, creatorUser, duration, featured, private, isLocal, background, location, locationMagicKey, locationCountryCode from events WHERE id=?;";

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
              $eventDate = '';
              $private = '';
              $isLocal = '';
              $background = ''; 
              $location = '';
              $countryCode = '';
              $locationMagicKey = '';
              $locationCountryCode = '';
              $description = '';

              $date = new DateTime();
              date_add($date, date_interval_create_from_date_string('20 years + 1 day'));
              $time = new DateTime();
              date_sub($time, date_interval_create_from_date_string('1 day'));
              $time = date_format($time, 'Y/m/d H:i');
              
              if($data){
                if(array_key_exists('name', $data) && preg_match('/^.{6,80}$/', $data['name'])){
                  $name = htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8');
                  //schimbate keywordurile DOAR daca numele e diferit de fostul nume
                }
                
                if(array_key_exists('eventStartDate', $data) && date_format($date, 'Y/m/d H:i') >= $data['eventStartDate'] && $time <= $data['eventStartDate']){
                  $eventDate = mysqli_real_escape_string($link, $data['eventStartDate']);
                  if(array_key_exists('eventEndDate', $data) && $data['eventEndDate'] >= $data['eventStartDate'] && date_format($date, 'Y/m/d H:i') >= $data['eventEndDate'])
                  { 
                    $duration = strtotime($data['eventEndDate']) - strtotime($data['eventStartDate']);
                  }
                }
                if(array_key_exists('location', $data))
                  $location = htmlspecialchars($data['location'], ENT_QUOTES, 'UTF-8');
                if(array_key_exists('locationMagicKey', $data))
                  $locationMagicKey = htmlspecialchars($data['locationMagicKey'], ENT_QUOTES, 'UTF-8');
                if(array_key_exists('countryCode', $data))
                  $countryCode = htmlspecialchars($data['countryCode'], ENT_QUOTES, 'UTF-8');      
                if(array_key_exists('isLocal', $data))
                  $isLocal = htmlspecialchars($data['isLocal'], ENT_QUOTES, 'UTF-8');  
                if(array_key_exists('backgroundImage', $data)){
                  if ($data['backgroundImage'] == 'homepage_bg') {
                    $background = mysqli_real_escape_string($link, $data['backgroundImage']);
                  } else if (is_numeric($data['backgroundImage']) && (int)$data['backgroundImage'] >= 0 && (int)$data['backgroundImage'] < 69 ){
                    $background = htmlspecialchars($data['backgroundImage'], ENT_QUOTES, 'UTF-8');  
                  }
                }
                if(array_key_exists('description', $data)) {
                  if(strlen($data['description']) > 10000) {
                    error_log('Edit event invalid description. Email: '.$DecodedDataArray->data->name.' Data: '.json_encode($data), 0);
                    http_response_code(400);
                  } else {
                    $description = htmlspecialchars($data['description'], ENT_QUOTES, 'UTF-8');
                  }
                }
              }
              
              if($name != '' && ($duration != '' || $duration == 0) && $eventDate != '' && $isLocal != '' && $background != '' && $location != '' && $locationMagicKey != '') {
                $sql = "UPDATE `events` SET ";
                $bind = array();
                $dataCount = count($data);
                $dataCount -= 1;
                if($name != ''){
                  $sql .= "name=?, ";
                  array_push($bind, $name);
                  if($name != $rows[0]['name']) {
                    include_once 'common/getKeywords.php'; 
                    $keywords = getKeywords($data['name']);
                    $keywordsString = join(' ', $keywords);

                    $sql .= "hashtag=?, ";
                    $dataCount += 1;
                    array_push($bind, $keywordsString);
                  }
                }
                if($eventDate != ''){ 
                  $sql .= "eventDate=?, ";
                  array_push($bind, $eventDate); 
                  if(($duration != '' || $duration == 0)){
                    $sql .= "duration=?, ";
                    array_push($bind, $duration);
                  }
                }
                if($isLocal != '') {              
                  $sql .= "isLocal=?, ";
                  array_push($bind, $isLocal);
                }   
                if($background != '') {
                  $sql .= "background=?, ";
                  array_push($bind, $background);
                }     
                if($description != ''){
                  $sql .= "description=?, ";
                  array_push($bind, $description);
                } else if (array_key_exists('description', $data)) {
                  $dataCount -= 1;
                }
                if($location != '' && $locationMagicKey != ''){
                  $sql .="location=?, locationMagicKey=?, ";
                  
                  array_push($bind, $location, $locationMagicKey);
                  
                  foreach ($countriesMap as $country) {
                    if($countryCode != ''){
                      if(strcmp($country->fullName, $countryCode) === 0){
                        $locationCountryCode = $country->alphaTwo; 
                      }
                    }
                  }
                  if($locationCountryCode != ''){
                    $sql .="locationCountryCode=?, ";
                    array_push($bind, $locationCountryCode);
                  } else {
                    if($countryCode != "") {
                      $dataCount -= 1;
                    }
                  }
                  if($countryCode == "" && array_key_exists('countryCode', $data)) {
                    $dataCount -= 1;
                  }
                  
                }  else if (($location != '' && $locationMagicKey == '') || ($location == '' && $locationMagicKey != '')){
                  $dataCount -= 1;  
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
        error_log('Invalid captcha code.', 0);
        http_response_code(400);
      }
    } else {
        unset($data['jwtToken']);   
        error_log('Edit event missing token. Data:'.json_encode($data), 0);
        http_response_code(401);
    }
  }
}
