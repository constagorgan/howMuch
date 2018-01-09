<?php

class ConfirmReset {
  public static function random_str($length, $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
  {   
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
    
        $http_origin = $_SERVER['HTTP_ORIGIN'];
        if ($configs->allowCorsLocal == true || $http_origin == "http://localhost:8001" || $http_origin == "https://www.eventsnitch.com")
        {  
            header("Access-Control-Allow-Origin: $http_origin");
        }
    
        $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);

        $email = mysqli_real_escape_string($link, $_GET['email']);
        $key = mysqli_real_escape_string($link, $_GET['key']);
        $hashedKey = hash('sha512', $key);
        $username = mysqli_real_escape_string($link, $_GET['username']);
        
        $stmt = $link->prepare("SELECT id, userid FROM `confirm_reset` WHERE `email` = ? AND `key` = ? AND expirationDate >= NOW() LIMIT 1");
        $stmt->bind_param('ss', $email, $hashedKey);
        $stmt->execute();
        $check_key = $stmt->get_result();
        if(mysqli_num_rows($check_key) != 0){
            //get the confirm info
            $confirm_info = mysqli_fetch_assoc($check_key);
            $new_password = self::random_str(10); 
            $new_hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

            //confirm the email and update the users database
            $time = new DateTime();
            $time = $time->format('Y-m-d H:i:s');
          
            $stmtTwo = $link->prepare("UPDATE `users` SET `password` = ?, `lastPassChange` = ? WHERE `id` = ? LIMIT 1");
            $stmtTwo->bind_param('sss', $new_hashed_password, $time, $confirm_info['userid']);
            $stmtTwo->execute();
          
            if(!mysqli_error($link)){
                //delete the confirm row  
                $stmtThree = $link->prepare("DELETE FROM `confirm_reset` WHERE `id` = ? LIMIT 1");
                $stmtThree->bind_param('s', $confirm_info['id']);
                $stmtThree->execute();

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
