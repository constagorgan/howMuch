<?php

class ResetPassword {
  
  public static function resetUserPass(){    
    $data = json_decode(file_get_contents('php://input'), true);
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    include_once 'common/functions.php'; 
    $configs = include('config.php');
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    mysqli_set_charset($link,'utf8');

    if($data['email']){
      $email = mysqli_real_escape_string($link, $data['email']);
      $sql = "SELECT * FROM users WHERE `email` = '$email' LIMIT 1;";
      $result = mysqli_query($link,$sql);
      
      if (!$result) {
        if(mysqli_errno($link) == 1062)
          http_response_code(409);
        else
          http_response_code(400);
      }
      
      else {
        while($r = mysqli_fetch_assoc($result)) {
          $userid = $r['id'];
          $password = $r['password'];
          $username = $r['username'];
        }
        if(!isset($password) || !isset($email) || !isset($username)){
          http_response_code(400);
        } else {
          $length = 20;
          $key = bin2hex(openssl_random_pseudo_bytes(16));    
          //put info into an array to send to the function
          include_once 'swift/swift_required.php';
          $info = array(
              'username' => $username,
              'email' => $email,
              'key' => $key
          );
          $hashedKey = hash('sha512', $key);
          $expirationDate = (new DateTime('+1 day'))->format('Y-m-d H:i:s');

          if (!empty($_SERVER['HTTP_CLIENT_IP'])){
            $ip=$_SERVER['HTTP_CLIENT_IP'];
          //Is it a proxy address
          }elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])){
            $ip=$_SERVER['HTTP_X_FORWARDED_FOR'];
          }else{
            $ip=$_SERVER['REMOTE_ADDR'];
          }
          $ip = ip2long($ip);
          
          if(send_reset_password($info, $configs->myMailUser, $configs->myMailSecret, $configs->eventSnitchUrl)){
              $confirm = mysqli_query($link, "INSERT INTO `confirm_reset` VALUES(NULL,'$userid','$hashedKey','$email', '$expirationDate', '$ip')"); 
              http_response_code(200);
            }else{
                http_response_code(400);
            } 
        }
      }
      mysqli_close($link);
    } 
    exit();
  }

}
