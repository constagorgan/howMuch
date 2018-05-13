<?php
require_once(dirname(__FILE__) . '/../vendor/autoload.php');
use \Facebook\Facebook; 

$affiliateid  = 14629;
date_default_timezone_set('Europe/Bucharest');
$configs = include(dirname(__FILE__) . '/../config.php');
$countriesMap = include(dirname(__FILE__) . '/../mapCountries.php');

$autoFillZero = '0';
$autoFillOne = '1';
$autoFillTimezone = 'Europe/London';
$autoFillCreatorUser = 'EventSnitch';

$fb = new \Facebook\Facebook([
  'app_id' => $configs->eventSnitchFacebookAppId,
  'app_secret' => $configs->eventSnitchFacebookAppSecret,
  'default_graph_version' => 'v2.10'
]);

$link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);

$urls = array('http://xml.skiddlecdn.co.uk/affiliates/topsellers.xml', 'http://xml.skiddlecdn.co.uk/affiliates/festivals.xml');
for($i=0; $i<count($urls); $i++) {
  $url = $urls[$i];

  $curl = curl_init($url);
  curl_setopt_array($curl, array(
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "GET",
    CURLOPT_HTTPHEADER => array(
      "cache-control: no-cache",
      "user-agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36" // Here we add the header
    ),
  ));

  $xmlString = curl_exec($curl);

  $j=0;
  $time = new DateTime();
  $time = date_format($time, 'Y/m/d H:i');

  $xml = simplexml_load_string($xmlString);

  foreach($xml->events->event as $x){
      $id = $x['id'];
      $name = $x->name;

      $sql = "select events.id from events WHERE name=? AND creatorUser = 'EventSnitch';";
      $stmtThree = $link->prepare($sql);
      $stmtThree->bind_param('s', $name);
      $stmtThree->execute();
      $result = $stmtThree->get_result();
      if (mysqli_num_rows($result) > 0) {
        sleep(0.1);
        continue;
      }

      $urlLinkValue = $x['link'];
      $date = $x->date;
      $desc = $x->shortdesc;
      $doorsopen = $x->doorsopen;
      $doorsclose = $x->doorsclose;
      $venue = $x->venue->name;
      $background = "1";
      $locationMagicKey = '361947134219308';
      $locationCountryCode = 'GB';
      $dataCount = 1;
      $urlLink = str_replace("sktag=XXX","sktag=".$affiliateid,$urlLinkValue);

      $dateOpen = new DateTime($date . ' ' . $doorsopen);
      $dateClose = new DateTime($date . ' ' . $doorsclose);
      $dateOpen = date_format($dateOpen, 'Y/m/d H:i');
      $timeOpen  = strtotime($dateOpen);
      $timeClose = strtotime(date_format($dateClose, 'Y/m/d H:i'));
      if($timeClose < $timeOpen) {
        $timeClose += 86400;
      }
      $differenceInSeconds = $timeClose - $timeOpen;

      $categoriesSql = "INSERT INTO `categories_map` (`category_id`, `event_id`) VALUES ('Entertainment', ?)";

      switch ($x->eventcode) {
        case "FILM":
            $background = "33";
            break;
        case "EXHIB":
            $background = "12";
            break;
        case "CLUB":
            $strings = array('14','25', '27');
            $key = array_rand($strings);
            $background = $strings[$key];
            $categoriesSql .= ", ('Music', ?)";
            $dataCount = 2;
            break;
        case "FEST":
            $strings = array('14','25', '27', '31','34', '41', '44','57', '61');
            $key = array_rand($strings);
            $background = $strings[$key];
            $categoriesSql .= ", ('Music', ?)";
            $dataCount = 2;
            break;
        default:
            $strings = array('14','25', '27', '31','34', '41', '44','57', '61');
            $key = array_rand($strings);
            $background = $strings[$key];
            break;
      }

      try {
        $requestLocations = $fb->request('GET', '/search?access_token='.$configs->eventSnitchFacebookAppId.'|'.$configs->eventSnitchFacebookAppSecret.'&type=place&fields=location,name&limit=6&q='.$x->venue->name . ' ' . $x->venue->address);
        $response = $fb->getClient()->sendRequest($requestLocations);
      } catch(\Facebook\Exceptions\FacebookResponseException $e) {
        echo 'Graph returned an error: ' . $e->getMessage();
        exit;
      } catch(\Facebook\Exceptions\FacebookSDKException $e) {
        echo 'Facebook SDK returned an error: ' . $e->getMessage();
      }
      $graphEdge = $response->getGraphEdge();

      foreach($graphEdge as $edge) {
        if($edge['location'] && $edge['location']['country']) {
          if(strtolower($edge['location']['city']) == strtolower($x->venue->city)) {
            if($edge['id']) {
              $locationMagicKey = $edge['id'];
            }
          }
        }
      }
      $insertEventSql = "INSERT INTO `events` (`createdAt`, `name`, `hashtag`, `duration`, `counter`, `eventDate`, `dateTimezone`, `featured`, `isLocal`, `private`, `background`, `creatorUser`, `location`, `locationMagicKey`, `locationCountryCode`, `description`, `ticketsLink`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";


      $stmt = $link->prepare($insertEventSql);    
      $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
      $safeDescription = htmlspecialchars($desc, ENT_QUOTES, 'UTF-8');
      $safeLocation = htmlspecialchars($venue, ENT_QUOTES, 'UTF-8');
      $stmt->bind_param('sssssssssssssssss', $time, $safeName, $name, $differenceInSeconds, $autoFillZero, $dateOpen, $autoFillTimezone, $autoFillOne, $autoFillOne, $autoFillZero,  $background, $autoFillCreatorUser, $safeLocation, $locationMagicKey, $locationCountryCode, $safeDescription, $urlLink);
      $stmt->execute();

      if (!mysqli_error($link)) {        
        $eventId = mysqli_insert_id($link);
        $stmtTwo = $link->prepare($categoriesSql);
        $types = str_repeat("s", $dataCount);
        if($dataCount == 1) {
          $stmtTwo->bind_param($types, $eventId);
        } else if($dataCount == 2) {
          $stmtTwo->bind_param($types, $eventId, $eventId);
        }
        $stmtTwo->execute();    
      }

      $j++;
      if($j > 75) {
        break;
      }
      sleep(1);
  }
}
mysqli_close($link);

exit();

?>
  