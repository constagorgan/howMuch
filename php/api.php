<?php

include "router.php";
include "searchEvents.php";
include "getEvent.php";
include "searchCategories.php";
include "getUpcomingEvents.php";
include "saveUser.php";

$route = new Route();

$route->add("/searchEvents", "SearchEvent::searchEvents");

$route->add("/searchCategories", 'SearchCategory::searchCategories');

$route->add("/getEvent", "GetEvent::getEvents");

$route->add("/getUpcomingEvents", "GetUpcomingEvent::getUpcoming");

$route->add("/signUp", "SaveUser::saveUsers");

$route->submit();
