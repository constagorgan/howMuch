<?php
class SearchEvent {
  
  public static function searchEvents(){
    $configs = include('config.php');
    
    $http_origin = $_SERVER['HTTP_ORIGIN'];
    if ($configs->allowCorsLocal == true || $http_origin == "http://localhost:8001" || $http_origin == "https://www.eventsnitch.com")
    {  
        header("Access-Control-Allow-Origin: $http_origin");
    }
    
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
      $nameJoin = 'WHERE ';
      for($i=0; $i<count($nameSplit); $i++) {
        if(strlen($nameSplit[$i]) > 1) {
          if($i > 0 && $nameJoin != 'WHERE ') {
            $nameJoin .= "AND ";
          }
          $nameJoin .= "(events.Name LIKE ? OR events.Name LIKE ? OR events.Name LIKE ? OR events.Name = ?) ";
          $nameSplit[$i] = htmlspecialchars($nameSplit[$i], ENT_QUOTES, 'UTF-8');
          array_push($bind, $nameSplit[$i].'%',  '%'.$nameSplit[$i], '%'.$nameSplit[$i].'%',  $nameSplit[$i]);
          $paramNumber += 4;
        }
      }
      
      $sql = "select * from (select events.id, events.name, events.eventDate, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, events.location from events ";
      
      if($nameJoin != 'WHERE '){
        $sql .= $nameJoin;   
      }
      
      $sql .= "ORDER BY events.counter DESC, eventDate ASC, events.name ASC) as t1 UNION (select events.id, events.name, events.eventDate, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, events.location from events ";
      
      $nameJoinTwo = 'WHERE ';
      for($i=0; $i<count($nameSplit); $i++){
        if(strlen($nameSplit[$i]) > 1) {
          if($i > 0 && $nameJoinTwo != 'WHERE ') {
            $nameJoinTwo .= "OR ";
          }
          $nameJoinTwo .= "events.Name LIKE ? OR events.description LIKE ? ";
          $nameSplit[$i] = htmlspecialchars($nameSplit[$i], ENT_QUOTES, 'UTF-8');
          array_push($bind, '%'.$nameSplit[$i].'%', $nameSplit[$i]);
          $paramNumber += 2;
        }
      }   
      
      if($nameJoinTwo != 'WHERE ') {
        $nameJoinTwo .= "OR ";
      }

      $nameJoinTwo .= "events.creatorUser LIKE ? ";

      array_push($bind, $name);
      $paramNumber += 1;
      
      $sql .= $nameJoinTwo;
      
      $sql .= "ORDER BY events.counter DESC, eventDate ASC, events.name ASC) LIMIT 5;";
       
      $types = str_repeat("s", $paramNumber);
      array_unshift($bind, $types);
      
      $stmt = $link->prepare($sql);
      call_user_func_array(array($stmt, 'bind_param'), refValues($bind));
      $stmt->execute();

      $result = $stmt->get_result();

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
