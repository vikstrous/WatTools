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
  <link rel="alternate" type="application/rss+xml" href="/data/rss.xml" title="Waterloo Tools" />
  <link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/3.3.0/build/cssreset/reset-min.css">
  <link rel="stylesheet" type="text/css" href="css/smoothness/jquery-ui-1.8.14.custom.css" />
  <link rel="stylesheet" type="text/css" href="css/jquery.jgrowl.css" />
  <link rel="stylesheet" type="text/css" href="css/style.css" />
  <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
  <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.15/jquery-ui.min.js"></script>
  <script type="text/javascript" src="js/lib/jquery.ui.touch.js"></script>
  <script type="text/javascript" src="js/lib/conveyor.js"></script>
  <script type="text/javascript" src="js/lib/mustache.js"></script>
  <script type="text/javascript" src="js/lib/jquery.jgrowl_minimized.js"></script>
  <script type="text/javascript" src="js/mustache_helper.js"></script>
  <script type="text/javascript" src="js/header.js"></script>
  <script type="text/javascript" src="js/watedit.js"></script>
  <script type="text/javascript" src="js/entry_manager.js"></script>
  <script type="text/javascript" src="js/field_manager.js"></script>

  <?php if(isset($_SESSION['loggedin'])){?>
    <script type="text/javascript">
      watedit.admin = true;
    </script>
  <?php }?>

  <script type="text/javascript">
    $(document).ready(function () {
      watedit.init();
    });
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
    <noscript><div class="noscript">Please enable javascript to use WatTools.</div></noscript>
    <div class='description'>A collection of tools for University of Waterloo students (made by University of Waterloo students!)</div>
    <div class='description'>This is a wiki!</div>
    <div class='description'>Submit your own revisions of the list! Click the Editor button!</div>
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

  <div id="content">

    <div id="app"></div>

    <div>Greetings traveler, <br/>Thank you for your interest in this site. This site is built by <a href="http://viktorstanchev.com">Viktor Stanchev</a>. All the source code is available on <a href="http://github.com/vikstrous/WatTools">github.com</a></div>
    <div><noscript><div class="noscript">Please enable javascript to view the email address. This is done to avoid spam.</div></noscript>
    Please send any questions or requests to <script>document.write('wattools'+String.fromCharCode(64)+'gmail.com');</script>.
    </div>
  </div>

  <noscript>
    Your browser doesn't support JavaScript or you have disabled JavaScript. Sorry, but this app will not work without JavaScript.
  </noscript>

  <!-- we are preloading some templates and we should be able to get the rest through ajax (currently we preload all) -->
  <script type="text/template" id="app-tpl">
    <a id="editor" class="faux-button">Editor</a>
    {{#edit_mode}}
      <a id="revisions" class="faux-button">Revisions</a>
      {{^loggedin}}<a id="login" class="faux-button">Log in</a>{{/loggedin}}
      {{#loggedin}}<a id="logout" class="faux-button">Log out</a>{{/loggedin}}
      <br/>
      <a id="submit-data" class="faux-button">Submit as New Revision</a>
      <br/>
      <a id="new-item" class="faux-button">New Item</a>
    {{/edit_mode}}
    <div id="item-editor">
    </div>
    {{#edit_mode}}
      <div id="field-editor">
      </div>
      <a id="new-field" class="faux-button">New Field</a>
    {{/edit_mode}}
  </script>

  <script type="text/template" id="form-tpl">
    <form>
    {{#inputs}}
      <div>
      {{#checkbox}}
        {{#label}}
          <label>
        {{/label}}
        <input type="checkbox" name="{{name}}" purpose="{{purpose}}" field="{{field}}" {{#checked}}checked="checked"{{/checked}} />
        {{#label}}
          {{label}}</label>
        {{/label}}
      {{/checkbox}}

      {{#radio}}
        <div>
          <div class="radio">
            {{#label}}
              <label>
            {{/label}}
              <input type="radio" name="{{name}}" {{#checked}}checked="checked"{{/checked}} value="{{value}}"/>
            {{#label}}
              {{label}}</label>
            {{/label}}
          </div>
        </div>
      {{/radio}}

      {{^checkbox}}
      {{^radio}}
        {{#label}}
          <label>{{label}}<br/>
        {{/label}}

          {{^multiline}}
              <input {{#password}}type="password"{{/password}} {{^password}}type="text"{{/password}}
                name="{{name}}" value="{{val}}" purpose="{{purpose}}" field="{{field}}" />
          {{/multiline}}

          {{#multiline}}
            <textarea name="{{name}}" purpose="{{purpose}}" field="{{field}}" >{{val}}</textarea>
          {{/multiline}}

        {{#label}}
          </label>
        {{/label}}
      {{/radio}}
      {{/checkbox}}

      {{#description}}
        <div class="description">{{description}}</div>
      {{/description}}
      </div>
    {{/inputs}}
    </form>
  </script>

  <script type="text/template" id="fields-tpl">
    <div class="big">Fields</div>
    <ul id="fields" class="grid">
    {{#fields}}
      <li class="field" id="{{id}}">
        <div class="name">
          {{title}}
        </div>
        {{#properties}}
          <div>
          {{property}} : {{value}}
          </div>
        {{/properties}}
        {{>buttons}}
      </li>
    {{/fields}}
    </ul>
  </script>

  <script type="text/template" id="entries-tpl">
    {{#edit_mode}}
    <div class="big">Entires</div>
    {{/edit_mode}}
    <ul id="items" class="grid">
    {{#entries}}
      <li class="item" id="{{id}}">
        {{#fields}}
          <div class="{{class}} field">
          {{#label}}
            <div class="label">
              {{label}}
          {{/label}}
              {{#link}}
              <a href="{{link}}">
                {{/link}}
                  {{text}}
                {{#link}}
              </a>
              {{/link}}
          {{#label}}
            </div>
          {{/label}}
          </div>
        {{/fields}}
        {{#edit_mode}}
        {{>buttons}}
        {{/edit_mode}}
      </li>
    {{/entries}}
    </ul>
  </script>

  <script type="text/template" id="buttons-tpl">
    {{#buttons}}
      <a class="faux-button" type="{{type}}" parameter="{{parameter}}">
        {{label}}
      </a>
    {{/buttons}}
  </script>

  <script type="text/javascript">
    var preload_current_data = <?php require 'get_revision.php';?>;
  </script>
  <script type="text/javascript">
    var preload_revisions = <?php require 'get_revisions.php';?>;
  </script>


  <script type="text/javascript">

    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-10239938-4']);
    _gaq.push(['_trackPageview']);

    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();

    (function() {
      var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
      po.src = 'https://apis.google.com/js/plusone.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
    })();
  </script>
  <script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>

  </body>
  </html>
