<?php
class SearchEvent {
  
  public function searchEvents($key, $name, $table){
    header("Access-Control-Allow-Origin: *");
    // get the HTTP method, path and body of the request
    $method = $_SERVER['REQUEST_METHOD'];
    $request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
    $input = json_decode(file_get_contents('php://input'),true);

    // connect to the mysql database
    include_once('config.inc.php');
    $link = mysqli_connect($myUltimateSecret, $myBiggerSecret, $myExtremeSecret, $mySecret);
    mysqli_set_charset($link,'utf8');

    // escape the columns and values from the input object
    $columns = preg_replace('/[^a-z0-9_]+/i','',array_keys($input));
    $values = array_map(function ($value) use ($link) {
      if ($value===null) return null;
      return mysqli_real_escape_string($link,(string)$value);
    },array_values($input));

    // build the SET part of the SQL command
    $set = '';
    for ($i=0;$i<count($columns);$i++) {
      $set.=($i>0?',':'').'`'.$columns[$i].'`=';
      $set.=($values[$i]===null?'NULL':'"'.$values[$i].'"');
    }

    // create SQL based on HTTP method
    switch ($method) {
      case 'GET':
        $sql = "select * from `$table`".($key?" WHERE id=$key":($name?" WHERE Name LIKE '$name%' LIMIT 5":'')); break;
    }

    // excecute SQL statement
    $result = mysqli_query($link,$sql);

    // die if SQL statement failed
    if (!$result) {
      http_response_code(404);
      die(mysqli_error());
    }

    // print results, insert id or affected row count
    if ($method == 'GET') {
      if (!$key) echo '[';
      for ($i=0;$i<mysqli_num_rows($result);$i++) {
        echo ($i>0?',':'').json_encode(mysqli_fetch_object($result));
      }
      if (!$key) echo ']';
    }
    // close mysql connection
    mysqli_close($link);
    exit();
  }
}