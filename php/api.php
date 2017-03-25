<?php
date_default_timezone_set('Europe/Bucharest');
include "router.php";
include "events/searchEvents.php";
include "events/getEvent.php";
include "events/searchCategories.php";
include "events/getUpcomingEvents.php";
include "events/addEvent.php";
include "events/editEvent.php";
include "user/saveUser.php";
include "user/resetPassword.php";
include "user/confirmUser.php";
include "user/confirmReset.php";
include "user/changePassword.php";
include "extra/insertCities.php";
include "user/loginUser.php";
include "common/resetAccessToken.php";

$route = new Route();

$route->add("/searchEvents", "SearchEvent::searchEvents");

$route->add("/searchCategories", 'SearchCategory::searchCategories');

$route->add("/getEvent", "GetEvent::getEvents");

$route->add("/getUpcomingEvents", "GetUpcomingEvent::getUpcoming");

$route->add("/addEvent", "AddEvent::addEvents");

$route->add("/editEvent", "EditEvent::editEvents");

$route->add("/signUp", "SaveUser::saveUsers");

$route->add("/signIn", "LoginUser::loginUsers");

$route->add("/resetPassword", "ResetPassword::resetUserPass");

$route->add("/confirmSignUp", "ConfirmUser::confirmUserSignUp");

$route->add("/confirmReset", "ConfirmReset::confirmUserPassReset");

$route->add("/changePassword", "ChangePassword::changeUserPass");

$route->add("/resetAccessToken", "ResetAccessToken::resetAccessTokens");

$route->add("/insertCities", "InsertEvents::insertEventss");

$route->submit();
