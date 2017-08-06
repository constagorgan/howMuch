<?php
class GetEvent {
  
  public static function getEvents(){
    $configs = include('config.php');    
    header("Access-Control-Allow-Origin: ".$configs->eventSnitchCORS);
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    $key = '';
    $name = '';
    if(isset ( $_GET["id"] ))
      $key = mysqli_real_escape_string($link, $_GET['id']);
    if(isset ( $_GET["name"] ))
      $name = htmlspecialchars($_GET["name"], ENT_QUOTES, 'UTF-8');
    
    if($key && $name){
      $sql = "select id, name, location, locationMagicKey, eventDate, description, creatorUser, duration, featured, private, isLocal, background, events.location from events WHERE id=? AND name=?;";
      
      $stmt = $link->prepare($sql);
      $stmt->bind_param('ss', $key, $name);
    } else {
      $sql = "select id, name, location, locationMagicKey, eventDate, description, creatorUser, duration, featured, private, isLocal, background, events.location from events ORDER BY RAND() LIMIT 1";
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
      $updateSql = "update events set counter=counter+1 where id='".$r['id']."' ";
      $updateResult = mysqli_query($link,$updateSql);
    }
    print json_encode($rows);
    
    mysqli_close($link);
    exit();
  }

}
