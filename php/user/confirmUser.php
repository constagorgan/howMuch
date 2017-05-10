<?php

class ConfirmUser {
  
  public static function confirmUserSignUp(){    

    if(empty($_GET['email']) || empty($_GET['key'])){
        		
    } else {
      
        include_once 'common/functions.php'; 
        $configs = include('config.php');
        header("Access-Control-Allow-Origin: ".$configs->eventSnitchCORS);
      
        $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
        //cleanup the variables
        $email = mysqli_real_escape_string($link, $_GET['email']);
        $key = mysqli_real_escape_string($link, $_GET['key']);
        $hashedKey = hash('sha512', $key);
        //check if the key is in the database
        $stmt = $link->prepare("SELECT id, userid FROM `confirm_user` WHERE `email` = ? AND `key` = ? AND expirationDate >= NOW() LIMIT 1");
        $stmt->bind_param('ss', $email, $hashedKey);
        $stmt->execute();

        $check_key = $stmt->get_result();
      
        if(mysqli_num_rows($check_key) != 0){
            //get the confirm info
            $confirm_info = mysqli_fetch_assoc($check_key);

            //confirm the email and update the users database
            $stmtTwo = $link->prepare("UPDATE `users` SET `active` = 1 WHERE `id` = ? LIMIT 1");
            $stmtTwo->bind_param('s', $confirm_info['userid']);
            $stmtTwo->execute();
          
            if(!mysqli_error($link)){
                //delete the confirm row  
                $stmtThree = $link->prepare("DELETE FROM `confirm_user` WHERE `id` = ? LIMIT 1");
                $stmtThree->bind_param('s', $confirm_info['id']);
                $stmtThree->execute();

                echo '{"message": "Thank you for registering!"}';
                http_response_code(200);
            }else{
              error_log('Confirm user error at updating user\'s status. '.json_encode($email), 0);
              echo '{"message": "Could not register!"}';
                if(mysqli_errno($link) == 1062)
                  http_response_code(409);
                else
                  http_response_code(400);
            }

        } else{
            error_log('Confirm user error. Invalid token. '.json_encode($email), 0);
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