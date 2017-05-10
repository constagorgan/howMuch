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
      $name = mysqli_real_escape_string($link, $_GET['name']);
    // connect to the mysql database
    mysqli_set_charset($link,'utf8');

    if($key && $name){
      $sql = "select id, name, eventDate, description, hashtag, creatorUser, duration, featured, private, isGlobal, background from events WHERE id=? AND name=?;";
      $stmt = $link->prepare($sql);
      $stmt->bind_param('ss', $key, $name);
    } else {
      $sql = "select id, name, eventDate, description, hashtag, creatorUser, duration, featured, private, isGlobal, background from events ORDER BY RAND() LIMIT 1";
      $stmt = $link->prepare($sql);
    }
    $stmt->execute();

    $result = $stmt->get_result() or die(mysqli_error($link));
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
