<?php
date_default_timezone_set('Europe/Bucharest');
include "router.php";
include "searchEvents.php";
include "getEvent.php";
include "searchCategories.php";
include "getUpcomingEvents.php";
include "saveUser.php";
include "addEvent.php";
include "confirm.php";
include "insertCities.php";

$route = new Route();

$route->add("/searchEvents", "SearchEvent::searchEvents");

$route->add("/searchCategories", 'SearchCategory::searchCategories');

$route->add("/getEvent", "GetEvent::getEvents");

$route->add("/getUpcomingEvents", "GetUpcomingEvent::getUpcoming");

$route->add("/signUp", "SaveUser::saveUsers");

$route->add("/addEvent", "AddEvent::addEvents");

$route->add("/confirmSignUp", "ConfirmUser::confirmUserSignUp");

$route->add("/insertCities", "InsertEvents::insertEventss");

$route->submit();
