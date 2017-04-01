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
        
        $key = $password . $email . $username . date('Ymm');
        $key = md5($key);
         
        //put info into an array to send to the function
        include_once 'swift/swift_required.php';
        $info = array(
            'username' => $username,
            'email' => $email,
            'key' => $key
        );

        //send the email
        if(send_reset_password($info, $configs->myMailUser, $configs->myMailSecret, $configs->eventSnitchUrl)){
            $confirm = mysqli_query($link, "INSERT INTO `confirm_reset` VALUES(NULL,'$userid','$key','$email')"); 
            http_response_code(200);
          }else{
              http_response_code(400);
          } 
      }
      mysqli_close($link);
    } 
    exit();
  }

}
