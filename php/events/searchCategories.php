<?php
class SearchCategory {
  
  public static function searchCategories(){
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    $configs = include('config.php');
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    mysqli_set_charset($link,'utf8');   
    $local = null;
    if(isset ( $_GET['country_code']))
      $local = mysqli_real_escape_string($link, $_GET['country_code']);
    
    $sql = "select events.*, country.code AS 'countryCode', country.name AS 'countryName', cities.name AS 'cityName', region.name AS 'regionName' from country INNER JOIN region ON country.countryId = region.countryId INNER JOIN cities ON region.regionId = cities.regionId INNER JOIN cities_map ON cities_map.city_id = cities.cityId INNER JOIN events ON events.id = cities_map.event_id WHERE eventDate >= NOW() GROUP BY events.id ORDER BY events.counter DESC LIMIT 5;";

    $sql .= "select events.*, country.code AS 'countryCode', country.name AS 'countryName', cities.name AS 'cityName', region.name AS 'regionName' from country INNER JOIN region ON country.countryId = region.countryId INNER JOIN cities ON region.regionId = cities.regionId INNER JOIN cities_map ON cities_map.city_id = cities.cityId INNER JOIN events ON events.id = cities_map.event_id WHERE (country.code='$local' OR country.code='world') AND eventDate >= NOW() GROUP BY events.id ORDER BY eventDate ASC  LIMIT 5;";

    $sql .= "select events.*, country.code AS 'countryCode', country.name AS 'countryName', cities.name AS 'cityName', region.name AS 'regionName' from country INNER JOIN region ON country.countryId = region.countryId INNER JOIN cities ON region.regionId = cities.regionId INNER JOIN cities_map ON cities_map.city_id = cities.cityId INNER JOIN events ON events.id = cities_map.event_id WHERE (country.code='$local' OR country.code='world') AND events.featured=1 AND eventDate >= NOW() ORDER BY events.counter DESC LIMIT 5;";

    $sql .= "select events.*, country.code AS 'countryCode', country.name AS 'countryName', cities.name AS 'cityName', region.name AS 'regionName' from country INNER JOIN region ON country.countryId = region.countryId INNER JOIN cities ON region.regionId = cities.regionId INNER JOIN cities_map ON cities_map.city_id = cities.cityId INNER JOIN events ON events.id = cities_map.event_id WHERE country.code='$local' AND eventDate >= NOW() ORDER BY events.counter DESC LIMIT 5;";

    
    $sql .= "select events.*, country.code AS 'countryCode', country.name AS 'countryName', cities.name AS 'cityName', region.name AS 'regionName' from country INNER JOIN region ON country.countryId = region.countryId INNER JOIN cities ON region.regionId = cities.regionId INNER JOIN cities_map ON cities_map.city_id = cities.cityId INNER JOIN events ON events.id = cities_map.event_id INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='technology' AND eventDate >= NOW() GROUP BY events.id LIMIT 5;";
    
    $sql .= "select events.*, country.code AS 'countryCode', country.name AS 'countryName', cities.name AS 'cityName', region.name AS 'regionName' from country INNER JOIN region ON country.countryId = region.countryId INNER JOIN cities ON region.regionId = cities.regionId INNER JOIN cities_map ON cities_map.city_id = cities.cityId INNER JOIN events ON events.id = cities_map.event_id INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='seasons' AND eventDate >= NOW() GROUP BY events.id LIMIT 5;";
    
    $sql .= "select events.*, country.code AS 'countryCode', country.name AS 'countryName', cities.name AS 'cityName', region.name AS 'regionName' from country INNER JOIN region ON country.countryId = region.countryId INNER JOIN cities ON region.regionId = cities.regionId INNER JOIN cities_map ON cities_map.city_id = cities.cityId INNER JOIN events ON events.id = cities_map.event_id INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='holidays' AND eventDate >= NOW() GROUP BY events.id LIMIT 5;";
    
    $sql .= "select events.*, country.code AS 'countryCode', country.name AS 'countryName', cities.name AS 'cityName', region.name AS 'regionName' from country INNER JOIN region ON country.countryId = region.countryId INNER JOIN cities ON region.regionId = cities.regionId INNER JOIN cities_map ON cities_map.city_id = cities.cityId INNER JOIN events ON events.id = cities_map.event_id INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='music' AND eventDate >= NOW() GROUP BY events.id LIMIT 5;";
    

    $sql .= "select events.*, country.code AS 'countryCode', country.name AS 'countryName', cities.name AS 'cityName', region.name AS 'regionName' from country INNER JOIN region ON country.countryId = region.countryId INNER JOIN cities ON region.regionId = cities.regionId INNER JOIN cities_map ON cities_map.city_id = cities.cityId INNER JOIN events ON events.id = cities_map.event_id INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='fashion' AND eventDate >= NOW() GROUP BY events.id LIMIT 5;";
    
    $sql .= "select events.*, country.code AS 'countryCode', country.name AS 'countryName', cities.name AS 'cityName', region.name AS 'regionName' from country INNER JOIN region ON country.countryId = region.countryId INNER JOIN cities ON region.regionId = cities.regionId INNER JOIN cities_map ON cities_map.city_id = cities.cityId INNER JOIN events ON events.id = cities_map.event_id INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='sports' AND eventDate >= NOW() GROUP BY events.id LIMIT 5;";
    
    $sql .= "select events.*, country.code AS 'countryCode', country.name AS 'countryName', cities.name AS 'cityName', region.name AS 'regionName' from country INNER JOIN region ON country.countryId = region.countryId INNER JOIN cities ON region.regionId = cities.regionId INNER JOIN cities_map ON cities_map.city_id = cities.cityId INNER JOIN events ON events.id = cities_map.event_id INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='social media' AND eventDate >= NOW() GROUP BY events.id LIMIT 5;";
    
    $sql .= "select events.*, country.code AS 'countryCode', country.name AS 'countryName', cities.name AS 'cityName', region.name AS 'regionName' from country INNER JOIN region ON country.countryId = region.countryId INNER JOIN cities ON region.regionId = cities.regionId INNER JOIN cities_map ON cities_map.city_id = cities.cityId INNER JOIN events ON events.id = cities_map.event_id INNER JOIN categories_map on events.id = categories_map.event_id WHERE categories_map.category_id='education' AND eventDate >= NOW() GROUP BY events.id LIMIT 5;";       
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
      while (mysqli_more_results($link) && mysqli_next_result($link));
     echo '}';
    }
    mysqli_close($link);
    exit();
  }
}