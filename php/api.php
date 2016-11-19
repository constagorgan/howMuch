<?php

include "router.php";
include "searchEvents.php";
  
$route = new Route();
$searchEvent = new SearchEvent();

$route->add("/searchEvents", $searchEvent->searchEvents($key = $_GET['id'], $name = $_GET['name'], $table = preg_replace('/[^a-z0-9_]+/i','',$_GET['table'])));

$route->submit();
