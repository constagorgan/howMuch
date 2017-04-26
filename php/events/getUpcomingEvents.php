<?php
class GetUpcomingEvent {
  
  public static function getUpcoming(){
    $configs = include('config.php');
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    $index = '';
    $categoryId = '';
    $orderType = '';
    $name = '';
    $local = '';
    $user = '';
    if(isset ( $_GET["index"] ))
      $index = mysqli_real_escape_string($link, $_GET['index']);
    if(isset ( $_GET["categoryId"] ))
      $categoryId = mysqli_real_escape_string($link, $_GET['categoryId']);
    if(isset ( $_GET["orderType"] ))
      $orderType = mysqli_real_escape_string($link, $_GET['orderType']);
    if(isset ( $_GET["name"] ))
      $name = mysqli_real_escape_string($link, $_GET['name']);
    if(isset ( $_GET["user"] ))
      $user = mysqli_real_escape_string($link, $_GET['user']);
    
    if(isset ( $_GET["country_code"] ))
      $local = mysqli_real_escape_string($link, $_GET['country_code']);
    
    if($index == ''){
      echo "{'status' : 'fail' ,'msg':'Bad request'}";
      http_response_code(400);
    } else {
      $object=new stdClass();

      header("Access-Control-Allow-Origin: *");
      // connect to the mysql database
      mysqli_set_charset($link,'utf8');
      $sqlFirstQuery = "";
      $sqlSecondQuery = "select count(*) as totalResults from (";

      $sql = "select events.id, events.name, events.eventDate, events.description, events.hashtag, events.creatorUser, events.duration, events.featured, events.private, events.isGlobal, events.background, country.name AS 'countryName' from country INNER JOIN countries_map ON countries_map.country_id = country.countryId INNER JOIN events ON events.id = countries_map.event_id ";

      if($categoryId != '' && $categoryId != 'popular' && $categoryId != 'local' && $categoryId != 'featured' && $categoryId != 'upcoming'){
        $sql .= "INNER JOIN categories_map on events.id = categories_map.event_id ";
      }

      if($user != ''){
        if($name == ''){
          $sql .= "WHERE events.creatorUser='$user' ";
        }
      }
      else {  
        $sql .= "WHERE eventDate >= NOW() ";
      }
      if($categoryId != '' && $categoryId != 'popular' && $categoryId != 'local' && $categoryId != 'featured' && $categoryId != 'upcoming'){
        $sql .= "AND categories_map.category_id='$categoryId' "; 
      }

      if($categoryId == 'local' && $local != ''){
        $sql .= "AND country.code='$local' ";
      } else if ($categoryId == 'featured'){
        $sql .= "AND events.featured=1 ";
      }

      if($name != ''){
        $nameSplit = explode(" ", $name);
        $nameJoin = 'AND ((';
        for($i=0; $i<count($nameSplit); $i++){
          $nameJoin .= "events.Name LIKE '%$nameSplit[$i]%' ";
          if($i <count($nameSplit)-1){
            $nameJoin .= "AND ";
          }
        }
        $nameJoin .= ") OR events.creatorUser LIKE '%$name%') ";
        $sql .= $nameJoin;    
      }

      $sql .= "GROUP BY events.id ";

      if($orderType != ''){
        if($orderType == 'popular')
          $sql .= "ORDER BY events.counter DESC, eventDate ASC, events.name ASC ";
        else if ($orderType == 'chronological')
          $sql .= "ORDER BY eventDate ASC, events.counter DESC, events.name ASC ";
        else if ($orderType == 'alphabetical')
          $sql .= "ORDER BY events.name ASC, events.counter DESC, eventDate ASC ";
      }
      $sqlFirstQuery .= $sql;
      $sqlSecondQuery .= $sql;

      if($index != ''){
        if($index > 99)
          $index = 99;
        $i = $index*10;
        $sqlFirstQuery .= "LIMIT 10 OFFSET $i;";
      } else {
        $sqlFirstQuery .= ";";
      }
      $sqlSecondQuery .= "LIMIT 1000) as resultsCount;";
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

}