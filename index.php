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
  <link rel="stylesheet" type="text/css" href="css/bootstrap.min.css" />
  <link rel="stylesheet" type="text/css" href="css/bootstrap-responsive.min.css" />
  <link rel="stylesheet" type="text/css" href="css/style.css" />
  <link href='http://fonts.googleapis.com/css?family=Ubuntu+Mono' rel='stylesheet' type='text/css'>
  <script type="text/javascript" src="js/lib/jquery.min.js"></script>
  <script type="text/javascript" src="js/lib/jquery-ui-1.10.0.custom.min.js"></script>
  <script type="text/javascript" src="js/lib/bootstrap.min.js"></script>
  <script type="text/javascript" src="js/lib/underscore-min.js"></script>
  <script type="text/javascript" src="js/lib/backbone-min.js"></script>
  <script type="text/javascript" src="js/lib/mustache.js"></script>
  <script type="text/javascript" src="js/mustache_helper.js"></script>
  <script type="text/javascript" src="js/header.js"></script>
  <script type="text/javascript" src="js/model.js"></script>
  <script type="text/javascript" src="js/field_editor.js"></script>
  <script type="text/javascript" src="js/entry_editor.js"></script>
  <script type="text/javascript" src="js/watedit.js"></script>

  <script type="text/javascript">
    var watEdit;
    $(function() {
      watEdit = new WatEdit();
    });
  </script>

  <?php if(isset($_SESSION['loggedin'])){?>
    <script type="text/javascript">
      $(function() {
        watEdit.model.set('admin', true);
      });
    </script>
  <?php }?>

  <!-- I HATE IE -->
  <!--[if lte IE 7.0]>
  <style type="text/css">
  .grid li {display:inline;}
  </style>
  <![endif]-->
</head>

