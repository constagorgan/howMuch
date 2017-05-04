<?php

require_once('vendor/autoload.php');
use \Firebase\JWT\JWT; 

class ResetAccessToken {
    
  public static function resetAccessTokens(){
    $data = json_decode(file_get_contents('php://input'), true);
    $configs = include('config.php');
    header("Access-Control-Allow-Origin: ".$configs->eventSnitchUrl);
    
    $link = mysqli_connect($configs->myUltimateSecret, $configs->myBiggerSecret, $configs->myExtremeSecret, $configs->mySecret);

    if($data && array_key_exists('jwtToken', $data)){
        $token = $data['jwtToken'];
        
        try {
          $DecodedDataArray = JWT::decode($token, $configs->mySecretKeyJWT, array($configs->mySecretAlgorithmJWT));
          $email = $DecodedDataArray->data->name;    
          $check_key = mysqli_query($link, "SELECT id, email, username, lastPassChange FROM users WHERE `email` = '$email' AND active=1  LIMIT 1") or die(mysqli_error($link));
          if(mysqli_num_rows($check_key) != 0)  
          {
            $rows = array();
            while($r = mysqli_fetch_assoc($check_key)) {
              $rows[] = $r;
            }
            if($rows[0]['lastPassChange'] && date("Y-m-d H:i:s", $DecodedDataArray->iat) < date($rows[0]['lastPassChange'])){
              http_response_code(401);
            } else {
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
             echo '{"status" : "success","resp":'.json_encode($unencodedArray).'}';
            }
          }
          
        } catch (Exception $e) {
            http_response_code(401);
        }
       
     } else {
          http_response_code(401);
     }
  }  
}
