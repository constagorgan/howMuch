<?php

class ConfirmUser {
  
  public static function confirmUserSignUp(){    

    if(empty($_GET['email']) || empty($_GET['key'])){
        		
    } else {
        header("Access-Control-Allow-Origin: *");
        // connect to the mysql database
        include('config.inc.php');
        $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
        //cleanup the variables
        $email = mysqli_real_escape_string($link, $_GET['email']);
        $key = mysqli_real_escape_string($link, $_GET['key']);
      
        //check if the key is in the database
        $check_key = mysqli_query($link, "SELECT * FROM `confirm_user` WHERE `email` = '$email' AND `key` = '$key' LIMIT 1") or die(mysqli_error($link));
        if(mysqli_num_rows($check_key) != 0){
            //get the confirm info
            $confirm_info = mysqli_fetch_assoc($check_key);

            //confirm the email and update the users database
            $update_users = mysqli_query($link, "UPDATE `users` SET `active` = 1 WHERE `id` = '$confirm_info[userid]' LIMIT 1") or die(mysqli_error($link));
            //delete the confirm row  
            $delete = mysqli_query($link, "DELETE FROM `confirm_user` WHERE `id` = '$confirm_info[id]' LIMIT 1") or die(mysqli_error($link));

            if($update_users){
                http_response_code(200);
                echo 'Thank you for registering!';
            }else{
                if(mysqli_errno($link) == 1062)
                  http_response_code(409);
                else
                  http_response_code(400);
              echo 'Could not register!';
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