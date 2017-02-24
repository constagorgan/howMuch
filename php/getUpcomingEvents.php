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
      $sql = "select * from events WHERE eventDate >= CURDATE() ORDER BY eventDate ASC LIMIT 10 OFFSET $i;";

      $result = mysqli_query($link,$sql);

      if (!$result) {
        http_response_code(404);
        die(mysqli_error());
      }

      $rows = array();
      while($r = mysqli_fetch_assoc($result)) {
        $rows[] = $r;
      }
      print json_encode($rows);

      mysqli_close($link);
      exit();
      }
  }

}