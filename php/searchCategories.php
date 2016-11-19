<?php
class SearchCategory {
  
  public static function searchCategories(){
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    include_once('config.inc.php');
    $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
    mysqli_set_charset($link,'utf8');   

    $sql = "select * from (select * from categories_map WHERE category_id=1) as map inner join events on events.id = map.event_id;"; 
    
    // excecute SQL statement
    $result = mysqli_query($link,$sql);

    // die if SQL statement failed
    if (!$result) {
      http_response_code(404);
      die(mysqli_error());
    }

    // print results, insert id or affected row count

    echo '[';
    for ($i=0;$i<mysqli_num_rows($result);$i++) {
      echo ($i>0?',':'').json_encode(mysqli_fetch_object($result));
    }
      echo ']';
    
    // close mysql connection
    mysqli_close($link);
    exit();
  }
}