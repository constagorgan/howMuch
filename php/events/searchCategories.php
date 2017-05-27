<?php
class SearchCategory {
  
  public static function searchCategories(){
    // connect to the mysql database
    $configs = include('config.php');
    header("Access-Control-Allow-Origin: ".$configs->eventSnitchCORS);
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    mysqli_set_charset($link,'utf8');   
//    $local = null;
//    if(isset ( $_GET['country_code']))
//      $local = mysqli_real_escape_string($link, $_GET['country_code']);
    
    $sql = "select events.id, events.name, events.location, events.eventDate, events.description, events.hashtag, events.creatorUser, events.duration, events.featured, events.private, events.isGlobal, events.background, events.location from events WHERE eventDate >= NOW() GROUP BY events.id ORDER BY events.counter DESC LIMIT 5;";
    
    $sql .= "select events.id, events.name, events.location, events.eventDate, events.description, events.hashtag, events.creatorUser, events.duration, events.featured, events.private, events.isGlobal, events.background, events.location from events INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='technology' AND eventDate >= NOW() GROUP BY events.id LIMIT 5;";
    
    $sql .= "select events.id, events.name, events.location, events.eventDate, events.description, events.hashtag, events.creatorUser, events.duration, events.featured, events.private, events.isGlobal, events.background, events.location from events INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='seasons' AND eventDate >= NOW() GROUP BY events.id LIMIT 5;";
    
    $sql .= "select events.id, events.name, events.location, events.eventDate, events.description, events.hashtag, events.creatorUser, events.duration, events.featured, events.private, events.isGlobal, events.background, events.location from events INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='holidays' AND eventDate >= NOW() GROUP BY events.id LIMIT 5;";
    
    $sql .= "select events.id, events.name, events.location, events.eventDate, events.description, events.hashtag, events.creatorUser, events.duration, events.featured, events.private, events.isGlobal, events.background, events.location from events INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='music' AND eventDate >= NOW() GROUP BY events.id LIMIT 5;";
    

    $sql .= "select events.id, events.name, events.location, events.eventDate, events.description, events.hashtag, events.creatorUser, events.duration, events.featured, events.private, events.isGlobal, events.background, events.location from events INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='fashion' AND eventDate >= NOW() GROUP BY events.id LIMIT 5;";
    
    $sql .= "select events.id, events.name, events.location, events.eventDate, events.description, events.hashtag, events.creatorUser, events.duration, events.featured, events.private, events.isGlobal, events.background, events.location from events INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='sports' AND eventDate >= NOW() GROUP BY events.id LIMIT 5;";
    
    $sql .= "select events.id, events.name, events.location, events.eventDate, events.description, events.hashtag, events.creatorUser, events.duration, events.featured, events.private, events.isGlobal, events.background, events.location from events INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='social media' AND eventDate >= NOW() GROUP BY events.id LIMIT 5;";
    
    $sql .= "select events.id, events.name, events.location, events.eventDate, events.description, events.hashtag, events.creatorUser, events.duration, events.featured, events.private, events.isGlobal, events.background, events.location from events INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='education' AND eventDate >= NOW() GROUP BY events.id LIMIT 5;";       

    if (mysqli_multi_query($link,$sql))
    { echo '{';
      $j=1; 
      do
       {
       switch($j){
          case 1:
            echo '"popular":';
            break;
          case 2:
            echo '"technology":';
            break;
          case 3:
            echo '"seasons":';
            break;
          case 4:
            echo '"holidays":';
            break;
          case 5:
            echo '"music":';
            break;
          case 6:
            echo '"fashion":';
            break;
          case 7:
            echo '"sports":';
            break;
          case 8:
            echo '"socialMedia":';
            break;
          case 9:
            echo '"education":';
            break;
        }
        if ($result=mysqli_store_result($link)) {
          // Fetch one and one row        
          echo '[';
          for ($i=0;$i<mysqli_num_rows($result);$i++) {           
            echo ($i>0?',':'').json_encode(mysqli_fetch_object($result));            
          }
          echo ('],');
          mysqli_free_result($result);
        }
        $j = $j+1;
        }
      while (mysqli_more_results($link) && mysqli_next_result($link));
      
      $sqlUpcoming = "select events.id, events.name, events.eventDate, events.description, events.hashtag, events.creatorUser, events.duration, events.featured, events.private, events.isGlobal, events.background, events.location from events WHERE eventDate >= NOW() GROUP BY events.id ORDER BY eventDate ASC  LIMIT 5;";
      $stmtUpcoming = $link->prepare($sqlUpcoming);
//      $stmtUpcoming->bind_param('s', $local);
      $stmtUpcoming->execute();
      $resultUpcoming = $stmtUpcoming->get_result();
      $rowsUp = array();
      while($rUp = mysqli_fetch_assoc($resultUpcoming)) {
        $rowsUp[] = $rUp;
      }
      echo '"upcoming": '.json_encode($rowsUp);

      $sqlFeatured = "select events.id, events.name, events.eventDate, events.description, events.hashtag, events.creatorUser, events.duration, events.featured, events.private, events.isGlobal, events.background, events.location from events WHERE events.featured=1 AND eventDate >= NOW() ORDER BY events.counter DESC LIMIT 5;";
      $stmtFeatured = $link->prepare($sqlFeatured);
//      $stmtFeatured->bind_param('s', $local);
      $stmtFeatured->execute();
      $resultFeatured = $stmtFeatured->get_result();
      $rowsFeat = array();
      while($rFt = mysqli_fetch_assoc($resultFeatured)) {
        $rowsFeat[] = $rFt;
      }
      echo ',"featured": '.json_encode($rowsFeat);
     
      $sqlLocal = "select events.id, events.name, events.eventDate, events.description, events.hashtag, events.creatorUser, events.duration, events.featured, events.private, events.isGlobal, events.background, events.location from events WHERE eventDate >= NOW() ORDER BY events.counter DESC LIMIT 5;";
      $stmtLocal = $link->prepare($sqlLocal);
//      $stmtLocal->bind_param('s', $local);
      $stmtLocal->execute();
      $resultLocal = $stmtLocal->get_result();
      $rowsLocal = array();
      while($rLoc = mysqli_fetch_assoc($resultLocal)) {
        $rowsLocal[] = $rLoc;
      }
      echo ',"local": '.json_encode($rowsLocal);
     
     echo '}';
    }
    mysqli_close($link);
    exit();
  }
}