<?php
class GetUpcomingEvent {
  
  public static function getUpcoming(){
    $index = '';
    $categoryId = '';
    if(isset ( $_GET["index"] ))
      $index = $_GET['index'];
    if(isset ( $_GET["categoryId"] ))
      $categoryId = $_GET['categoryId'];
    
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    include_once('config.inc.php');
    $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
    mysqli_set_charset($link,'utf8');
    $sql = "select * from events INNER JOIN categories_map on events.id = categories_map.event_id WHERE eventDate >= CURDATE() ";

    if($categoryId != '')
      $sql .= "AND categories_map.category_id='$categoryId' GROUP BY events.id ORDER BY events.counter DESC LIMIT 10 "; 
    else 
      $sql .= "GROUP BY events.id ORDER BY eventDate ASC LIMIT 10 ";

    if($index != ''){
      $i = $index*10;
      $sql .= "OFFSET $i;"; 
    }
    else 
      $sql .= ";";
    $result = mysqli_query($link,$sql);

    if (!$result) {
      http_response_code(404);
      die(mysqli_error());
    }

    $rows = array();
    while($r = mysqli_fetch_assoc($result)) {
      $rows[] = $r;
    }
    print json_encode($rows);

    mysqli_close($link);
    exit();
      
  }

}