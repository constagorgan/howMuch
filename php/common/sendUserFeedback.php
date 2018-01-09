<?php

class SendUserEmail {
  public static function sendUserFeedback() {    
    $data = json_decode(file_get_contents('php://input'), true);
    // connect to the mysql database
    include_once 'common/functions.php'; 
    $configs = include('config.php');
    
    $http_origin = $_SERVER['HTTP_ORIGIN'];
    if ($configs->allowCorsLocal == true || $http_origin == "http://localhost:8001" || $http_origin == "https://www.eventsnitch.com" ||  $http_origin == "https://eventsnitch.com")
    {  
      header("Access-Control-Allow-Origin: $http_origin");
    }
    
    if($data && array_key_exists('email', $data) && array_key_exists('name', $data) && array_key_exists('message', $data)){
      $email = $data['email']; 
      if(filter_var($email, FILTER_VALIDATE_EMAIL) === false || strlen($data['name']) < 6 || strlen($data['name']) > 20 || strlen($data['message']) > 1500 || (array_key_exists('phone', $data) && !preg_match('/^([0-9.,+() ]){6,20}$/', $data['phone']))) {
        error_log('Send feedback mail failed. Invalid data '.json_encode($data), 0);
        http_response_code(400);
      } else {
        $name = $data['name'];     
        $message = $data['message'];     
        $phone = '';
        if(array_key_exists('phone', $data)) {
          $phone = $data['phone'];
        }
        $ip = '';
        if (!empty($_SERVER['HTTP_CLIENT_IP'])){
          $ip=$_SERVER['HTTP_CLIENT_IP'];
        }elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])){
          $ip=$_SERVER['HTTP_X_FORWARDED_FOR'];
        }else{
          $ip=$_SERVER['REMOTE_ADDR'];
        }
        include_once 'swift/swift_required.php';
        $info = array(
            'name' => $name,
            'email' => $email,
            'message' => $message,
            'phone' => $phone,
            'ip' => $ip
        );
        $ip = ip2long($ip);
        if(send_feedback_email($info, $configs->myMailUser, $configs->myMailSecret, $configs->eventSnitchUrl)){
          http_response_code(200);
        } else{              
          error_log('Send feedback mail failed.'.json_encode($email), 0);
          http_response_code(400);
        } 
      }   
    } else {
      error_log('Send feedback mail failed. Invalid data '.json_encode($data), 0);
      http_response_code(400);
    }
    exit();
  }
}

?>
