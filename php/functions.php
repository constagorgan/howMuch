<?php

function format_email($info, $format){

	//grab the template content
	$template = file_get_contents('../Content/templates/signup_template.'.$format);
			
	//replace all the tags
	$template = str_replace('{USERNAME}', $info['username'], $template);
	$template = str_replace('{EMAIL}', $info['email'], $template);
	$template = str_replace('{KEY}', $info['key'], $template);
	$template = str_replace('{SITEPATH}','http://localhost:8003', $template);
		
	//return the html of the template
	return $template;

}

//send the welcome letter
function send_email($info){
		
	//format each email
	$body = format_email($info,'html');
	$body_plain_txt = format_email($info,'txt');

	//setup the mailer
    include('config.inc.php');
	$transport = Swift_SmtpTransport::newInstance('server58.romania-webhosting.com',465, 'ssl') 
      ->setUsername($myMailUser)
      ->setPassword($myMailSecret);
	$mailer = Swift_Mailer::newInstance($transport);
	$message = Swift_Message::newInstance();
	$message ->setSubject('Welcome to Event Snitch');
	$message ->setFrom(array('noreply@eventsnitch.com' => 'Event Snitch'));
	$message ->setTo(array($info['email'] => $info['username']));
	
	$message ->setBody($body_plain_txt);
	$message ->addPart($body, 'text/html');
			
	$result = $mailer->send($message);
	
	return $result;
	
}