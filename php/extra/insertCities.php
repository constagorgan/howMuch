<?php
class InsertEvents {
  
  public static function insertEventss(){
    $configs = include('config.php');
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    
    $http_origin = $_SERVER['HTTP_ORIGIN'];
    if ($configs->allowCorsLocal == true || $http_origin == "http://localhost:8001" || $http_origin == "http://www.eventsnitch.com")
    {  
        header("Access-Control-Allow-Origin: $http_origin");
    }

    mysqli_set_charset($link,'utf8');
    for($i=363; $i<600; $i++){
      $j = rand(1,235);
    $sql = "insert into `countries_map` (`country_id`, `event_id`) VALUES ('$j', '$i')";
    
    $result = mysqli_query($link,$sql);
    
    if (!$result) {
      http_response_code(400);
      }
    }
    
    mysqli_close($link);
    exit();
  }

}
