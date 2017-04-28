<?php
/*
Plugin Name: Http commander
Plugin URI: http://www.element-it.com/asp-net-explorer-browser/online-share/web-file-manager.aspx
Description: Shows a link to Http commander. Following this link automatically logs in the user to Http commander.
Version: 1.0
Author: Element-It team
Author URI: http://www.element-it.com/
License: GPL2
*/

function htcom_link()
{
	$url = "http://localhost/HttpCommander/Default.aspx";
	global $user_ID;
	global $current_user;
	get_currentuserinfo();

	if ($user_ID) {
		$url .= "?username=" . urlencode($current_user->user_login);
		$url .= "&passwordhash=" . urlencode($current_user->user_pass);
	}
	$link_text = "Http commander on localhost";
  echo "<a href=\"{$url}\">{$link_text}</a>";
}
 
function widget_htcom_link($args) {
  extract($args);
  echo $before_widget;
  echo $before_title . "Http commander" . $after_title;
  htcom_link();
  echo $after_widget;
}
 
function htcom_link_init()
{
  register_sidebar_widget(__('Http commander'), 'widget_htcom_link');
}

add_action("plugins_loaded", "htcom_link_init");
?>
