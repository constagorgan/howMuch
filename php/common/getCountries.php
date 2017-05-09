<?php
class GetCountry {
  
  public static function getCountries(){
    $configs = include('config.php');
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    header("Access-Control-Allow-Origin: ".$configs->eventSnitchCORS);
    // connect to the mysql database
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
