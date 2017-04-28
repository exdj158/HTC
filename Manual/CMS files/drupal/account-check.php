<?php
// $Id: xmlrpc.php,v 1.15 2005/12/10 19:26:47 dries Exp $

include_once './includes/bootstrap.inc';
drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);
include_once './includes/xmlrpc.inc';
include_once './includes/xmlrpcs.inc';

/* see user.module, function user_load($array = array())
Usage:
http://..../account-check.php?username=<user name>&passwordhash=<md5 hash of password>
The page returned contains a string either "yes" or "no".
*/
$username = $_GET["username"];
$passwordhash = $_GET["passwordhash"];
$status = 1;

$query = array();
$params = array();
$query[]= "LOWER(name) = LOWER('%s')";
$params[] = $username;
$query[] = "pass = '%s'";
$params[] = $passwordhash;
$query[] = "status = %d";
$params[] = $status;
  $result = db_query('SELECT * FROM {users} u WHERE '. implode(' AND ', $query), $params);
  if ($user = db_fetch_object($result)) {
  	// user OK
  	echo "yes";
  } else {
  	// login failed
  	echo "no";
  }
  