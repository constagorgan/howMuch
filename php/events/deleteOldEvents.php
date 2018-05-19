<?php  

date_default_timezone_set('Europe/Bucharest');
$configs = include(dirname(__FILE__) . '/../config.php');

$link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);

$sql = "DELETE events, categories_map, special_effects_map FROM events LEFT JOIN categories_map ON categories_map.event_id = events.id LEFT JOIN special_effects_map ON special_effects_map.event_id = events.id WHERE events.eventDate < NOW() - INTERVAL 2 MONTH AND events.id <> 1";
$stmt = $link->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();

mysqli_close($link);
exit();
