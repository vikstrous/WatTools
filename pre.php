<?php
session_start();
?><!DOCTYPE HTML>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta property="og:title" content="Waterloo Tools" />
<meta property="og:type" content="website" />
<meta property="og:url" content="http://wattools.com" />
<meta property="og:image" content="" />
<meta property="og:site_name" content="Waterloo Tools" />
<meta property="fb:admins" content="100000486272805" />
<title>Waterloo Tools - A collection of tools for University of Waterloo students</title>
<link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/3.3.0/build/cssreset/reset-min.css">
<link rel="stylesheet" type="text/css" href="css/smoothness/jquery-ui-1.8.14.custom.css" />
<link rel="stylesheet" type="text/css" href="css/jquery.jgrowl.css" />
<link rel="stylesheet" type="text/css" href="css/style.css" />
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.15/jquery-ui.min.js"></script>
<script type="text/javascript" src="js/lib/jquery.ui.touch.js"></script>
<script type="text/javascript" src="js/lib/mustache.js"></script>
<script type="text/javascript" src="js/lib/jquery.jgrowl_minimized.js"></script>
<script type="text/javascript">
$.mustache = function(template, view, partials) {
  return Mustache.to_html($('#'+template+'-tpl').html(), view, partials);
};
</script>
<!-- I HATE IE -->
<!--[if lte IE 7.0]>
<style type="text/css">
.grid li {display:inline;}
</style>
<![endif]--> 
</head>

<body>
  <div id="header">
    <div class='title'><a href="/">Waterloo Tools</a></div>
    <div class='description'>A collection of tools for University of Waterloo students (made by University of Waterloo students!)</div>
    <div class='description'>WatTools is now being crowdsourced. Submit your own revisions of the list! Click the Editor button!</div>
    <div id="social">
      <div class="social_item">
        <iframe src="http://www.facebook.com/plugins/like.php?app_id=155945941150696&amp;href=wattools.com&amp;send=false&amp;layout=box_count&amp;width=55&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font&amp;height=90" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:55px; height:90px;" allowTransparency="true"></iframe>
      </div>
      <div class="social_item">
        <g:plusone size="tall" href="http://wattools.com"></g:plusone>
      </div>
      <div class="social_item">
        <a href="http://twitter.com/share" class="twitter-share-button" data-url="http://wattools.com" data-text="I just found some useful tools for #uwaterloo students" data-count="vertical" data-via="wattools">Tweet</a>
      </div>
      <div class="clearfix"></div>
    </div>
  </div>
