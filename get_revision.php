<?php
//load json revision data
if(!file_exists('data/revisions.js')){
	if(is_writable('data/revisions.js')){
		file_put_contents('data/revisions.js', '{}');
	}
}
$decoded = json_decode(file_get_contents('data/revisions.js'),true);
if(!$decoded) $decoded = array();
fclose($fh);

//get revisions stuff and fix it up a bit
$revisions = $decoded;
if(!$revisions) $revisions = array();
if(!array_key_exists('revisions', $revisions)) $revisions['revisions'] = array();
if(!array_key_exists('current', $revisions)) $revisions['current'] = 0;

//did we want a differnet revision for the current one?
$revision = $revisions['current'];
if(array_key_exists('revision', $_GET)){
	$revision = $_GET['revision'];
} else {
	$revision = $revisions['current'];
}

if(array_key_exists($revision, $revisions['revisions'])){
	$data = file_get_contents($revisions['revisions'][$revision]['file']);
	if($data) echo $data;
	else echo '{}';
} else {
	echo '{}';
}
