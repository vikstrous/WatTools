<?php
#############################
# TxtDox 0.1
#   by Vikstrous Valarous
# modified for html files
#############################

define('VERSION', 0.2);
define('EXT', '.json');

/*SETTINGS*/
$settings['title']="WatTools Edit Mode";
$settings['session name']="wattools";
$settings['password']="asdfer123";
$settings['save path']='data';

/**
 * remember to make .htaccess with:
 * AddType x-mapp-php5 .php
 * AddHandler x-mapp-php5 .php
 */
/*END SETTINGS*/

//ensure the save path exists
if($settings['save path'] && !is_dir($settings['save path']))
	mkdir($settings['save path']);

//session
session_start();

//magic quotes fix
if(get_magic_quotes_gpc()) {
	$in = array(&$_GET,&$_POST,&$_COOKIE);
	while(list($k,$v) = each($in)) {
		foreach($v as $key=>$val) {
			if(!is_array($val)) $in[$k][$key] = stripslashes($val);
			else $in[] =& $in[$k][$key];
		}
	}
	unset($in);
}
/*
//make a robots.txt if needed
if(!file_exists('robots.txt')){
	$fh = fopen('robots.txt', 'w');
	fwrite($fh,
'User-agent: *
Disallow: '+$settings['save path']
	);
	fclose($fh);
}

//make an .htaccess if needed
// EDIT: this can't run if it's not already php 5 :(
if(!file_exists('.htaccess')){
	$fh = fopen('.htaccess', 'w');
	fwrite($fh,
'AddType x-mapp-php5 .php
AddHandler x-mapp-php5 .php'
	);
	fclose($fh);
}*/

//make an .htaccess in the save path folder if needed (also makes the folder)
if(!file_exists($settings['save path'].'/'.'.htaccess')){
	$fh = fopen($settings['save path'].'/'.'.htaccess', 'w');
	fwrite($fh, 'deny from all');
	fclose($fh);
}

//make php.ini if needed
if(!file_exists('php.ini')){
	$fh = fopen('php.ini', 'w');
	fwrite($fh,
'session.name = "'.$settings['session name'].'"
session.cache_expire = "60"
magic_quotes_gpc = "Off"'
	);
	fclose($fh);
}

//login and logout actions
if($_POST['login']&&$_POST['pass']==$settings['password']){
	$_SESSION['logged']=true;
} else if($_POST['login']&&$_POST['pass']!=$settings['password']){
	echo "Wrong password.";
} else if($_POST['logout']){
	$_SESSION['logged']=false;
	session_destroy();
	if (isset($_COOKIE[session_name()])) {
		setcookie(session_name(), '', time()-42000, '/');
	}
}

//Do not continue without being logged in.
if(!$_SESSION['logged']){
	?>
<html>
<head>
<title><?php echo $settings['title'];?></title>
<link rel="stylesheet" href="style.css" type="text/css">
</head>
<body>
<p border="1"><?php echo $_SESSION['message']; $_SESSION['message']=false;?></p>
<form method="POST">
<input type="password" name="pass"/>
<input type="submit" name="login" value="Enter." /></form>
</body>
</html>
	<?php
	die();//IMPORTANT
}

//do stuff here
$doc = new doc($settings['save path']);

if($_GET['name']){
	$file_loaded = $doc->get_contents($_GET['name']);
} else {
	$file_loaded=false;
}

if($_GET['action']=='Delete'){
	$doc->delete($_POST['name']);
	$_SESSION['message'] = 'File deleted.';
	strip_refresh();
}

if($_POST){
	if($_POST['action']){
		switch ($_POST['action']){
			case 'Update':
				if($file_loaded){
					if($doc->set_contents($_POST['text']))
						$_SESSION['message'] = 'Update sucessful.';
				}
				else
					$_SESSION['error'] = 'No doc selected.';
				break;
			case 'New File':
				if($doc->create($_POST['name'])){
					$_SESSION['message'] = 'File created.';
					open_doc($_POST['name']);
				}
				break;
		}
	}
	refresh();
}

?>
<html>
<head>
<title><?php echo $settings['title'];?></title>
<link rel="stylesheet" href="style.css" type="text/css">
</head>
<body>
<table border="0" width="100%">
<tr border="0">
<td border="0"><h1><?php echo $settings['title'];?></h1></td>
<td align="right" border="0">
<form action="" method="POST" >
<input type="submit" name="logout" value="Logout"/>
</form>
</td>
</tr>
</table>

<?php echo $_SESSION['error']?"<p class=\"error\">".$_SESSION['error']."</p>":''; $_SESSION['error']=false;?>
<?php echo $_SESSION['message']?"<p class=\"message\">".$_SESSION['message']."</p>":''; $_SESSION['message']=false;?>


<?php if($file_loaded){ ?>
<h2>File: <?php echo $doc->get_name().EXT?> <a href="<?php echo curPageName();?>">(Close)</a></h2>
<?php if($_GET['edit']){?>
<form action="" method="POST">
<textarea cols="80" rows="20" name="text">
<?php echo $doc->export_html();?>
</textarea>
<br/>
<input type="submit" name="action" value="Update"/>
</form>
<?php } else {
echo $doc->export_html(true,true);
}?>
<form action="" method="GET" onSubmit="return confirmSubmit()">
<input type="hidden" name="name" value="<?php echo $doc->get_name()?>"/>
<input type="submit" name="action" value="Delete" onClick="return confirm('Are you sure you want to delete that file?')"/>
</form>
<?php }?>

