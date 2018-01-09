<?php
class GetCountry {
  
  public static function getCountries(){
    $configs = include('config.php');
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    
    $http_origin = $_SERVER['HTTP_ORIGIN'];
    if ($configs->allowCorsLocal == true || $http_origin == "http://localhost:8001" || $http_origin == "https://www.eventsnitch.com" ||  $http_origin == "https://eventsnitch.com")
    {  
        header("Access-Control-Allow-Origin: $http_origin");
    }
    
    mysqli_set_charset($link,'utf8');
    $sql = "select code, name from country WHERE NOT country.code='world' ORDER BY name";
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
