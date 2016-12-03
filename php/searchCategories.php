<?php
class SearchCategory {
  
  public static function searchCategories(){
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    include_once('config.inc.php');
    $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
    mysqli_set_charset($link,'utf8');   
    $local = $_GET['country_code'];
    
    $sql = "select * from events ORDER BY counter DESC LIMIT 5;";

    $sql .= "select events.*, country.code AS 'countryCode', country.name AS 'countryName', country.name AS 'cityName', region.name AS 'regionName' from country INNER JOIN region ON country.countryId = region.countryId INNER JOIN cities ON region.regionId = cities.regionId INNER JOIN cities_map ON cities_map.city_id = cities.cityId INNER JOIN events ON events.id = cities_map.event_id WHERE country.code='$local' OR country.code='world' GROUP BY events.id ORDER BY events.eventDate ASC LIMIT 5;";

    $sql .= "select events.*, country.code AS 'countryCode', country.name AS 'countryName', country.name AS 'cityName', region.name AS 'regionName' from country INNER JOIN region ON country.countryId = region.countryId INNER JOIN cities ON region.regionId = cities.regionId INNER JOIN cities_map ON cities_map.city_id = cities.cityId INNER JOIN events ON events.id = cities_map.event_id WHERE (country.code='$local' OR country.code='world') AND events.featured=1 GROUP BY country.code='$local' ORDER BY events.counter DESC LIMIT 5;";

    $sql .= "select events.*, country.code AS 'countryCode', country.name AS 'countryName', country.name AS 'cityName', region.name AS 'regionName' from country INNER JOIN region ON country.countryId = region.countryId INNER JOIN cities ON region.regionId = cities.regionId INNER JOIN cities_map ON cities_map.city_id = cities.cityId INNER JOIN events ON events.id = cities_map.event_id WHERE country.code='$local' ORDER BY events.counter DESC LIMIT 5;";

    $sql .= "select * from (select * from categories_map WHERE category_id=1) as map inner join events on events.id = map.event_id LIMIT 5;";
    $sql .= "select * from (select * from categories_map WHERE category_id=2) as map inner join events on events.id =  map.event_id LIMIT 5;";
    $sql .= "select * from (select * from categories_map WHERE category_id=3) as map inner join events on events.id = map.event_id LIMIT 5;";
    $sql .= "select * from (select * from categories_map WHERE category_id=4) as map inner join events on events.id = map.event_id LIMIT 5;";

    $sql .= "select * from (select * from categories_map WHERE category_id=5) as map inner join events on events.id = map.event_id LIMIT 5;";
    $sql .= "select * from (select * from categories_map WHERE category_id=6) as map inner join events on events.id =  map.event_id LIMIT 5;";
    $sql .= "select * from (select * from categories_map WHERE category_id=7) as map inner join events on events.id = map.event_id LIMIT 5;";
    $sql .= "select * from (select * from categories_map WHERE category_id=8) as map inner join events on events.id = map.event_id LIMIT 5;";       
//  
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
            echo '"upcoming":';
            break;
          case 3:
            echo '"featured":';
            break;
          case 4:
            echo '"local":';
            break;
           case 5:
            echo '"technology":';
            break;
          case 6:
            echo '"seasons":';
            break;
          case 7:
            echo '"holidays":';
            break;
          case 8:
            echo '"music":';
            break;
           case 9:
            echo '"fashion":';
            break;
          case 10:
            echo '"sports":';
            break;
          case 11:
            echo '"socialMedia":';
            break;
          case 12:
            echo '"education":';
            break;
        }
        if ($result=mysqli_store_result($link)) {
          // Fetch one and one row        
          echo '[';
          for ($i=0;$i<mysqli_num_rows($result);$i++) {           
            echo ($i>0?',':'').json_encode(mysqli_fetch_object($result));            
          }
          echo ($j<12?'],':']');
          mysqli_free_result($result);
          }
        $j = $j+1;
        }
      while (mysqli_next_result($link));
     echo '}';
    }
    mysqli_close($link);
    exit();
  }
}