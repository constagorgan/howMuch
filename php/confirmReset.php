<?php

class ConfirmReset {
  
  public static function confirmUserPassReset(){    

    if(empty($_GET['email']) || empty($_GET['key']) || empty($_GET['username'])){
        		
    } else {
        header("Access-Control-Allow-Origin: *");
        // connect to the mysql database
        include('config.inc.php');
        $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
        //cleanup the variables
        $email = mysqli_real_escape_string($link, $_GET['email']);
        $key = mysqli_real_escape_string($link, $_GET['key']);
        $username = mysqli_real_escape_string($link, $_GET['username']);
        //check if the key is in the database
        $check_key = mysqli_query($link, "SELECT * FROM `confirm_reset` WHERE `email` = '$email' AND `key` = '$key' LIMIT 1") or die(mysqli_error($link));
        if(mysqli_num_rows($check_key) != 0){
            //get the confirm info
            $confirm_info = mysqli_fetch_assoc($check_key);
            $newPassword = substr(md5(rand()), 0, 8);
            $hashedNewPass = md5($newPassword);
            //confirm the email and update the users database
            $update_users = mysqli_query($link, "UPDATE `users` SET `password` = '$hashedNewPass' WHERE `id` = '$confirm_info[userid]' LIMIT 1") or die(mysqli_error());
            //delete the confirm row  
            $delete = mysqli_query($link, "DELETE FROM `confirm_reset` WHERE `id` = '$confirm_info[id]' LIMIT 1") or die(mysqli_error($link));

            if($update_users){
              include_once 'swift/swift_required.php';
              $info = array(
                'username' => $username,
                'email' => $email,
                'password' => $newPassword
              );

            if(send_reset_new_password($info)){
              http_response_code(200);
              //email sent
              $action['result'] = 'success';

              }else{
                  $action['result'] = 'error';
              } 
              echo 'Password has been succesfully reset!';
            }else{
                if(mysqli_errno($link) == 1062)
                  http_response_code(409);
                else
                  http_response_code(400);
              echo 'Could not reset password!';
            }

        } else{
             if(mysqli_errno($link) == 1062)
                http_response_code(409);
              else
                http_response_code(400);
        }
    }
  } 
}

?>