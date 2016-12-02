<?php
class GetUpcomingEvent {
  
  public static function getUpcoming(){
    $index = $_GET['index'];
      if(!is_null($index)){
      header("Access-Control-Allow-Origin: *");
      // connect to the mysql database
      include_once('config.inc.php');
      $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
      mysqli_set_charset($link,'utf8');
      $i = $index*10;
      $sql = "select * from events ORDER BY EventDate DESC LIMIT 10 OFFSET $i;";

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