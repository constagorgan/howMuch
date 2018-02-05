<?php

require_once('vendor/autoload.php');
use \Firebase\JWT\JWT; 

class GetLoggedUserEvent {
  
  public static function getLoggedUserEvents(){    
    $data = json_decode(file_get_contents('php://input'), true);
    $configs = include('config.php');
    
    $http_origin = $_SERVER['HTTP_ORIGIN'];
    if ($configs->allowCorsLocal == true || $http_origin == "http://localhost:8001" || $http_origin == "https://www.eventsnitch.com")
    {  
        header("Access-Control-Allow-Origin: $http_origin");
    }
        
    if(!($data && array_key_exists('index', $data))){
      http_response_code(400);
    } else if($data && array_key_exists('jwtToken', $data)){
      $index = $data['index'];
      $token = $data['jwtToken'];
      $orderType = '';
      try {
        $DecodedDataArray = JWT::decode($token, $configs->mySecretKeyJWT, array($configs->mySecretAlgorithmJWT));
        
        $object=new stdClass();
        
        $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
        $username = $DecodedDataArray->data->username;
        
        $sql = "select events.id, events.name, events.eventDate, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, events.location from events WHERE creatorUser=? ";
        $paramNumber = 1;
        $nameJoin = '';
        $bind = array();
        array_push($bind, $username);

        if(array_key_exists('name', $data)) { 
          $name = $data['name'];
          $nameSplit = explode(" ", $name);
          for($i=0; $i<count($nameSplit); $i++) {
            if(strlen($nameSplit[$i]) > 1) {
              $nameJoin .= "AND (events.Name LIKE ? OR events.Name LIKE ? OR events.Name LIKE ? OR events.Name = ?) ";
              $nameSplit[$i] = htmlspecialchars($nameSplit[$i], ENT_QUOTES, 'UTF-8');
              array_push($bind, $nameSplit[$i].'%',  '%'.$nameSplit[$i], '%'.$nameSplit[$i].'%',  $nameSplit[$i]);
              $paramNumber += 4;
            }
          }
        }
        
        $bindTwo = $bind;
        $sql .= $nameJoin;
        
        if(array_key_exists('orderType', $data))
          $orderType = $data['orderType'];
        if($orderType != ''){
          if($orderType == 'popular')
            $sql .= "ORDER BY events.counter DESC, eventDate ASC, events.name ASC ";
          else if ($orderType == 'chronological')
            $sql .= "ORDER BY eventDate ASC, events.counter DESC, events.name ASC ";
          else if ($orderType == 'alphabetical')
            $sql .= "ORDER BY events.name ASC, events.counter DESC, eventDate ASC ";
        }
        
        $sqlSecondQuery = "select count(*) as totalResults from (".$sql." LIMIT 1000) as resultsCount;";
        if($index > 99)
          $index = 99;
        $i = $index*10;
        $sql .= "LIMIT 10 OFFSET ?;";
        array_push($bind, $i);
        
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
        $types = str_repeat("s", $paramNumber + 1);
        array_unshift($bind, $types);
        $stmt = $link->prepare($sql);
        call_user_func_array(array($stmt, 'bind_param'), refValues($bind));
        $stmt->execute();
        $result = $stmt->get_result();

        $typesTwo = str_repeat("s", $paramNumber);
        array_unshift($bindTwo, $typesTwo);
        $stmtTwo = $link->prepare($sqlSecondQuery);
        call_user_func_array(array($stmtTwo, 'bind_param'), refValues($bindTwo));
        $stmtTwo->execute();

        $resultTotal = $stmtTwo->get_result();
                
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
        $object->username = $username;
        
        print json_encode($object);

        mysqli_close($link);
        exit();
        
      } catch (Exception $e) {
        http_response_code(401);
      }
    } else {
        http_response_code(401);
    }
  }
}
