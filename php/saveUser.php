<?php

include_once 'functions.php';

class SaveUser {
  
  public static function saveUsers(){    
    $data = json_decode(file_get_contents('php://input'), true);
    $name = '';
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    
    include_once('config.inc.php');
    $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
    mysqli_set_charset($link,'utf8');

    $name = mysqli_real_escape_string($link, $name);
    if($data['email'] && $data['username'] && $data['password']){
      $sql = "INSERT INTO `users` (`email`, `username`, `password`, `active`) VALUES ('".$data['email']."', '".$data['username']."', '".$data['password']."', 0);";
      $result = mysqli_query($link,$sql);
      
      if (!$result) {
        if(mysqli_errno($link) == 1062)
          http_response_code(409);
        else
          http_response_code(400);
      }
      
//      else {
        //put info into an array to send to the function
        include_once 'swift/swift_required.php';
        $info = array(
            'username' => $data['username'],
            'email' => $data['email'],
            'key' => $data['username'] . $data['email'] . date('mY')
        );

        //send the email
        if(send_email($info)){
            //email sent
            $action['result'] = 'success';

        }else{
            $action['result'] = 'error';

        } 
//      }
      mysqli_close($link);
    } 
    exit();
  }

}
