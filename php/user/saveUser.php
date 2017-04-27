<?php

class SaveUser {
  
  public static function saveUsers(){    
    $data = json_decode(file_get_contents('php://input'), true);
    header("Access-Control-Allow-Origin: *");
    // connect to the mysql database
    include_once 'common/functions.php'; 
    $configs = include('config.php');
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    mysqli_set_charset($link,'utf8');
    
    
    $date = new DateTime();
    date_sub($date, date_interval_create_from_date_string('5 years'));
    
    if($data && array_key_exists('email', $data) && array_key_exists('username', $data) && array_key_exists('password', $data) && array_key_exists('birthDate', $data) && array_key_exists('country', $data)){
      $email = mysqli_real_escape_string($link, $data['email']);
      if (filter_var($email, FILTER_VALIDATE_EMAIL) === false || strlen($data['password']) < 8 || !preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/', $data['password']) || !preg_match('/^([a-zA-Z0-9_-]){6,24}$/', $data['username']) || date_format($date, 'Y/m/d') <= $data['birthDate'] || '1900/01/01' >= $data['birthDate']) {
        http_response_code(400);
      } else {     
        $country = mysqli_real_escape_string($link, $data['country']);
        $countrySql = "SELECT name from `country` WHERE code='$country'";
        $countryResult = mysqli_query($link, $countrySql);
        
        if (!$countryResult || !$countryResult->num_rows) {
            http_response_code(400);
        }
        else {
          $username = mysqli_real_escape_string($link, $data['username']);
          $password = mysqli_real_escape_string($link, $data['password']);
          $birthDate = mysqli_real_escape_string($link, $data['birthDate']);
          $hashed_password = password_hash($password, PASSWORD_DEFAULT);
          $sql = "INSERT INTO `users` (`email`, `username`, `password`, `active`, `country`, `birthDate`) VALUES ('$email', '$username', '$hashed_password', 0, '$country', '$birthDate');";

          $result = mysqli_query($link,$sql);

          if (!$result) {
            if(mysqli_errno($link) == 1062){
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
                $confirm = mysqli_query($link, "INSERT INTO `confirm_user` VALUES(NULL,'$userid','$hashedKey','$email', '$expirationDate', '$ip')"); 
                http_response_code(200);

            }else{
                http_response_code(400);
            } 
          }
        } 
        mysqli_close($link);
      }
    } else {
      http_response_code(400);
      echo  "{'status' : 'error','msg':'Bad request'}";
    }
    exit();
  }

}
