<?php
class SearchEvent {
  
  public static function searchEvents(){
    $name = $_GET['name'];
    if($name){
      header("Access-Control-Allow-Origin: *");
      // connect to the mysql database
      include_once('config.inc.php');
      $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
      mysqli_set_charset($link,'utf8');

      $sql = "select * from events WHERE Name LIKE '$name%' LIMIT 5";
      $result = mysqli_query($link,$sql);

      if (!$result) {
        http_response_code(404);
        die(mysqli_error());
      }

      echo '[';
      for ($i=0;$i<mysqli_num_rows($result);$i++) {
        echo ($i>0?',':'').json_encode(mysqli_fetch_object($result));
      }
      echo ']';

      mysqli_close($link);
      exit();
    }
  }
}
