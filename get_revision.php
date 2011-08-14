<?php
//load json revision data
$fh = fopen('data/revisions.js','c+') or die('Failed to read revision data.');
$jsonInput = fgets($fh);
$decoded = json_decode($jsonInput,true);
if(!$decoded) $decoded = array();
fclose($fh);

//get revisions stuff and fix it up a bit
$revisions = $decoded;
if(!$revisions) $revisions = array();
if(!$revisions['revisions']) $revisions['revisions'] = array();
if(!$revisions['current']) $revisions['current'] = 0;

//did we want a differnet revision for the current one?
if($_GET['revision'] || $_GET['revision'] === '0'){
  $data = file_get_contents($revisions['revisions'][$_GET['revision']]['file']);
} else {
  $data = file_get_contents($revisions['revisions'][$revisions['current']]['file']);
}
if($data) echo ($data);
else echo ('{}');
