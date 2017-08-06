<?php

require_once('vendor/autoload.php');
use \Firebase\JWT\JWT; 

class GetLoggedUserEvent {
  
  public static function getLoggedUserEvents(){    
    $data = json_decode(file_get_contents('php://input'), true);
    $configs = include('config.php');
    header("Access-Control-Allow-Origin: ".$configs->eventSnitchCORS);
    
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

        $stmt = $link->prepare($sql);
        $stmt->bind_param('ss', $username, $i);
        $stmt->execute();

        $result = $stmt->get_result();
        
        $stmtTwo = $link->prepare($sqlSecondQuery);
        $stmtTwo->bind_param('s', $username);
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
