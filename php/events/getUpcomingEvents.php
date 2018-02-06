<?php
class GetUpcomingEvent {
  
  public static function getUpcoming(){
    $configs = include('config.php');
    
    $http_origin = $_SERVER['HTTP_ORIGIN'];
    if ($configs->allowCorsLocal == true || $http_origin == "http://localhost:8001" || $http_origin == "https://www.eventsnitch.com")
    {  
        header("Access-Control-Allow-Origin: $http_origin");
    }
    
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
      $sqlFirstQuery = "(";
      $sqlSecondQuery = "(";
      $sqlResultsQuery = "select * from (select * from";
      $sqlCountQuery = "select count(*) as totalResults from ( ";
      
      $sql = "select id, name, eventDate, description, creatorUser, duration, featured, private, isLocal, background, location, counter from events ";

      if($categoryId != '' && $categoryId != 'popular' && $categoryId != 'local' && $categoryId != 'featured' && $categoryId != 'upcoming'){
        $sql .= "INNER JOIN categories_map on events.id = categories_map.event_id ";
      }

      if($user != ''){
        if($name == ''){
          $sql .= "WHERE events.creatorUser=? ";  
          array_push($bind, $user);
          array_push($bind, $user);
          $paramNumber += 2;
        } else {
          $sql .= "WHERE true ";
        }
      }
      else {  
        if($categoryId != '') {
          $sql .= "WHERE eventDate >= UTC_TIMESTAMP() ";
        } else {
          $sql .= "WHERE true ";
        }
      }
      
      if($categoryId != '' && $categoryId != 'popular' && $categoryId != 'local' && $categoryId != 'featured' && $categoryId != 'upcoming'){
        $sql .= "AND categories_map.category_id=? "; 
        array_push($bind, $categoryId);
        $paramNumber += 1;
        if($name == '') {
          array_push($bind, $categoryId);
          $paramNumber += 1;
        }
      }

      if($categoryId == 'local' && $local != ''){
        $sql .= "AND events.locationCountryCode=? ";
        array_push($bind, $local);
        array_push($bind, $local);
        $paramNumber += 2;
      } else if ($categoryId == 'featured'){
        $sql .= "AND events.featured=1 ";
      }

      $sqlSecondQuery .= $sql;
      if($name != '') {
        $nameSplit = explode(" ", $name);
        
        $nameJoin = '';
        for($i=0; $i<count($nameSplit); $i++) { 
          if(strlen($nameSplit[$i]) > 1) {
            $nameSplit[$i] = htmlspecialchars($nameSplit[$i], ENT_QUOTES, 'UTF-8');
            $nameJoin .= "AND (events.Name LIKE ? OR events.Name LIKE ? OR events.Name LIKE ? OR events.Name = ?) ";
            array_push($bind, $nameSplit[$i].'%',  '%'.$nameSplit[$i], '%'.$nameSplit[$i].'%',  $nameSplit[$i]);
            $paramNumber += 4;
          }
        }
        $sql .= $nameJoin; 
        $nameJoinSecond = 'AND ';
        if($categoryId != '' && $categoryId != 'popular' && $categoryId != 'local' && $categoryId != 'featured' && $categoryId != 'upcoming'){
          array_push($bind, $categoryId);
          $paramNumber += 1;
        }
        for($i=0; $i<count($nameSplit); $i++) {
          if(strlen($nameSplit[$i]) > 1) {
            if($i > 0 && $nameJoinSecond != 'AND ') {
              $nameJoinSecond .= "OR ";
            }
            $nameJoinSecond .= "events.Name LIKE ? OR events.description LIKE ? ";
            $nameSplit[$i] = htmlspecialchars($nameSplit[$i], ENT_QUOTES, 'UTF-8');
            array_push($bind, '%'.$nameSplit[$i].'%', $nameSplit[$i]);
            $paramNumber += 2;
          }
        }    
        if($nameJoinSecond != 'AND ') {
          $nameJoinSecond = $nameJoinSecond . "OR ";  
        }
        $nameJoinSecond .= "events.creatorUser LIKE ? ";
        array_push($bind, $name);
        $paramNumber += 1;
        $sqlSecondQuery .= $nameJoinSecond;
      }
      
      $sqlEnding = ") as results ";
      $sqlFirstQuery .= $sql;
      
      if($orderType != ''){
        if($orderType == 'popular') 
          $sqlEnding .= "ORDER BY results.counter DESC, results.eventDate ASC, results.name ASC ";
        else if ($orderType == 'chronological')
          $sqlEnding .= "ORDER BY results.eventDate ASC, results.counter DESC, results.name ASC ";
        else if ($orderType == 'alphabetical')
          $sqlEnding .= "ORDER BY results.name ASC, results.counter DESC, results.eventDate ASC ";
        else if ($orderType == 'relevance') {  
          $sqlFirstQuery .= "ORDER BY events.counter DESC, eventDate ASC, events.name ASC ";
          $sqlSecondQuery .= "ORDER BY events.counter DESC, eventDate ASC, events.name ASC ";
        }
      }
      
      $sqlFirstQuery .= ") as t1 ";
      $sqlSecondQuery .= ")";
      
      
      $sqlResultsQuery .= $sqlFirstQuery . " UNION " . $sqlSecondQuery . $sqlEnding;
      $sqlCountQuery .=  $sqlResultsQuery;
      $bindTwo = $bind;
      
      if($index > 99)
        $index = 99;
      
      $i = $index*10;
      $sqlResultsQuery .= "LIMIT 10 OFFSET ?;";
      array_push($bind, $i);
      $paramNumber += 1;

      $sqlCountQuery .= "LIMIT 1000) as resultsCount;";
      $types = str_repeat("s", $paramNumber);
      $typesTwo = str_repeat("s", $paramNumber-1);
      array_unshift($bind, $types);
      $stmt = $link->prepare($sqlResultsQuery);
      call_user_func_array(array($stmt, 'bind_param'), refValues($bind));
      $stmt->execute();

      $result = $stmt->get_result();
      if(count($bindTwo)>0){
        $stmtTwo = $link->prepare($sqlCountQuery);
        array_unshift($bindTwo, $typesTwo);

        call_user_func_array(array($stmtTwo, 'bind_param'), refValues($bindTwo));
        $stmtTwo->execute();

        $resultTotal = $stmtTwo->get_result();
      } else {
        $resultTotal = mysqli_query($link, $sqlCountQuery);
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