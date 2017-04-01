<?php

class ConfirmUser {
  
  public static function confirmUserSignUp(){    

    if(empty($_GET['email']) || empty($_GET['key'])){
        		
    } else {
        header("Access-Control-Allow-Origin: *");
        // connect to the mysql database
      
        include_once 'common/functions.php'; 
        $configs = include('config.php');
      
        $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
        //cleanup the variables
        $email = mysqli_real_escape_string($link, $_GET['email']);
        $key = mysqli_real_escape_string($link, $_GET['key']);
        $hashedKey = hash('sha512', $key);
        //check if the key is in the database
        $check_key = mysqli_query($link, "SELECT * FROM `confirm_user` WHERE `email` = '$email' AND `key` = '$hashedKey' AND expirationDate >= NOW() LIMIT 1") or die(mysqli_error($link));
        if(mysqli_num_rows($check_key) != 0){
            //get the confirm info
            $confirm_info = mysqli_fetch_assoc($check_key);

            //confirm the email and update the users database
            $update_users = mysqli_query($link, "UPDATE `users` SET `active` = 1 WHERE `id` = '$confirm_info[userid]' LIMIT 1") or die(mysqli_error($link));
            //delete the confirm row  
            $delete = mysqli_query($link, "DELETE FROM `confirm_user` WHERE `id` = '$confirm_info[id]' LIMIT 1") or die(mysqli_error($link));

            if($update_users){
                echo '{"message": "Thank you for registering!"}';
                http_response_code(200);
            }else{
              echo '{"message": "Could not register!"}';
                if(mysqli_errno($link) == 1062)
                  http_response_code(409);
                else
                  http_response_code(400);
            }

        } else{
            echo '{"message": "Bad request!"}';
            if(mysqli_errno($link) == 1062)
              http_response_code(409);
            else
              http_response_code(400);
        }
    }
  } 
}

?>