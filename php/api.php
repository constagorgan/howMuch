<?php
date_default_timezone_set('Europe/Bucharest');
include "router.php";
include "searchEvents.php";
include "getEvent.php";
include "searchCategories.php";
include "getUpcomingEvents.php";
include "saveUser.php";
include "resetPassword.php";
include "addEvent.php";
include "confirmUser.php";
include "confirmReset.php";
include "changePassword.php";
include "insertCities.php";


$route = new Route();

$route->add("/searchEvents", "SearchEvent::searchEvents");

$route->add("/searchCategories", 'SearchCategory::searchCategories');

$route->add("/getEvent", "GetEvent::getEvents");

$route->add("/getUpcomingEvents", "GetUpcomingEvent::getUpcoming");

$route->add("/signUp", "SaveUser::saveUsers");

$route->add("/resetPassword", "ResetPassword::resetUserPass");

$route->add("/addEvent", "AddEvent::addEvents");

$route->add("/confirmSignUp", "ConfirmUser::confirmUserSignUp");

$route->add("/confirmReset", "ConfirmReset::confirmUserPassReset");

$route->add("/changePassword", "ChangePassword::changeUserPass");

$route->add("/insertCities", "InsertEvents::insertEventss");

$route->submit();
