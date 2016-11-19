<?php

include "router.php";
include "searchEvents.php";
include "searchCategories.php";

$route = new Route();

$route->add("/searchEvents", "SearchEvent::searchEvents");

$route->add("/searchCategories", 'SearchCategory::searchCategories');

$route->submit();
