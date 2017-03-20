<?php
class SearchEvent {
  
  public static function searchEvents(){
    include_once('config.inc.php');
    $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
    $name = '';
    if(isset ( $_GET["name"] ))
      $name = mysqli_real_escape_string($link, $_GET['name']);
    $index = '';
    if(isset ( $_GET["index"] ))
      $index = mysqli_real_escape_string($link, $_GET['index']);
    if($name != ''){
      header("Access-Control-Allow-Origin: *");
      // connect to the mysql database
      mysqli_set_charset($link,'utf8');

      $sql = "select * from events WHERE Name LIKE '%$name%' ORDER BY events.counter DESC ";
      if($index != ''){
        $i = $index*10;
        $sql .= "LIMIT 10 OFFSET $i;";
      } else {
        $sql .= "LIMIT 5;";
      }
      $result = mysqli_query($link,$sql);

      if (!$result) {
        http_response_code(400);
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
