<?php

require_once('vendor/autoload.php');
use \Firebase\JWT\JWT; 

class ChangePassword {
  
  public static function changeUserPass(){    
    $data = json_decode(file_get_contents('php://input'), true);
    $configs = include('config.php');
    if(empty($data['email']) || empty($data['password']) || empty($data['newPassword'])){
        http_response_code(400);	
    } else {
      if($data && array_key_exists('jwtToken', $data)){
        $token = $data['jwtToken'];
        try {
          
          $secretKey = base64_decode($configs->mySecretKeyJWT); 
          $DecodedDataArray = JWT::decode($token, $secretKey, array($configs->mySecretAlgorithmJWT));
          
          header("Access-Control-Allow-Origin: *");
          
          $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
          
          $email = mysqli_real_escape_string($link, $data['email']);
          $password = mysqli_real_escape_string($link, $data['password']);
          $newPassword = mysqli_real_escape_string($link, $data['newPassword']);
          
          $check_key = mysqli_query($link, "SELECT * FROM users WHERE `email` = '$email' AND `password` = '$password' LIMIT 1") or die(mysqli_error($link));
          
          if(mysqli_num_rows($check_key) != 0){
              //get the confirm info
              $confirm_info = mysqli_fetch_assoc($check_key);

              $update_users = mysqli_query($link, "UPDATE `users` SET `password` = '$newPassword' WHERE `email` = '$email' LIMIT 1") or die(mysqli_error($link));

              if($update_users){
                http_response_code(200);
              }else{
                if(mysqli_errno($link) == 1062)
                  http_response_code(409);
                else
                  http_response_code(400);
              }

          } else{
            http_response_code(401);
          }
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
}

?>