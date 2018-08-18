<?php

/**
 * jQuery.loadMore
 * Version: 1.0.2
 * Repo: https://github.com/WahaWaher/loadmore-js
 * Author: Sergey Kravchenko
 * Contacts: wahawaher@gmail.com
 * License: MIT
 */

# INIT
if( isset($_POST['target']) && $_POST['target'] == 'init' ) {

	sleep(0);
	$data = $_POST['data'];
	$data['path'] = $_SERVER['DOCUMENT_ROOT'] . '/' . $data['path'];

	// Get files array
	$dir = opendir($data['path']);
	$i = 0;
	while( $file = readdir($dir) ) {

		if( $file == '.' || $file == '..' || is_dir($data['path'] . $file) ) continue;
		if( isset($data['ignore']) && in_array($file, $data['ignore'] ) ) continue;

		$format = getExtension($file);
		$status = 'onserver';
		$content = '';

		// If "get_first_posts"
		if( isset($_POST['get_first_posts']) && $i < $_POST['get_first_posts'] ) {
			
			if( $format == 'php' || $format == 'html' || $format == 'txt' ) {
				ob_start();
				include $data['path'] . $file;
				$content = ob_get_clean();
			}

			$status = 'received';

		}

    	$result['posts'][$file] = [
    		'id'        => $i,
    		'name'      => $file,
    		'format'    => $format,
    		'content'   => $content,
	    	'status'    => $status,
    	];

    	$i++;
	}

	$result['all'] = $i;
	
	// Send result
	echo json_encode($result, JSON_UNESCAPED_UNICODE);

}

# GET POSTS CONTENT
if( isset($_POST['target']) && $_POST['target'] == 'get_posts_content' ) {
	sleep(0);
	$data = $_POST['data'];
	$data['path'] = $_SERVER['DOCUMENT_ROOT'] . '/' . $data['path'];

	// Get files array
	$dir = opendir($data['path']);
	$i = 0;
	while( $file = readdir($dir) ) {

		if( $file == '.' || $file == '..' || is_dir($data['path'] . $file) ) continue;
		if( isset($data['ignore']) && in_array($file, $data['ignore'] ) ) continue;
		if( $data['posts'][$file]['name'] != $file ) continue;

		$format = getExtension($file);
		$status = 'received';
		$content = '';

		if( $format == 'php' || $format == 'html' || $format == 'txt' ) {
			ob_start();
			include $data['path'] . $file;
			$content = ob_get_clean();
		}

		$data['posts'][$file]['id'] = (int)$data['posts'][$file]['id'];
		$data['posts'][$file]['content'] = $content;
		$data['posts'][$file]['status'] = $status;

		$i++;
	}

	$result = $data;

	echo json_encode($result, JSON_UNESCAPED_UNICODE);
}

function getExtension($filename) {
	$path_info = pathinfo($filename);
	return $path_info['extension'];
}

 ?>