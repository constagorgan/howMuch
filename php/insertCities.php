<?php
class InsertEvents {
  
  public static function insertEventss(){
    include_once('config.inc.php');
    $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    mysqli_set_charset($link,'utf8');
    for($i=24; $i<214; $i++){
    $sql = "insert into `cities_map` (`city_id`, `event_id`) VALUES ('2512321', '$i')";
    
    $result = mysqli_query($link,$sql);
    
    if (!$result) {
      http_response_code(400);
    }
    }
   
    print json_encode($rows);
    
    mysqli_close($link);
    exit();
  }

}
