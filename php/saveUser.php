<?php

include_once 'functions.php';

class SaveUser {
  
  public static function saveUsers(){    
    $data = json_decode(file_get_contents('php://input'), true);
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    include('config.inc.php');
    $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
    mysqli_set_charset($link,'utf8');

    if($data['email'] && $data['username'] && $data['password']){
      $sql = "INSERT INTO `users` (`email`, `username`, `password`, `active`) VALUES ('".$data['email']."', '".$data['username']."', '".$data['password']."', 0);";
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
        $key = $data['username'] . $data['email'] . $data['password'] . date('mmY');
        $key = md5($key);
        
        //add confirm row
        include('config.inc.php'); 
        $confirm = mysqli_query($link, "INSERT INTO `confirm` VALUES(NULL,'$userid','$key','".$data['email']."')"); 
        //put info into an array to send to the function
        include_once 'swift/swift_required.php';
        $info = array(
            'username' => $data['username'],
            'email' => $data['email'],
            'key' => $key
        );

        //send the email
        if(send_email($info)){
            //email sent
            $action['result'] = 'success';

        }else{
            $action['result'] = 'error';

        } 
      }
      mysqli_close($link);
    } 
    exit();
  }

}
