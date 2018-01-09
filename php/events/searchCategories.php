<?php
class SearchCategory {
  
  public static function searchCategories(){
    $configs = include('config.php');
    $http_origin = $_SERVER['HTTP_ORIGIN'];
    if ($configs->allowCorsLocal == true || $http_origin == "http://localhost:8001" || $http_origin == "https://www.eventsnitch.com")
    {  
        header("Access-Control-Allow-Origin: $http_origin");
    }
    
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    mysqli_set_charset($link,'utf8');   
    $local = null;
    if(isset ( $_GET['country_code']))
      $local = mysqli_real_escape_string($link, $_GET['country_code']);
    
    $sql = "select events.id, events.name, events.location, events.eventDate, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, events.location from events WHERE eventDate >= UTC_TIMESTAMP() GROUP BY events.id ORDER BY events.counter DESC LIMIT 5;";
    
    $sql .= "select events.id, events.name, events.location, events.eventDate, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, events.location from events INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='Cultural' AND eventDate >= UTC_TIMESTAMP() GROUP BY events.id ORDER BY events.counter DESC LIMIT 5;";
    
    $sql .= "select events.id, events.name, events.location, events.eventDate, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, events.location from events INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='Education' AND eventDate >= UTC_TIMESTAMP() GROUP BY events.id ORDER BY events.counter DESC LIMIT 5;";
    
    $sql .= "select events.id, events.name, events.location, events.eventDate, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, events.location from events INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='Entertainment' AND eventDate >= UTC_TIMESTAMP() GROUP BY events.id ORDER BY events.counter DESC LIMIT 5;";
    
    $sql .= "select events.id, events.name, events.location, events.eventDate, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, events.location from events INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='Holiday' AND eventDate >= UTC_TIMESTAMP() GROUP BY events.id ORDER BY events.counter DESC LIMIT 5;";
    
    $sql .= "select events.id, events.name, events.location, events.eventDate, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, events.location from events INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='Music' AND eventDate >= UTC_TIMESTAMP() GROUP BY events.id ORDER BY events.counter DESC LIMIT 5;";
    
    $sql .= "select events.id, events.name, events.location, events.eventDate, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, events.location from events INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='Political' AND eventDate >= UTC_TIMESTAMP() GROUP BY events.id ORDER BY events.counter DESC LIMIT 5;";
    
    $sql .= "select events.id, events.name, events.location, events.eventDate, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, events.location from events INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='Science' AND eventDate >= UTC_TIMESTAMP() GROUP BY events.id ORDER BY events.counter DESC LIMIT 5;";
    
    $sql .= "select events.id, events.name, events.location, events.eventDate, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, events.location from events INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='Sport' AND eventDate >= UTC_TIMESTAMP() GROUP BY events.id ORDER BY events.counter DESC LIMIT 5;";       

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
            echo '"Cultural":';
            break;
          case 3:
            echo '"Education":';
            break;
          case 4:
            echo '"Entertainment":';
            break;
          case 5:
            echo '"Holiday":';
            break;
          case 6:
            echo '"Music":';
            break;
          case 7:
            echo '"Political":';
            break;
          case 8:
            echo '"Science":';
            break;
          case 9:
            echo '"Sport":';
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
      
      $sqlUpcoming = "select events.id, events.name, events.eventDate, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, events.location from events WHERE (events.locationCountryCode=? OR events.locationCountryCode='WW') AND eventDate >= UTC_TIMESTAMP() GROUP BY events.id ORDER BY eventDate ASC  LIMIT 5;";
 
      $stmtUpcoming = $link->prepare($sqlUpcoming);
      $stmtUpcoming->bind_param('s', $local);

      $stmtUpcoming->execute();
      $resultUpcoming = $stmtUpcoming->get_result();
      $rowsUp = array();
      while($rUp = mysqli_fetch_assoc($resultUpcoming)) {
        $rowsUp[] = $rUp;
      }
      echo '"upcoming": '.json_encode($rowsUp);

      $sqlFeatured = "select events.id, events.name, events.eventDate, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, events.location from events WHERE (events.locationCountryCode=? OR events.locationCountryCode='WW') AND events.featured=1 AND eventDate >= UTC_TIMESTAMP() ORDER BY events.counter DESC LIMIT 5;";

      $stmtFeatured = $link->prepare($sqlFeatured);
      $stmtFeatured->bind_param('s', $local);
      $stmtFeatured->execute();
      $resultFeatured = $stmtFeatured->get_result();
      $rowsFeat = array();
      while($rFt = mysqli_fetch_assoc($resultFeatured)) {
        $rowsFeat[] = $rFt;
      }
      echo ',"featured": '.json_encode($rowsFeat);
     
      $sqlLocal = "select events.id, events.name, events.eventDate, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, events.location from events WHERE events.locationCountryCode=? AND eventDate >= UTC_TIMESTAMP() ORDER BY events.counter DESC LIMIT 5;";

      $stmtLocal = $link->prepare($sqlLocal);
      $stmtLocal->bind_param('s', $local);
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


