<?php
class GetEvent {
  
  public static function getEvents(){
    $key = '';
    $name = '';
    if(isset ( $_GET["id"] ))
      $key = $_GET['id'];
    if(isset ( $_GET["name"] ))
      $name = $_GET['name'];
    if($key && $name){
      header("Access-Control-Allow-Origin: *");
      // connect to the mysql database
      include_once('config.inc.php');
      $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
      mysqli_set_charset($link,'utf8');
      
      $name = mysqli_real_escape_string($link, $name);
      
      $sql = "update events set counter=counter+1 where id=$key AND name='$name'";
      
      $result = mysqli_query($link,$sql);
      $sql = "select * from events WHERE id=$key AND name='$name'";
      $result = mysqli_query($link,$sql);

      if (!$result) {
        http_response_code(404);
        die(mysqli_error());
      }
      echo '[';
      if(mysqli_num_rows($result) && mysqli_num_rows($result) > 0){
        for ($i=0;$i<mysqli_num_rows($result);$i++) {
          echo ($i>0?',':'').json_encode(mysqli_fetch_object($result));
        }
      }
      echo ']';
      mysqli_close($link);
      exit();
    } else {
      echo '[]';
    }
  }

}
