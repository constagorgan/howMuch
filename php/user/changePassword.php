<?php

require_once('vendor/autoload.php');
use \Firebase\JWT\JWT; 

class ChangePassword {
  
  public static function changeUserPass(){    
    $data = json_decode(file_get_contents('php://input'), true);
    $configs = include('config.php');
          
      header("Access-Control-Allow-Origin: *");
    
      $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
      if($data && array_key_exists('email', $data) && array_key_exists('password', $data) && array_key_exists('newPassword', $data)){
        $email = mysqli_real_escape_string($link, $data['email']);
        $password = mysqli_real_escape_string($link, $data['password']);
        $new_password = mysqli_real_escape_string($link, $data['newPassword']);
        if (filter_var($email, FILTER_VALIDATE_EMAIL) === false || strlen($new_password) < 8 || !preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/',
                  $new_password) ) {
          http_response_code(400);
        } else {
          if($data && array_key_exists('jwtToken', $data)){
          $token = $data['jwtToken'];

          try {
            $DecodedDataArray = JWT::decode($token, $configs->mySecretKeyJWT, array($configs->mySecretAlgorithmJWT));
            
            $check_key = mysqli_query($link, "SELECT password, lastPassChange, id, username, email FROM users WHERE `email` = '$email' AND active=1  LIMIT 1") or die(mysqli_error($link));

            if(mysqli_num_rows($check_key) != 0){

                $rows = array();
                while($r = mysqli_fetch_assoc($check_key)) {
                  $rows[] = $r;
                }
                if($rows[0]['lastPassChange'] && date("Y-m-d H:i:s", $DecodedDataArray->iat) < date($rows[0]['lastPassChange'])){
                  http_response_code(401);
                } else {
                  if(password_verify($password, $rows[0]['password'])){
                    $tokenId    = base64_encode(mcrypt_create_iv(32));
                    $issuedAt   = time();
                    $notBefore  = $issuedAt;  
                    $expire     = $notBefore + 604800; /// add one week to expire, refresh on action
                    $serverName = $configs->eventSnitchUrl; /// set your domain name 

                    $data = [
                        'iat'  => $issuedAt,         // Issued at: time when the token was generated
                        'jti'  => $tokenId,          // Json Token Id: an unique identifier for the token
                        'iss'  => $serverName,       // Issuer
                        'nbf'  => $notBefore,        // Not before
                        'exp'  => $expire,           // Expire
                        'data' => [                  // Data related to the logged user you can set your required data
                          'id'   => $rows[0]['id'], // id from the users table
                          'name' => $rows[0]['email'], //  name
                          'username' => $rows[0]['username'] //  name
                        ]
                    ];

                    $jwt = JWT::encode(
                              $data, //Data to be encoded in the JWT
                              $configs->mySecretKeyJWT, // The signing key
                              $configs->mySecretAlgorithmJWT 
                             ); 
                    $unencodedArray = ['jwt' => $jwt];
                    $new_hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
                    $time = new DateTime();
                    $time = $time->format('Y-m-d H:i:s');
                    $update_users = mysqli_query($link, "UPDATE `users` SET `password` = '$new_hashed_password', `lastPassChange` = '$time' WHERE `email` = '$email' LIMIT 1") or die(mysqli_error($link));

                    if($update_users){
                      echo  '{"resp":'.json_encode($unencodedArray).'}';
                      http_response_code(200);
                    }else{
                      if(mysqli_errno($link) == 1062)
                        http_response_code(409);
                      else
                        http_response_code(400);
                    }
                  } else {
                    http_response_code(401);
                  }               
                } 
              } else {
                http_response_code(401);
              } 
            } catch (Exception $e) {
              http_response_code(401);
            }

          } else {
            http_response_code(401);
          }
        }
      } else {
        http_response_code(401);
      }
    } 
  } 

?>
