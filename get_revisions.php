<?php
if(!file_exists('data/revisions.js')){
	if(is_writable('data/revisions.js')){
		file_put_contents('data/revisions.js', '{}');
	}
}
$data = file_get_contents('data/revisions.js');
echo $data;
