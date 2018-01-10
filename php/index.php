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
include "user/editUser.php";
include "user/resetPassword.php";
include "user/confirmUser.php";
include "user/confirmReset.php";
include "user/changePassword.php";
include "user/loginUser.php";
include "common/resetAccessToken.php";
include "common/getCountries.php";
include "common/sendUserFeedback.php";
include "events/getLoggedUserEvents.php";
include "events/getEventLocations.php";
include "events/getEventPlaces.php";
include "events/getEventsInfo.php";
include "common/getUserPictures.php";
include "common/saveUserPicture.php";

$route = new Route();

$route->add("/searchEvents", "SearchEvent::searchEvents");

$route->add("/searchCategories", 'SearchCategory::searchCategories');

$route->add("/getEvent", "GetEvent::getEvents");

$route->add("/getUpcomingEvents", "GetUpcomingEvent::getUpcoming");

$route->add("/addEvent", "AddEvent::addEvents");

$route->add("/editEvent", "EditEvent::editEvents");

$route->add("/signUp", "SaveUser::saveUsers");

$route->add("/editUser", "EditUser::editUsers");

$route->add("/signIn", "LoginUser::loginUsers");

$route->add("/resetPassword", "ResetPassword::resetUserPass");

$route->add("/confirmSignUp", "ConfirmUser::confirmUserSignUp");

$route->add("/confirmReset", "ConfirmReset::confirmUserPassReset");

$route->add("/changePassword", "ChangePassword::changeUserPass");

$route->add("/resetAccessToken", "ResetAccessToken::resetAccessTokens");

$route->add("/getCountries", "GetCountry::getCountries");

$route->add("/getEventLocations", "GetEventLocation::getEventLocations");

$route->add("/getEventPlace", "GetEventPlace::getEventPlaces");

$route->add("/getLoggedUserEvents", "GetLoggedUserEvent::getLoggedUserEvents");

$route->add("/getEventInfo", "GetEventsInformation::getEventsInfo");

$route->add("/sendUserFeedback", "SendUserEmail::sendUserFeedback");

$route->add("/getUserPictures", "GetUserPicture::getUserPictures");

$route->add("/saveUserPicture", "SaveUserPicture::saveUserPictures");

$route->submit();
