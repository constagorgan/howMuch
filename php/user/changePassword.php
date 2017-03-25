<?php

class ChangePassword {
  
  public static function changeUserPass(){    
    $data = json_decode(file_get_contents('php://input'), true);

    if(empty($data['email']) || empty($data['password']) || empty($data['newPassword'])){
        http_response_code(400);		
    } else {
        header("Access-Control-Allow-Origin: *");
        // connect to the mysql database
        include(dirname(__DIR__).'/conf/config.inc.php');
        $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
        //cleanup the variables
        $email = mysqli_real_escape_string($link, $data['email']);
        $password = mysqli_real_escape_string($link, $data['password']);
        $newPassword = mysqli_real_escape_string($link, $data['newPassword']);
        //check if the key is in the database
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
    }
  } 
}

?>