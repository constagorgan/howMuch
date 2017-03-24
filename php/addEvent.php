<?php
class AddEvent {
  
  public static function addEvents(){    
    $data = json_decode(file_get_contents('php://input'), true);
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    
    include_once('config.inc.php');
    $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
    mysqli_set_charset($link,'utf8');

    $name = mysqli_real_escape_string($link, $data['name']);
    $creatorUser = mysqli_real_escape_string($link, $data['creatorUser']);
    $duration = mysqli_real_escape_string($link, $data['duration']);
    $hashtag = mysqli_real_escape_string($link, $data['hashtag']);
    $eventDate = mysqli_real_escape_string($link, $data['eventDate']);
    $private = mysqli_real_escape_string($link, $data['private']);
    $isGlobal = mysqli_real_escape_string($link, $data['isGlobal']);
    $background = mysqli_real_escape_string($link, $data['background']);
    if($data && array_key_exists('description', $data))
      $description = mysqli_real_escape_string($link, $data['description']);
    
    
    $sql = "INSERT INTO `events` (`name`, `creatorUser`, `duration`, `counter`, `hashtag`, `eventDate`, `featured`, `private`, `isGlobal`, `background`, `description`) VALUES ('".$data['name']."', '".$data['creatorUser']."', ".$data['duration'].", 0, '".$data['hashtag']."', '".$data['eventDate']."', 0, ".$data['private'].", ".$data['isGlobal'].", ".$data['background']."";
    if($description)
      $sql .= ", '$description');";
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
