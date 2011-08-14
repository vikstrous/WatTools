<?php
//load json post data
$fh = fopen('php://input','r') or die('Failed to read POST data.');
$jsonInput = fgets($fh);
$decoded = json_decode($jsonInput,true);
fclose($fh);

//parse input
if(!$decoded) die('No POST data.');
$meta = $decoded['meta'];//info about new revision
$data = $decoded['data'];//data to store
if(!$decoded['data']) die('No data.');
if(!$decoded['meta']) die('No meta info.');

//make sure our data doesn't contain any evil urls
foreach ($data['entries'] as $entry){
  foreach ($entry as $field){
    if(!is_array($field)) continue;
    if(!$field['url']) continue;
    if(substr($field['url'], 0, 4) == 'http') continue;
    die('Bad url type detected.');
  }
}

//load json revision data
$fh = fopen('data/revisions.js','r') or die('Failed to read revision data.');
$jsonInput = fgets($fh);
$decoded = json_decode($jsonInput,true);
fclose($fh);

//get revisions stuff and fix it up a bit
$revisions = $decoded;
if(!$revisions) $revisions = array();
if(!$revisions['revisions']) $revisions['revisions'] = array();
if(!$revisions['current']) $revisions['current'] = 0;

//make filename for new revision
$meta['time'] = time();
$meta['file'] = 'data/'.md5(json_encode($meta)).time().'.js';

//add new revision
array_push($revisions['revisions'], $meta);

//save new revisions list
$fh = fopen('data/revisions.js', 'w') or die('Failed to save revision data.');
fwrite($fh, json_encode($revisions));
fclose($fh);

//save new revisions data
$fh = fopen($meta['file'], 'w') or die('Failed to save data.');
fwrite($fh, json_encode($data));
fclose($fh);
die(''.(count($revisions['revisions'])-1));