<body>
  <noscript>
    <p class="text-error">Your browser doesn't support JavaScript or you have disabled JavaScript. Sorry, but this app will not work without JavaScript.</p>
  </noscript>

  <div class="header">
    <div class='title'><a href="/">WatTools</a></div>
    <div class='header-description'>A collection of tools for Waterloo students, by students.</div>
    <div class='header-description'>This is a wiki. Submit your own revisions of the list!</div>
    <div class='header-description'>Fight the power and build your own tools!</div>
  </div>
  <div class="social">
    <div class="social_item">
      <iframe src="http://www.facebook.com/plugins/like.php?app_id=155945941150696&amp;href=wattools.com&amp;send=false&amp;layout=box_count&amp;width=55&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font&amp;height=90" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:55px; height:90px;" allowTransparency="true"></iframe>
    </div>
    <div class="social_item">
      <div class="g-plusone" data-size="tall" data-href="http://wattools.com"></div>
    </div>
    <div class="social_item">
      <a href="http://twitter.com/share" class="twitter-share-button" data-url="http://wattools.com" data-text="I just found some useful tools for #uwaterloo students" data-count="vertical" data-via="wattools">Tweet</a>
    </div>
  </div>
  <div class="clearfix"></div>

  <p id="global-thanks" class="text-success"></p>
  <div class="app"></div>

  <div>Greetings traveler, <br/>Thank you for your interest in this site. This site is built by <a href="http://viktorstanchev.com">Viktor Stanchev</a>. All the source code is available on <a href="http://github.com/vikstrous/WatTools">github.com</a></div>
  <div><noscript><p class="text-error">Please enable javascript to view the email address. This is done to avoid spam.</p></noscript>
  Please send any questions or requests to <script>document.write('wattools'+String.fromCharCode(64)+'gmail.com');</script>.
  </div>

  <div id="dialog" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-header">
      <button type="button" class="close" data-dismiss="modal" aria-hidden="true"><i class="icon-remove"></i></button>
      <h3 class="dialog-title">Title</h3>
    </div>
    <div class="modal-body">
    </div>
    <div class="modal-footer">
      <button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>
      <button class="btn btn-primary">Submit</button>
    </div>
  </div>

  <!-- we are preloading some templates and we should be able to get the rest through ajax (currently we preload all) -->
  <script type="text/template" id="app-tpl">
    <p><button class="editor-btn btn"><i class="icon-pencil"></i><span class="btn-text">Edit the list!</span></button>
    {{#edit_mode}}
      {{^loggedin}}<button class="right login-btn btn"><i class="icon-lock"></i><span class="btn-text">Log in</span></button>{{/loggedin}}
      {{#loggedin}}<button class="right logout-btn btn"><i class="icon-off"></i><span class="btn-text">Log out</span></button>{{/loggedin}}
    {{/edit_mode}}
    </p>
    {{#edit_mode}}
      <p>
        <button class="right revisions-btn btn"><i class="icon-list"></i><span class="btn-text">Revisions</span></button>
        <button class="submit-data-btn btn"><i class="icon-upload"></i><span class="btn-text">Submit New Revision</span></button>
      </p>
      <p class="new-item-btn-container">
        <button class="new-item-btn btn"><i class="icon-file"></i><span class="btn-text">New Link</span></button>
      </p>
    {{/edit_mode}}
    <div id="item-editor"></div>
    {{#edit_mode}}
      <p><button class="new-field-btn btn"><i class="icon-file"></i><span class="btn-text">New Field</span></button></p>
      <div id="field-editor"></div>
    {{/edit_mode}}
  </script>

  <script type="text/template" id="form-tpl">
    <form>
    <p class="form-error text-error"></p>
    {{#inputs}}
      <div>
        {{#dropdown}}
          <select class="input-block-level" name="{{name}}">
        {{/dropdown}}
        {{#dropdown_data}}
          <option {{#selected}}selected="selected"{{/selected}} value="{{value}}" data-time="{{time}}" data-details="{{description}}">{{label}}</option>
        {{/dropdown_data}}
        {{#dropdown}}
          </select>
        {{/dropdown}}

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

        {{^dropdown}}
        {{^checkbox}}
        {{^radio}}
          {{#label}}
            <label>{{label}}<br/>
          {{/label}}

            {{#input}}
                <input class="input-block-level" type="text" name="{{name}}" value="{{val}}" purpose="{{purpose}}" field="{{field}}" />
            {{/input}}

            {{#password}}
                <input class="input-block-level" type="password" name="{{name}}" value="{{val}}" purpose="{{purpose}}" field="{{field}}" />
            {{/password}}

            {{#multiline}}
              <textarea class="input-block-level" name="{{name}}" purpose="{{purpose}}" field="{{field}}" >{{val}}</textarea>
            {{/multiline}}

          {{#label}}
            </label>
          {{/label}}
        {{/radio}}
        {{/checkbox}}
        {{/dropdown}}

        {{#description}}
          <div class="help-block {{class}}">{{description}}</div>
        {{/description}}
      </div>
    {{/inputs}}
    <input type="submit" style="display:none"/>
    </form>
  </script>

  <script type="text/template" id="fields-tpl">
    <p class="big">Fields</p>
    <ul id="fields" class="grid">
    {{#fields}}
      <li class="field" id="{{id}}">
        <div class="name">
          {{title}}
        </div>
        {{#properties}}
          <div>
          {{property}}: {{value}}
          </div>
        {{/properties}}
        {{>buttons}}
      </li>
    {{/fields}}
    </ul>
  </script>

  <script type="text/template" id="entries-tpl">
    <ul id="items" class="grid">
    {{#entries}}
      <li class="item" id="{{id}}">
        {{#fields}}
          <div class="{{class}} field-value">
          {{#label}}
              {{label}}
          {{/label}}
          {{#link}}
            <a href="{{link}}">
          {{/link}}
              {{text}}
          {{#link}}
            </a>
          {{/link}}
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
    <p>
    {{#buttons}}
      <button class="btn {{class}}" type="{{type}}" parameter="{{parameter}}">
        <i class="icon-{{icon}}"></i>{{label}}
      </button>
    {{/buttons}}
    </p>
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
