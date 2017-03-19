<?php
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
      $sql = "INSERT INTO `users` (`email`, `username`, `password`) VALUES ('".$data['email']."', '".$data['username']."', '".$data['password']."');";
      $result = mysqli_query($link,$sql);

      if (!$result) {
        if(mysqli_errno($link) == 1062)
          http_response_code(409);
        else
          http_response_code(400);
      }
      
      mysqli_close($link);
    } 
    exit();
  }

}
