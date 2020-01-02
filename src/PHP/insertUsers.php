<?php

include('db_connect.php');

$user_name = $name = $email = "";


if (isset($_POST['username'])) {
  $user_name = mysqli_real_escape_string($conn, $_POST['username']);
}

if (isset($_POST['name'])) {
  $name = mysqli_real_escape_string($conn, $_POST['name']);
}

if (isset($_POST['email'])) {
  $email = mysqli_real_escape_string($conn, $_POST['email']);
}

$sql = "SELECT * from jfusers where username='$user_name'";
$result = mysqli_query($conn, $sql);

if (mysqli_affected_rows($conn) == 1) {

  echo 'Bu kullanıcı adı mevcut';
} else {
  $sql = "INSERT INTO jfusers(username,name,email) VALUES ('$user_name','$name','$email')";


  if (mysqli_query($conn, $sql)) {
    echo 'User succesfully added';
  } else {
    echo 'Query error:' . mysql_error($conn);
  }
}


?>