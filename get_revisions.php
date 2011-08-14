<?php
$data = file_get_contents('data/revisions.js');
if($data) echo $data;
else echo '{}';
