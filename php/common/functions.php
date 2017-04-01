<?php

function format_signup_email($info, $format, $url, $cid){
	//grab the template content
	$template = file_get_contents('../Content/templates/signup_template.'.$format);
			
	//replace all the tags
	$template = str_replace('{USERNAME}', $info['username'], $template);
	$template = str_replace('{EMAIL}', $info['email'], $template);
	$template = str_replace('{KEY}', $info['key'], $template);
	$template = str_replace('{SITEPATH}',$url, $template);
    $template = str_replace('{LOGOPATH}',$cid, $template);
	return $template;

}

function format_reset_password($info, $format, $url, $cid){
    //grab the template content
	$template = file_get_contents('../Content/templates/reset_template.'.$format);
	//replace all the tags
	$template = str_replace('{USERNAME}', $info['username'], $template);
	$template = str_replace('{EMAIL}', $info['email'], $template);
	$template = str_replace('{KEY}', $info['key'], $template);
	$template = str_replace('{SITEPATH}',$url, $template);
  	$template = str_replace('{LOGOPATH}',$cid, $template);
  
	return $template;

}

function format_reset_new_password($info, $format, $cid){

	$template = file_get_contents('../Content/templates/new_reset_password_template.'.$format);
			
	$template = str_replace('{USERNAME}', $info['username'], $template);
	$template = str_replace('{PASSWORD}', $info['password'], $template);  	
    $template = str_replace('{LOGOPATH}',$cid, $template);
		
	return $template;

}

//send the welcome letter
function send_signup_email($info, $myMailUser, $myMailSecret, $eventSnitchUrl){
	//setup the mailer
	$transport = Swift_SmtpTransport::newInstance('server58.romania-webhosting.com',465, 'ssl') 
      ->setUsername($myMailUser)
      ->setPassword($myMailSecret);
	$mailer = Swift_Mailer::newInstance($transport);
	$message = Swift_Message::newInstance();
	$message ->setSubject('Welcome to Event Snitch');
	$message ->setFrom(array('noreply@eventsnitch.com' => 'Event Snitch'));
	$message ->setTo(array($info['email'] => $info['username']));
	 
    $cid = $message->embed(Swift_Image::fromPath('../Content/img/eventsnitch_logo_white.png'));

	//format each email
	$body = format_signup_email($info, 'html', $eventSnitchUrl, $cid);
	$body_plain_txt = format_signup_email($info, 'txt', $eventSnitchUrl, $cid);
  
	$message ->setBody($body, 'text/html');
			
	$result = $mailer->send($message);
	
	return $result;
	
}

//send the welcome letter
function send_reset_password($info, $myMailUser, $myMailSecret, $eventSnitchUrl){	
	//setup the mailer
	$transport = Swift_SmtpTransport::newInstance('server58.romania-webhosting.com',465, 'ssl') 
      ->setUsername($myMailUser)
      ->setPassword($myMailSecret);
	$mailer = Swift_Mailer::newInstance($transport);
	$message = Swift_Message::newInstance();
	$message ->setSubject('Reset Event Snitch Password');
	$message ->setFrom(array('noreply@eventsnitch.com' => 'Event Snitch'));
	$message ->setTo(array($info['email'] => $info['username']));
    
    $cid = $message->embed(Swift_Image::fromPath('../Content/img/eventsnitch_logo_white.png'));
	//format each email
	$body = format_reset_password($info, 'html', $eventSnitchUrl, $cid);
	$body_plain_txt = format_reset_password($info, 'txt',$eventSnitchUrl, $cid);

	$message ->setBody($body, 'text/html');
	$result = $mailer->send($message);
	
	return $result;
	
}

function send_reset_new_password($info, $myMailUser, $myMailSecret){    
	//setup the mailer 
	$transport = Swift_SmtpTransport::newInstance('server58.romania-webhosting.com',465, 'ssl') 
      ->setUsername($myMailUser)
      ->setPassword($myMailSecret);
	$mailer = Swift_Mailer::newInstance($transport);
	$message = Swift_Message::newInstance();
	$message ->setSubject('New Event Snitch Password');
	$message ->setFrom(array('noreply@eventsnitch.com' => 'Event Snitch'));
	$message ->setTo(array($info['email'] => $info['username']));
      
    $cid = $message->embed(Swift_Image::fromPath('../Content/img/eventsnitch_logo_white.png'));
  
	//format each email
	$body = format_reset_new_password($info, 'html', $cid);
	$body_plain_txt = format_reset_new_password($info, 'txt', $cid);
  
	$message ->setBody($body, 'text/html');
			
	$result = $mailer->send($message);
	
	return $result;
	
}