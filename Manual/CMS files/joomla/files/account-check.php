<?php
// Set flag that this is a parent file
define( '_JEXEC', 1 );

define('JPATH_BASE', dirname(__FILE__) );

define( 'DS', DIRECTORY_SEPARATOR );

require_once ( JPATH_BASE .DS.'includes'.DS.'defines.php' );
require_once ( JPATH_BASE .DS.'includes'.DS.'framework.php' );

JDEBUG ? $_PROFILER->mark( 'afterLoad' ) : null;

/**
 * CREATE THE APPLICATION
 *
 * NOTE :
 */
$mainframe =& JFactory::getApplication('site');

/**
 * INITIALISE THE APPLICATION
 *
 * NOTE :
 */
// set the language
$mainframe->initialise();

$username = $_GET["username"];
$passwordhash = $_GET["passwordhash"];
$password = $_GET["password"];

$user =& JFactory::getUser($username);

$valid = false;

if(isset($passwordhash)) {
	if($user && strtolower($user->password) == strtolower($passwordhash)) {
		$valid = true;
	}
} else {
	// see plugins/authentication/joomla.php onAuthenticate method
	jimport('joomla.user.helper');
	$parts	= explode( ':', $user->password );
	$crypt	= $parts[0];
	$salt	= @$parts[1];
	$testcrypt = JUserHelper::getCryptedPassword($password, $salt);

	if ($crypt == $testcrypt) {
		$valid = true;
	}
}

echo $valid ? "yes" : "no";

?>
