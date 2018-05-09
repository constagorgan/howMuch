<?php
class InsertRecurringEvents {
  
  public static function insertEvents(){
    $configs = include('config.php');    
        
    $http_origin = $_SERVER['HTTP_ORIGIN'];
    if ($configs->allowCorsLocal == true || $http_origin == "http://localhost:8001" || $http_origin == "https://www.eventsnitch.com")
    {  
        header("Access-Control-Allow-Origin: $http_origin");
    }
    
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);

    $recurringEvents = include('recurringEvents.php');
    for($i=0; $i<count($recurringEvents); $i++) {
      $sql = "select events.id, events.name, events.hashtag, events.location, events.locationMagicKey, events.locationCountryCode, events.eventDate, events.dateTimezone, events.description, events.creatorUser, events.duration, events.featured, events.private, events.isLocal, events.background, events.counter, special_effects_map.special_effect_id AS 'specialEffect' from events LEFT JOIN special_effects_map ON special_effects_map.event_id = events.id WHERE name LIKE '". $recurringEvents[$i] ."%' AND creatorUser = 'EventSnitch' ORDER BY events.eventDate DESC LIMIT 1;";

      $stmt = $link->prepare($sql);    
      $stmt->execute();

      $result = $stmt->get_result();
      if (!$result) {
        http_response_code(400);
      }

      $rows = array();
      
      while($r = mysqli_fetch_assoc($result)) {
        $rows[] = $r;
        if(date_format(new DateTime(), 'Y/m/d H:i') > date_format(new DateTime($r['eventDate']), 'Y/m/d H:i')) {
          print json_encode(date_format(new DateTime(), 'Y/m/d H:i'));
          echo '   ';
          echo $r['eventDate'] . '  ' . $r['name'] . '    finish' . "\n";
          $specialEffectSql = "select special_effects_map.special_effect_id from special_effects_map WHERE special_effects_map.event_id = ?;";
          $stmtTwo = $link->prepare($specialEffectSql);    
          $stmtTwo->bind_param('s', $r['id']);
          $stmtTwo->execute();
          $specialEffectResult = $stmtTwo->get_result();
          $specialEffects = array();
          while($s = mysqli_fetch_assoc($specialEffectResult)) {
            $specialEffects[] = $s;
          }

          $categoriesSql = "select categories_map.category_id from categories_map WHERE categories_map.event_id = ?;";
          $stmtThree = $link->prepare($categoriesSql);    
          $stmtThree->bind_param('s', $r['id']);
          $stmtThree->execute();

          $categoriesResult = $stmtThree->get_result();
          $categories = array();
          while($c = mysqli_fetch_assoc($categoriesResult)) {
            $categories[] = $c;
          }

          $autoFillZero = '0';
          $newDate = new DateTime($r['eventDate']);
          date_add($newDate, date_interval_create_from_date_string('1 year'));
          $eventDate = date_format($newDate, 'Y/m/d H:i');   
          $eventYear = date_format($newDate, 'Y');   
          $time = new DateTime();
          $time = date_format($time, 'Y/m/d H:i');

          $newName = str_replace(date_format(new DateTime($r['eventDate']), 'Y'), $eventYear, $r['name']);
          $newHashtag = str_replace(date_format(new DateTime($r['eventDate']), 'Y'), $eventYear, $r['hashtag']);
          $newDescription = str_replace(date_format(new DateTime($r['eventDate']), 'Y'), $eventYear, $r['description']);

          $insertEventSql = "INSERT INTO `events` (`createdAt`, `name`, `hashtag`, `duration`, `counter`, `eventDate`, `dateTimezone`, `featured`, `isLocal`, `private`, `background`, `creatorUser`, `location`, `locationMagicKey`, `locationCountryCode`, `description`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
          $stmtFour = $link->prepare($insertEventSql);    
          $stmtFour->bind_param('ssssssssssssssss', $time, $newName, $newHashtag, $r['duration'], $autoFillZero, $eventDate, $r['dateTimezone'], $autoFillZero, $r['isLocal'], $autoFillZero,  $r['background'], $r['creatorUser'] , $r['location'], $r['locationMagicKey'], $r['locationCountryCode'], $newDescription);
          $stmtFour->execute();

          if (!mysqli_error($link)) {        
            $eventId = mysqli_insert_id($link);
            $categoryValues = '';
            if(count($categories)) {
              for($i=0; $i<count($categories); $i++) {
                $categoryValues .= " (\"".$categories[$i]['category_id']."\", ".$eventId.")";
                if($i+1 < count($categories)) {
                  $categoryValues .= ',';
                }
              }
              $insertEventSql = "INSERT INTO `categories_map` (`category_id`, `event_id`) VALUES " . $categoryValues;
              $stmtFive = $link->prepare($insertEventSql);
              $stmtFive->execute();
            }
            $specialEffectsValues = '';
            if(count($specialEffects)) {
              for($i=0; $i<count($specialEffects); $i++) {
                $specialEffectsValues .= " (\"".$specialEffects[$i]['special_effect_id']."\", ".$eventId.")";
                if($i+1 < count($specialEffects)) {
                  $specialEffectsValues .= ',';
                }
              }
              $insertSpecialEffectSql = "INSERT INTO `special_effects_map` (`special_effect_id`, `event_id`) VALUES " . $specialEffectsValues;
              $stmtSix = $link->prepare($insertSpecialEffectSql);
              $stmtSix->execute();
            }
          }
        }
      }
      sleep(.1);
    }
    mysqli_close($link);
    exit();
  }

}