<?php
if (!$file_loaded){?>
<h2>Choose a file or create one.</h2>
<?php
	if ($handle = opendir(($settings['save path']?$settings['save path']:'.'))) {?>
<form action="" method="GET">
<select name="name">
<?php
	while (false !== ($file = readdir($handle))) {
		if($file!='.' && $file!='..' && $file!='.htaccess'){
			if(substr($file, -strlen(EXT), strlen(EXT)) == EXT){
				$name=substr($file, 0, -strlen(EXT));
				echo '<option value="'.$name.'">'.$name.'</option>';
			}
		}
	}?>
</select>
<input type="submit" value="Read"/>
<input type="submit" name="edit" value="Edit"/>
<input type="submit" name="action" value="Delete" onClick="return confirm('Are you sure you want to delete that file?')"/>
</form>
<?php
	closedir($handle);
	}?>
<form action="" method="POST">
<input type="text" name="name"/>
<input type="submit" name="action" value="New File"/>
</form>
<?php
}?>


</body>
</html>

<?php
//the doc class
class doc{
	private $contents;
	private $name;
	private $folder;
	
	function __construct($folder){
		$this->folder=$folder;
	}
	
	public function create($name){
		if(preg_match('/[a-zA-Z0-9\-\. ]+/', $name)){
			if(!file_exists($this->make_filename($name))){
				$fh = fopen($this->make_filename($name), 'w');
				if($fh){
					fclose($fh);
					$this->name=$name;
					$this->contents='';
					return true;
				} else
					$_SESSION['message']='Doc already exists.';
			}
			return false;
		} else {
			$_SESSION['error']='Invalid doc name.';
			return false;
		}
	}
	
	public function get_contents($new_name){
		if(preg_match('/[a-zA-Z0-9\-\. ]+/', $new_name)){
			$this->name = $new_name;
			return $this->load();
		} else {
			$_SESSION['error']='Invalid doc name.';
			return false;
		}
	}
	public function set_contents($new){
		$this->contents = $new;
		return $this->save();
	}
	public function delete(){
		unlink($this->make_filename($this->name));
	}
	
	public function get_name(){
		return $this->name;
	}
	
	public function export_html($pre=false,$newlines=false){
		$out = htmlentities($this->contents);
		if($newlines){
			$out=str_replace("\r\n",'<br/>',$out);
		}
		if($pre)
			$out = '<pre>'.$out.'</pre>';
		return $out;
	}
	
	
	
	private function load(){
		if(file_exists($this->make_filename($this->name))){
			$fh = fopen($this->make_filename($this->name), 'r');
			$buff='';
			while(!feof($fh)) {
				$buff .= fread($fh, 1024*8);
			}
			fclose($fh);
			$this->contents = $buff;
			return true;
		} else return false;
	}
	
	private function save(){
		if(file_exists($this->make_filename($this->name))){
			$fh = fopen($this->make_filename($this->name), 'w');
			$return = fwrite($fh, $this->contents);
			fclose($fh);
			return $return;
		} else return false;
	}
	
	private function make_filename($name){
		if($this->folder)
			return $this->folder.'/'.$name.EXT;
		else
			return $name.EXT;
	}
	
}

//useful functions
function refresh(){
	//refresh the page
	header('Cache-Control: no-cache');
	header('Pragma: no-cache');
	@header('location: '.curPageURL());
	die();//important so it doesn't run the rest of the code
}
function strip_refresh(){
	//refresh the page without the GET parameters
	header('Cache-Control: no-cache');
	header('Pragma: no-cache');
	@header('location: '.curPageName());
	die();//important so it doesn't run the rest of the code
}
function open_doc($doc_name){
	//refresh the page
	header('Cache-Control: no-cache');
	header('Pragma: no-cache');
	header('location: '.curPageURL().'?name='.$doc_name.'&edit=Edit');
	die();//important so it doesn't run the rest of the code
}
function curPageURL() {
	$pageURL = 'http';
	if ($_SERVER["HTTPS"] == "on") {$pageURL .= "s";}
	$pageURL .= "://";
	if ($_SERVER["SERVER_PORT"] != "80") {
		$pageURL .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"].$_SERVER["REQUEST_URI"];
	} else {
		$pageURL .= $_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"];
	}
	return $pageURL;
}
function curPageName() {
	$pageURL = 'http';
	if ($_SERVER["HTTPS"] == "on") {$pageURL .= "s";}
	$pageURL .= "://";
	if ($_SERVER["SERVER_PORT"] != "80") {
		$pageURL .= $_SERVER["SERVER_NAME"].":".$_SERVER["SERVER_PORT"].$_SERVER["SCRIPT_NAME"];
	} else {
		$pageURL .= $_SERVER["SERVER_NAME"].$_SERVER["SCRIPT_NAME"];
	}
	return $pageURL;
}
?>
