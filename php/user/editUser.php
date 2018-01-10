<?php

require_once('vendor/autoload.php');
use \Firebase\JWT\JWT; 

class EditUser {
  
  public static function editUsers(){    
    $data = json_decode(file_get_contents('php://input'), true);
    // connect to the mysql database
    require_once 'recaptchalib.php';
    $configs = include('config.php');
    
    $http_origin = $_SERVER['HTTP_ORIGIN'];
    if ($configs->allowCorsLocal == true || $http_origin == "http://localhost:8001" || $http_origin == "https://www.eventsnitch.com")
    {  
        header("Access-Control-Allow-Origin: $http_origin");
    }
    
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    mysqli_set_charset($link,'utf8');
    
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
        try { 
          $DecodedDataArray = JWT::decode($token, $configs->mySecretKeyJWT, array($configs->mySecretAlgorithmJWT));  
          
          $date = new DateTime();
          date_sub($date, date_interval_create_from_date_string('4 years + 364 days'));
          
          if($data && array_key_exists('birthDate', $data) && array_key_exists('country', $data) && array_key_exists('recaptchaCode', $data)) {
            if (date_format($date, 'Y/m/d') <= $data['birthDate'] || '1900/01/01' >= $data['birthDate']) {
              error_log('Edit user invalid request. Invalid parameters. '.json_encode($DecodedDataArray->data->name), 0);
              http_response_code(400);
            } else {     
              $country = mysqli_real_escape_string($link, $data['country']);

              $stmt = $link->prepare("SELECT name from `country` WHERE code=?");
              $stmt->bind_param('s', $country);
              $stmt->execute();

              $countryResult = $stmt->get_result();

              if (!$countryResult || !$countryResult->num_rows) {
                  error_log('Edit user invalid request. Country code is not in DB. '.json_encode($DecodedDataArray->data->name).' Country: '.$country, 0);
                  http_response_code(400);
              }
              else {
                $birthDate = mysqli_real_escape_string($link, $data['birthDate']);
                
                $stmtTwo = $link->prepare("update `users` set country=?, birthDate=? WHERE id=?");            
                $stmtTwo->bind_param('sss', $country, $birthDate, $DecodedDataArray->data->id);
                $stmtTwo->execute();

                if (mysqli_error($link)) {
                  http_response_code(400);
                }
                else {
                  http_response_code(200);
                }
              } 
              mysqli_close($link);
            }
          } else {
            error_log('Edit user invalid request. Missing parameters. ', 0);
            http_response_code(400);
          }
        } catch (Exception $e) {
          unset($data['jwtToken']);   
          error_log('Edit event invalid token. Data:'.json_encode($data), 0);
          http_response_code(401);
        }
      } else {
        error_log('Invalid captcha code.', 0);
        http_response_code(400);
      }
    } else {
      error_log('No token.', 0);
      http_response_code(400);
    }
    exit();
  }
}
