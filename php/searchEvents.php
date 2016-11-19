<?php
class SearchEvent {
  
  public function searchEvents($key, $name, $table){
    header("Access-Control-Allow-Origin: *");

    // connect to the mysql database
    include_once('config.inc.php');
    $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
    mysqli_set_charset($link,'utf8');

    // create SQL based on HTTP method
    
    $sql = "select * from `$table`".($key?" WHERE id=$key":($name?" WHERE Name LIKE '$name%' LIMIT 5":''));
    

    // excecute SQL statement
    $result = mysqli_query($link,$sql);

    // die if SQL statement failed
    if (!$result) {
      http_response_code(404);
      die(mysqli_error());
    }

    // print results, insert id or affected row count
    if (!$key) echo '[';
    for ($i=0;$i<mysqli_num_rows($result);$i++) {
      echo ($i>0?',':'').json_encode(mysqli_fetch_object($result));
    }
    if (!$key) echo ']';
    
    // close mysql connection
    mysqli_close($link);
    exit();
  }
}