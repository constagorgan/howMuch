<?php
class GetUpcomingEvent {
  
  public static function getUpcoming(){
    include_once('config.inc.php');
    $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
    $index = '';
    $categoryId = '';
    $orderType = '';
    $name = '';
    $local = '';
    if(isset ( $_GET["index"] ))
      $index = mysqli_real_escape_string($link, $_GET['index']);
    if(isset ( $_GET["categoryId"] ))
      $categoryId = mysqli_real_escape_string($link, $_GET['categoryId']);
    if(isset ( $_GET["orderType"] ))
      $orderType = mysqli_real_escape_string($link, $_GET['orderType']);
    if(isset ( $_GET["name"] ))
      $name = mysqli_real_escape_string($link, $_GET['name']);
    if(isset ( $_GET["country_code"] ))
      $local = mysqli_real_escape_string($link, $_GET['country_code']);
    
    $object=new stdClass();
    
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    mysqli_set_charset($link,'utf8');
    $sqlFirstQuery = "";
    $sqlSecondQuery = "select count(*) as totalResults from (";
      
    $sql = "select events.*, country.name AS 'countryName', cities.name AS 'cityName', region.name AS 'regionName' from country INNER JOIN region ON country.countryId = region.countryId INNER JOIN cities ON region.regionId = cities.regionId INNER JOIN cities_map ON cities_map.city_id = cities.cityId INNER JOIN events ON events.id = cities_map.event_id ";
    
    if($categoryId != '' && $categoryId != 'popular' && $categoryId != 'local' && $categoryId != 'featured' && $categoryId != 'upcoming'){
      $sql .= "INNER JOIN categories_map on events.id = categories_map.event_id ";
    }
    
    $sql .= "WHERE eventDate >= NOW() ";
      
    if($categoryId != '' && $categoryId != 'popular' && $categoryId != 'local' && $categoryId != 'featured' && $categoryId != 'upcoming'){
      $sql .= "AND categories_map.category_id='$categoryId' "; 
    }
    
    if($categoryId == 'local' && $local != ''){
      $sql .= "AND country.code='$local' ";
    } else if ($categoryId == 'featured'){
      $sql .= "AND events.featured=1 ";
    }
    
    if($name != ''){
      $sql .= "AND events.Name LIKE '%$name%' ";    
    }
    
    $sql .= "GROUP BY events.id ";
    
    if($orderType != ''){
      if($orderType == 'popular')
        $sql .= "ORDER BY events.counter DESC ";
      else if ($orderType == 'chronological')
        $sql .= "ORDER BY eventDate ASC ";
      else if ($orderType == 'alphabetical')
        $sql .= "ORDER BY events.name ASC ";
    }
      
    $sqlFirstQuery .= $sql;
    $sqlSecondQuery .= $sql;
    
    if($index != ''){
      $i = $index*10;
      $sqlFirstQuery .= "LIMIT 10 OFFSET $i;";
    } else {
      $sqlFirstQuery .= ";";
    }
    $sqlSecondQuery .= ") as resultsCount;";
  
    $result = mysqli_query($link,$sqlFirstQuery);
    $resultTotal = mysqli_query($link, $sqlSecondQuery);
    
    if (!$result || !$resultTotal) {
      http_response_code(400);
    }

    $rows = array();
    while($r = mysqli_fetch_assoc($result)) {
      $rows[] = $r;
    }
    
    $object->results = $rows;
    while($r = mysqli_fetch_assoc($resultTotal)){
      $object->totalResults = $r['totalResults'];
    }
    print json_encode($object);

    mysqli_close($link);
    exit();
      
  }

}