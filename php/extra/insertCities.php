<?php
class InsertEvents {
  
  public static function insertEventss(){
    $configs = include('config.php');
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    mysqli_set_charset($link,'utf8');
    for($i=457; $i<467; $i++){
    $sql = "insert into `categories_map` (`category_id`, `event_id`) VALUES ('Technology', '$i')";
    
    $result = mysqli_query($link,$sql);
    
    if (!$result) {
      http_response_code(400);
      }
    }
    
    mysqli_close($link);
    exit();
  }

}
