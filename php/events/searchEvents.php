<?php
class SearchEvent {
  
  public static function searchEvents(){
    $configs = include('config.php');
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
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
      
      $nameSplit = explode(" ", $name);
      $nameJoin = 'WHERE ((';
      for($i=0; $i<count($nameSplit); $i++){
        $nameJoin .= "events.Name LIKE '%$nameSplit[$i]%' ";
        if($i <count($nameSplit)-1){
          $nameJoin .= "AND ";
        }
      }
      $nameJoin .= ") OR events.creatorUser LIKE '%$name%') ";
      
      $sql = "select events.*, country.name AS 'countryName', cities.name AS 'cityName', region.name AS 'regionName' from country INNER JOIN region ON country.countryId = region.countryId INNER JOIN cities ON region.regionId = cities.regionId INNER JOIN cities_map ON cities_map.city_id = cities.cityId INNER JOIN events ON events.id = cities_map.event_id ";
      
      $sql .= $nameJoin;   
      
      $sql .= "GROUP BY events.id ORDER BY events.counter DESC ";
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
