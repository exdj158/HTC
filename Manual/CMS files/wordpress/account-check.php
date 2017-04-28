<?php
include('./wp-load.php');

$username = $_GET["username"];
$passwordhash = $_GET["passwordhash"];
$password = $_GET["password"];

$valid = false;

if(isset($passwordhash)) {
	$userdata = get_userdatabylogin($username);
	if($userdata && strtolower($userdata->user_pass) == strtolower($passwordhash))
		$valid = true;
} else {
	if(user_pass_ok($username, $password))
		$valid = true;
}

echo $valid ? "yes" : "no";

?>
