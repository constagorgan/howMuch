<?php

class SaveUser {
  
  public static function saveUsers(){    
    $data = json_decode(file_get_contents('php://input'), true);
    // connect to the mysql database
    include_once 'common/functions.php'; 
    require_once 'recaptchalib.php';
    $configs = include('config.php');
    
    $http_origin = $_SERVER['HTTP_ORIGIN'];
    if ($configs->allowCorsLocal == true || $http_origin == "http://localhost:8001" || $http_origin == "https://www.eventsnitch.com" ||  $http_origin == "https://eventsnitch.com")
    {  
        header("Access-Control-Allow-Origin: $http_origin");
    }
    
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    mysqli_set_charset($link,'utf8');
    
    $secret = $configs->myCaptchaUlimateSecret;
    $response = null;
    $reCaptcha = new ReCaptcha($secret);
    
    $date = new DateTime();
    date_sub($date, date_interval_create_from_date_string('4 years + 364 days'));
    
    if($data && array_key_exists('email', $data) && array_key_exists('username', $data) && array_key_exists('password', $data) && array_key_exists('birthDate', $data) && array_key_exists('country', $data) && array_key_exists('recaptchaCode', $data)){
      $email = strtolower(mysqli_real_escape_string($link, $data['email']));
      if (filter_var($email, FILTER_VALIDATE_EMAIL) === false || strlen($data['password']) < 8 || !preg_match('/^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$/', $data['password']) || !preg_match('/^([a-zA-Z0-9_-]){6,24}$/', $data['username']) || date_format($date, 'Y/m/d') <= $data['birthDate'] || '1900/01/01' >= $data['birthDate']) {
        error_log('Sign up user invalid request. Invalid parameters. '.json_encode($email), 0);
        http_response_code(400);
      } else {     
        $response = $reCaptcha->verifyResponse(
            $_SERVER["REMOTE_ADDR"],
            mysqli_real_escape_string($link, $data['recaptchaCode'])
        );
        if ($response != null && $response->success) {
          $country = mysqli_real_escape_string($link, $data['country']);

          $stmt = $link->prepare("SELECT name from `country` WHERE code=?");
          $stmt->bind_param('s', $country);
          $stmt->execute();

          $countryResult = $stmt->get_result();

          if (!$countryResult || !$countryResult->num_rows) {
              error_log('Sign up user invalid request. Country code is not in DB. '.json_encode($email).' Country: '.$country, 0);
              http_response_code(400);
          }
          else {
            $username = mysqli_real_escape_string($link, $data['username']);
            $password = mysqli_real_escape_string($link, $data['password']);
            $birthDate = mysqli_real_escape_string($link, $data['birthDate']);
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $autoFillZero = '0';

            $stmtTwo = $link->prepare("INSERT INTO `users` (`email`, `username`, `password`, `active`, `country`, `birthDate`) VALUES (?, ?, ?, ?, ?, ?)");

            $stmtTwo->bind_param('ssssss', $email, $username, $hashed_password, $autoFillZero, $country, $birthDate);
            $stmtTwo->execute();

            if (mysqli_error($link)) {
              if(mysqli_errno($link) == 1062){              
                error_log('Sign up user error. Email:'.$email.' Username: '.$username, 0);
                $duplicate = explode("key ", mysqli_error($link));
                if($duplicate[1]=="'email'")
                  echo  '{"status" : "error","msg":"An account with this email already exists"}';
                else 
                  echo  '{"status" : "error","msg":"An account with this username already exists"}';
                http_response_code(409);
              }
              else
                http_response_code(400);
            }

            else {
              $userid = mysqli_insert_id($link);
              //create a random key
              $length = 20;
              $key = bin2hex(openssl_random_pseudo_bytes(16));    

              //put info into an array to send to the function
              include_once 'swift/swift_required.php';
              $info = array(
                  'username' => $username,
                  'email' => $email,
                  'key' => $key
              );
              $hashedKey = hash('sha512', $key);
              $expirationDate = (new DateTime('+1 day'))->format('Y-m-d H:i:s');
              //send the email
              //Test if it is a shared client
              if (!empty($_SERVER['HTTP_CLIENT_IP'])){
                $ip=$_SERVER['HTTP_CLIENT_IP'];
              //Is it a proxy address
              }elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])){
                $ip=$_SERVER['HTTP_X_FORWARDED_FOR'];
              }else{
                $ip=$_SERVER['REMOTE_ADDR'];
              }
              //The value of $ip at this point would look something like: "192.0.34.166"
              $ip = ip2long($ip);
              //The $ip would now look something like: 1073732954
              if(send_signup_email($info, $configs->myMailUser, $configs->myMailSecret, $configs->eventSnitchUrl)){
                  //email sent
                  $stmtThree = $link->prepare("INSERT INTO `confirm_user` VALUES(NULL, ?, ?, ?, ?, ?)");

                  $stmtThree->bind_param('sssss', $userid, $hashedKey, $email, $expirationDate, $ip);
                  $stmtThree->execute();

                  $confirm = $stmtThree->get_result() or die(mysqli_error($link));

                  http_response_code(200);

              }else{              
                  error_log('Sign up user error at email send. '.json_encode($email), 0);
                  http_response_code(400);
              } 
            }
          } 
          mysqli_close($link);
        } else {
          error_log('Invalid captcha code.', 0);
          http_response_code(400);
        }
      }
    } else {
      error_log('Sign up user invalid request. Missing parameters. ', 0);
      http_response_code(400);
    }
    exit();
  }

}
