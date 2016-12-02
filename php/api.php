<?php

include "router.php";
include "searchEvents.php";
include "getEvent.php";
include "searchCategories.php";

$route = new Route();

$route->add("/searchEvents", "SearchEvent::searchEvents");

$route->add("/searchCategories", 'SearchCategory::searchCategories');

$route->add("/getEvent", "GetEvent::getEvents");

$route->submit();
