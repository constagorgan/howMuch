<?php
class SearchEvent {
  
  public static function searchEvents(){
    $configs = include('config.php');
    header("Access-Control-Allow-Origin: ".$configs->eventSnitchCORS);
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    $name = '';
    if(isset ( $_GET["name"] ))
      $name = mysqli_real_escape_string($link, $_GET['name']);
    $index = '';
    if(isset ( $_GET["index"] ))
      $index = mysqli_real_escape_string($link, $_GET['index']);
    if($name != ''){
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
      
      mysqli_set_charset($link,'utf8');
      $paramNumber = 0;
      $bind = array();
      
      $nameSplit = explode(" ", $name);
      $nameJoin = 'WHERE ((';
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
      
      $sql = "select events.id, events.name, events.eventDate, events.description, events.hashtag, events.creatorUser, events.duration, events.featured, events.private, events.isGlobal, events.background, country.name AS 'countryName' from country INNER JOIN countries_map ON countries_map.country_id = country.countryId INNER JOIN events ON events.id = countries_map.event_id ";
      
      $sql .= $nameJoin;   
      
      $sql .= "GROUP BY events.id ORDER BY events.counter DESC ";
      if($index != ''){
        $i = $index*10;
        $sql .= "LIMIT 10 OFFSET ?;";
        array_push($bind, $i);
        $paramNumber += 1;
      } else {
        $sql .= "LIMIT 5;";
      }
      
      $types = str_repeat("s", $paramNumber);
      array_unshift($bind, $types);
      
      $stmt = $link->prepare($sql);
      call_user_func_array(array($stmt, 'bind_param'), refValues($bind));
      $stmt->execute();

      $result = $stmt->get_result() or die(mysqli_error($link));

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
    } else {
      http_response_code(400);
    }
  }
}
