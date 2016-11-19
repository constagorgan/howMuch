<?php
class SearchCategory {
  
  public static function searchCategories(){
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    include_once('config.inc.php');
    $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
    mysqli_set_charset($link,'utf8');   
    
    $id = $_GET['id'];
    
    switch ($id) {
      case '1':
         $sql = "select * from (select * from categories_map WHERE category_id=1) as map inner join events on events.id = map.event_id LIMIT 5;";
         $sql .= "select * from (select * from categories_map WHERE category_id=2) as map inner join events on events.id =  map.event_id LIMIT 5;";
         $sql .= "select * from (select * from categories_map WHERE category_id=3) as map inner join events on events.id = map.event_id LIMIT 5;";
         $sql .= "select * from (select * from categories_map WHERE category_id=4) as map inner join events on events.id = map.event_id LIMIT 5;";break;
        case '2':
         $sql = "select * from (select * from categories_map WHERE category_id=5) as map inner join events on events.id = map.event_id LIMIT 5;";
         $sql .= "select * from (select * from categories_map WHERE category_id=6) as map inner join events on events.id =  map.event_id LIMIT 5;";
         $sql .= "select * from (select * from categories_map WHERE category_id=7) as map inner join events on events.id = map.event_id LIMIT 5;";
         $sql .= "select * from (select * from categories_map WHERE category_id=8) as map inner join events on events.id = map.event_id LIMIT 5;";break;       
    }   
    
    if (mysqli_multi_query($link,$sql))
    {
      
      do
        {
        // Store first result set
        if ($result=mysqli_store_result($link)) {
          // Fetch one and one row        
          for ($i=0;$i<mysqli_num_rows($result);$i++) {
            echo '[';
            echo ($i>0?',':'').json_encode(mysqli_fetch_object($result));
            echo ']';
          }
          mysqli_free_result($result);
          }
        }
      while (mysqli_next_result($link));
    }
    
    mysqli_close($link);
    exit();
  }
}