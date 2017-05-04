<?php

class ConfirmReset {
  public static function random_str($length, $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
  {   
      include_once('random_compat/lib/random.php');
      $str = '';
      $max = mb_strlen($keyspace, '8bit') - 1;
      for ($i = 0; $i < $length; ++$i) {
          $str .= $keyspace[random_int(0, $max)];
      }
      return $str;
  }
  
  public static function confirmUserPassReset(){    
    if(empty($_GET['email']) || empty($_GET['key']) || empty($_GET['username'])){
    } else {
        include_once 'common/functions.php'; 
        $configs = include('config.php');
        header("Access-Control-Allow-Origin: ".$configs->eventSnitchUrl);
        $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);

        $email = mysqli_real_escape_string($link, $_GET['email']);
        $key = mysqli_real_escape_string($link, $_GET['key']);
        $hashedKey = hash('sha512', $key);
        $username = mysqli_real_escape_string($link, $_GET['username']);
      
        $check_key = mysqli_query($link, "SELECT id, userid FROM `confirm_reset` WHERE `email` = '$email' AND `key` = '$hashedKey' AND expirationDate >= NOW() LIMIT 1") or die(mysqli_error($link));
      
      
        if(mysqli_num_rows($check_key) != 0){
            //get the confirm info
            $confirm_info = mysqli_fetch_assoc($check_key);
            $new_password = self::random_str(10); 
            $new_hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

            //confirm the email and update the users database
            $time = new DateTime();
            $time = $time->format('Y-m-d H:i:s');
          
            $update_users = mysqli_query($link, "UPDATE `users` SET `password` = '$new_hashed_password', `lastPassChange` = '$time' WHERE `id` = '$confirm_info[userid]' LIMIT 1") or die(mysqli_error());
            //delete the confirm row  
            $delete = mysqli_query($link, "DELETE FROM `confirm_reset` WHERE `id` = '$confirm_info[id]' LIMIT 1") or die(mysqli_error($link));

            if($update_users){
              include_once 'swift/swift_required.php';
              $info = array(
                'username' => $username,
                'email' => $email,
                'password' => $new_password
              );

              if(send_reset_new_password($info, $configs->myMailUser, $configs->myMailSecret)){
                echo '{"message": "Password has been succesfully reset. An email has been sent to '.$email.' with the new password!"}';
                http_response_code(200);
              } else{
                error_log('Confirm reset password email send error '.json_encode($email), 0);
                echo '{"message": "Could not reset password!"}';
                if(mysqli_errno($link) == 1062)
                  http_response_code(409);
                else
                  http_response_code(400);
              }
            }else{            
                error_log('Confirm reset password error at updating user\'s password. '.json_encode($email), 0);
                echo '{"message": "Could not reset password!"}';
                if(mysqli_errno($link) == 1062)
                  http_response_code(409);
                else
                  http_response_code(400);
            }

        } else{
           error_log('Confirm reset password error. Token is invalid. '.json_encode($email), 0);
           if(mysqli_errno($link) == 1062)
              http_response_code(409);
            else
              http_response_code(400);
        }
    }
  } 
}

?>
