<?php

class SaveUser {
  
  public static function saveUsers(){    
    $data = json_decode(file_get_contents('php://input'), true);
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    include_once 'common/functions.php'; 
    $configs = include('config.php');
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    mysqli_set_charset($link,'utf8');
    
    if($data['email'] && $data['username'] && $data['password']){
      $email = mysqli_real_escape_string($link, $data['email']);
      if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        http_response_code(400);
      } else {
        $username = mysqli_real_escape_string($link, $data['username']);
        $password = mysqli_real_escape_string($link, $data['password']);
        
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO `users` (`email`, `username`, `password`, `active`) VALUES ('$email', '$username', '$hashed_password', 0);";
        $result = mysqli_query($link,$sql);

        if (!$result) {
          if(mysqli_errno($link) == 1062)
            http_response_code(409);
          else
            http_response_code(400);
        }

        else {
          $userid = mysqli_insert_id($link);
          //create a random key
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
          //send the email
          if(send_signup_email($info, $configs->myMailUser, $configs->myMailSecret, $configs->eventSnitchUrl)){
              //email sent
              $confirm = mysqli_query($link, "INSERT INTO `confirm_user` VALUES(NULL,'$userid','$hashedKey','$email', '$expirationDate')"); 
              http_response_code(200);

          }else{
              http_response_code(400);
          } 
        } 
        mysqli_close($link);
      }
    } 
    exit();
  }

}
