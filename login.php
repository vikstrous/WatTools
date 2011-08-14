<?php
session_start();
if($_POST['password'] == 'asdfdfdf'){
  $_SESSION["loggedin"] = true;
  die('1');
} else {
  die('Wrong password.');
}
