<?php
//TODO: requre login

//get revision selection
$fh = fopen('php://input','r') or die('Failed to read POST data.');
$revision = fgets($fh);
fclose($fh);

if(!is_numeric($revision)) die('Non numeric input.');

//load json revision data
$fh = fopen('revisions.js','r') or die('Failed to read revision data.');
$jsonInput = fgets($fh);
$decoded = json_decode($jsonInput,true);
fclose($fh);

//get revisions stuff and fix it up a bit
$revisions = $decoded;
if(!$revisions) $revisions = array();
if(!$revisions['revisions']) $revisions['revisions'] = array();
if(!$revisions['current']) $revisions['current'] = 0;

//sanity check
if($revision > count($revisions['revisions'])) die('Selected revision out of range.');

//update current revision
$revisions['current'] = $revision;

//save new revisions list
$fh = fopen('revisions.js', 'w') or die('Failed to save revision data.');
fwrite($fh, json_encode($revisions));
fclose($fh);
die('1');
