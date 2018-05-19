<?php  

date_default_timezone_set('Europe/Bucharest');
$configs = include(dirname(__FILE__) . '/../config.php');

$link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);

$sql = "DELETE users, confirm_user FROM users INNER JOIN confirm_user ON users.id = confirm_user.userid  WHERE confirm_user.expirationDate < NOW() - INTERVAL 1 MONTH AND users.active = 0";
$stmt = $link->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();

mysqli_close($link);
exit();
