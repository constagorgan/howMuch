<?php

require_once('vendor/autoload.php');
use \Firebase\JWT\JWT; 

class ChangePassword {
  
  public static function changeUserPass(){    
    $data = json_decode(file_get_contents('php://input'), true);
    $configs = include('config.php');
    header("Access-Control-Allow-Origin: ".$configs->eventSnitchCORS);
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);
    if($data && array_key_exists('email', $data) && array_key_exists('password', $data) && array_key_exists('newPassword', $data)){
      $email = mysqli_real_escape_string($link, $data['email']);
      $password = mysqli_real_escape_string($link, $data['password']);
      $new_password = mysqli_real_escape_string($link, $data['newPassword']);
      if (filter_var($email, FILTER_VALIDATE_EMAIL) === false || strlen($new_password) < 8 || !preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(_|[^\w])).+$/',
                $new_password) ) {
        error_log('Change password invalid request. Sent data is invalid. '.json_encode($email), 0);
        http_response_code(400);
      } else {
        if($data && array_key_exists('jwtToken', $data)){
        $token = $data['jwtToken'];

        try {
          $DecodedDataArray = JWT::decode($token, $configs->mySecretKeyJWT, array($configs->mySecretAlgorithmJWT));
          $stmt = $link->prepare("SELECT password, lastPassChange, id, username, email FROM users WHERE `email` = ? AND active=1  LIMIT 1");
          $stmt->bind_param('s', $email);
          $stmt->execute();
          
          $check_key = $stmt->get_result();

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
                  $stmtTwo = $link->prepare("UPDATE `users` SET `password` = ?, `lastPassChange` = ? WHERE `email` = ? LIMIT 1");
                  $stmtTwo->bind_param('sss', $new_hashed_password, $time, $email);
                  $stmtTwo->execute();

                  $update_users = $stmtTwo->get_result();

                  if($update_users){
                    echo  '{"resp":'.json_encode($unencodedArray).'}';
                    http_response_code(200);
                  }
                } else {          
                  error_log('Change password invalid request. Sent data has invalid old password. '.json_encode($email), 0);
                  http_response_code(401);
                }               
              } 
            } else {          
              error_log('Change password invalid email. '.json_encode($email), 0);
              http_response_code(401);
            } 
          } catch (Exception $e) {
            error_log('Change password invalid token', 0);
            http_response_code(401);
          }

        } else {          
          error_log('Change password invalid request. Token is missing. '.json_encode($email), 0);
          http_response_code(401);
        }
      }
    } else {          
      error_log('Change password invalid request. Sent data is incomplete.', 0);
      http_response_code(401);
    }
  } 
} 

?>
