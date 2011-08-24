<?php
require_once '_soul.php';

// restrict admin actions
$admin_actions = array('set_current_revision', 'logout');
if(in_array($_GET['action'], $admin_actions)) require_login();

// parse POST data
$fh = fopen('php://input','r') or die('Failed to read POST data.');
$postdata = fgets($fh);
fclose($fh);

// require POST data for these actions
$post_actions = array('new_revisions', 'set_current_revision', 'login');
if(in_array($_GET['action'], $post_actions) && empty($postdata)) die('No data submitted.');


switch ($_GET['action']){
  
  case 'generate_rss':

    // get all the revisions data
    $revisions = get_revisions_data();
    // rebuid the rss
    build_rss($revisions);
    die('Succes.');
    
    break;
    
  case 'new_revision':
  
    // parse POST data
    $postdata = json_decode($postdata, true);
    $meta = $postdata['meta'];//info about new revision
    $data = $postdata['data'];//data to store
    if(!$meta) die('No data.');
    if(!$data) die('No meta info.');
    
    // protect us from evil urls
    die_on_evil_url($data['entries']);
    
    // make filename for new revision
    $time = time();
    $meta['time'] = $time;
    $meta['file'] = 'data/'.md5(json_encode($meta)).$time.'.js';
    
    // get all the revisions data, add new revision and save it again
    $revisions = get_revisions_data();
    array_push($revisions['revisions'], $meta);
    save_revisions_data($revisions);
    
    // save the new revision
    save_new_revision($meta['file'], $data);
    
    // rebuid the rss
    build_rss($revisions);
    
    // die with the id of the new revision
    die(''.(count($revisions['revisions'])-1));
    
    break;
  
  case 'set_current_revision':
    
    // take input as a number
    $revision = $postdata;
    if(!is_numeric($revision)) die('Non numeric input.');
    
    // get revisions data and check if the request makes sense
    $revisions = get_revisions_data();
    if($revision > count($revisions['revisions']) || $revision < 0) die('Selected revision does not exist.');
    
    // update current revision
    $revisions['current'] = $revision;
    
    // save new revisions list
    save_revisions_data($revisions);
    die('1');
    
    break;
  
  case 'login':

    if($_POST['password'] != PASSWORD) die('Wrong password.');
    
    log_in();
    die('1');
    
    break;
    
  case 'logout':
  
    log_out();
    break;
    
  default:
  
    die('Unknown action.');
    
    break;
}
