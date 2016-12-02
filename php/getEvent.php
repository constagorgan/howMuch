<?php
class GetEvent {
  
  public static function getEvents(){
    $key = $_GET['id'];
    if($key){
      header("Access-Control-Allow-Origin: *");
      // connect to the mysql database
      include_once('config.inc.php');
      $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
      mysqli_set_charset($link,'utf8');

      $sql = "update events set Counter=Counter+1 where id=$key";
      $result = mysqli_query($link,$sql);
      
      $sql = "select * from events WHERE id=$key";
      $result = mysqli_query($link,$sql);

      if (!$result) {
        http_response_code(404);
        die(mysqli_error());
      }

      if (!$key) echo '[';
      for ($i=0;$i<mysqli_num_rows($result);$i++) {
        echo ($i>0?',':'').json_encode(mysqli_fetch_object($result));
      }
      if (!$key) echo ']';

      mysqli_close($link);
      exit();
    }
  }

}