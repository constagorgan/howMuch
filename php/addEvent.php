<?php
class AddEvent {
  
  public static function addEvents(){    
    $data = json_decode(file_get_contents('php://input'), true);
    $name = '';
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    
    include_once('config.inc.php');
    $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
    mysqli_set_charset($link,'utf8');

    $name = mysqli_real_escape_string($link, $name);
      
    $sql = "INSERT INTO `events` (`name`, `creatorUser`, `duration`, `counter`, `hashtag`, `eventDate`, `featured`, `private`, `isGlobal`, `description`) VALUES ('".$data['name']."', '".$data['creatorUser']."', ".$data['duration'].", 0, '".$data['hashtag']."', '".$data['eventDate']."', 0, ".$data['private'].", ".$data['isGlobal']."";
    if(array_key_exists('description', $data))
      $sql .= ", '".$data['description']."');";
    else 
      $sql .= ", null);";
    $result = mysqli_query($link,$sql);

    if (!$result) {
      if(mysqli_errno($link) == 1062)
        http_response_code(409);
      else
        http_response_code(400);
    }

    mysqli_close($link);
    
    exit();
  }
}
