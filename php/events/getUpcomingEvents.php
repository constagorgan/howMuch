<?php
class GetUpcomingEvent {
  
  public static function getUpcoming(){
    $configs = include('config.php');
    header("Access-Control-Allow-Origin: ".$configs->eventSnitchCORS);
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
      http_response_code(400);
    } else {
      function refValues($arr){
        if (strnatcmp(phpversion(),'5.3') >= 0) //Reference is required for PHP 5.3+
        {
            $refs = array();
            foreach($arr as $key => $value)
                $refs[$key] = &$arr[$key];
            return $refs;
        }
        return $arr;
      }
      
      $object=new stdClass();
      $paramNumber = 0;
      $bind = array();

      mysqli_set_charset($link,'utf8');
      $sqlFirstQuery = "";
      $sqlSecondQuery = "select count(*) as totalResults from (";
      
      $sql = "select events.id, events.name, events.eventDate, events.description, events.hashtag, events.creatorUser, events.duration, events.featured, events.private, events.isGlobal, events.background, events.location from events ";

      if($categoryId != '' && $categoryId != 'popular' && $categoryId != 'local' && $categoryId != 'featured' && $categoryId != 'upcoming'){
        $sql .= "INNER JOIN categories_map on events.id = categories_map.event_id ";
      }

      if($user != ''){
        if($name == ''){
          $sql .= "WHERE events.creatorUser=? ";                
          array_push($bind, $user);
          $paramNumber += 1;
        }
      }
      else {  
        $sql .= "WHERE eventDate >= NOW() ";
      }
      if($categoryId != '' && $categoryId != 'popular' && $categoryId != 'local' && $categoryId != 'featured' && $categoryId != 'upcoming'){
        $sql .= "AND categories_map.category_id=? "; 
        array_push($bind, $categoryId);
        $paramNumber += 1;
      }

      if($categoryId == 'local' && $local != ''){
        $sql .= "AND events.locationCountryCode=? ";
        array_push($bind, $local);
        $paramNumber += 1;
      } else if ($categoryId == 'featured'){
        $sql .= "AND events.featured=1 ";
      }

      if($name != ''){
        $nameSplit = explode(" ", $name);
        $nameJoin = 'AND ((';
        for($i=0; $i<count($nameSplit); $i++){
          $nameJoin .= "events.Name LIKE ? OR events.description LIKE ? ";
          array_push($bind, '%'.$nameSplit[$i].'%', '%'.$nameSplit[$i].'%');
          $paramNumber += 2;
          if($i <count($nameSplit)-1){
            $nameJoin .= "AND ";
          }
        }
        $nameJoin .= ") OR events.creatorUser LIKE ?) ";
        array_push($bind, '%'.$name.'%');
        $paramNumber += 1;
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
      
      $bindTwo = $bind;
      
      if($index > 99)
        $index = 99;
      $i = $index*10;
      $sqlFirstQuery .= "LIMIT 10 OFFSET ?;";
      array_push($bind, $i);
      $paramNumber += 1;

      $sqlSecondQuery .= "LIMIT 1000) as resultsCount;";
      
      $types = str_repeat("s", $paramNumber);
      $typesTwo = str_repeat("s", $paramNumber-1);
      
      array_unshift($bind, $types);

      $stmt = $link->prepare($sqlFirstQuery);
      call_user_func_array(array($stmt, 'bind_param'), refValues($bind));
      $stmt->execute();

      $result = $stmt->get_result();
      if(count($bindTwo)>0){
        $stmtTwo = $link->prepare($sqlSecondQuery);
        array_unshift($bindTwo, $typesTwo);

        call_user_func_array(array($stmtTwo, 'bind_param'), refValues($bindTwo));
        $stmtTwo->execute();

        $resultTotal = $stmtTwo->get_result();
      } else {
        $resultTotal = mysqli_query($link, $sqlSecondQuery);
      }
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