<?php
class GetEvent {
  
  public static function getEvents(){
    include_once(dirname(__DIR__).'/conf/config.inc.php');
    $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
    $key = '';
    $name = '';
    if(isset ( $_GET["id"] ))
      $key = mysqli_real_escape_string($link, $_GET['id']);
    if(isset ( $_GET["name"] ))
      $name = mysqli_real_escape_string($link, $_GET['name']);
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    mysqli_set_charset($link,'utf8');

    if($key && $name){
      $sql = "select * from events WHERE id=$key AND name='$name'";
    } else {
      $sql = "select * from events ORDER BY RAND() LIMIT 1";
    }
    $result = mysqli_query($link,$sql);
    
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
