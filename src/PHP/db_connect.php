<?php 

//connect to database
//$mysqli = new mysqli("localhost", "user", "password", "test");
//$mysqli->set_charset("utf8");
$conn = mysqli_connect('localhost', 'dilan', 'S8wzpZ66E', 'jotformusers');
$conn->set_charset("utf8");
//check connection
if (!$conn) {
    echo 'Connection error:' . mysqli_connect_error();
}
?>