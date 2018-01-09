<?php
class GetEvent {
  
  public static function getEvents(){
    $configs = include('config.php');    
        
    $http_origin = $_SERVER['HTTP_ORIGIN'];
    if ($configs->allowCorsLocal == true || $http_origin == "http://localhost:8001" || $http_origin == "https://www.eventsnitch.com" ||  $http_origin == "https://eventsnitch.com")
    {  
        header("Access-Control-Allow-Origin: $http_origin");
    }
    
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    $key = '';
    $name = '';
    if(isset ( $_GET["id"] ))
      $key = mysqli_real_escape_string($link, $_GET['id']);
    if(isset ( $_GET["name"] ))
      $name = htmlspecialchars($_GET["name"], ENT_QUOTES, 'UTF-8');
    
    if($key && $name){
      $sql = "select events.id, events.name, events.hashtag, events.location, events.locationMagicKey, events.eventDate, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, special_effects_map.special_effect_id AS 'specialEffect' from events LEFT JOIN special_effects_map ON special_effects_map.event_id = events.id WHERE id=? AND name=?;";
        
      $stmt = $link->prepare($sql);
      $stmt->bind_param('ss', $key, $name);
    } else {
      $sql = "select events.id, events.name, events.hashtag, events.location, events.locationMagicKey, events.eventDate, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, special_effects_map.special_effect_id AS 'specialEffect' from events LEFT JOIN special_effects_map ON special_effects_map.event_id = events.id ORDER BY RAND() LIMIT 1";
      $stmt = $link->prepare($sql);
    }
    $stmt->execute();

    $result = $stmt->get_result();
    if (!$result) {
      http_response_code(400);
    }
    
    $rows = array();
    while($r = mysqli_fetch_assoc($result)) {
      $rows[] = $r;
      $updateSql = "update events set counter=counter+1 where id=?";
      $stmtTwo = $link->prepare($updateSql);
      $stmtTwo->bind_param('s', $r['id']);
      $stmtTwo->execute();
    }
    print json_encode($rows);
    
    mysqli_close($link);
    exit();
  }

}
