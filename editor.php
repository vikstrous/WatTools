<?php
require('pre.php');?>
  <div id="content">
    <a id="editor" class="faux-button">Editor</a>
    <a id="login" class="faux-button hidden">Log in</a>
    <a id="logout" class="faux-button hidden">Log out</a><br/>
    <a id="revisions" class="faux-button hidden">Revisions</a><br/>
    <a id="refresh" class="faux-button hidden">Refresh</a>
    <a id="reload" class="faux-button hidden">Reload</a>
    <div id="field-editor">
    </div>
    <a id="new-field" class="faux-button hidden">New Field</a>
    <div id="item-editor">
    </div>
    <a id="new-item" class="faux-button hidden">New Item</a><br/>
    <a id="submit-data" class="faux-button hidden">Submit New Revision</a>
  </div>

  <!-- we are preloading some templates -->
  <!-- TODO:remove the need for purpose and field properties? -->
  <script type="text/template" id="input-tpl">
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
    
    {{^checkbox}}
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
    {{/checkbox}}
    </div>
  </script>

  <script type="text/template" id="radio-tpl">
    <div>
    {{#label}}
      <label>
    {{/label}}
      <input type="radio" name="{{name}}" {{#checked}}checked="checked"{{/checked}} value="{{value}}"/>
    {{#label}}
      {{label}}</label>
    {{/label}}
    </div>
  </script>

  <script type="text/template" id="entry-field-tpl">
    <div class="{{class}} field">
    {{#label}}
      <div class="label">
        {{label}} 
      </div>
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
  </script>
  
  <script type="text/javascript">
    var preload_current_data = <?php require 'get_revision.php';?>;
  </script>
  <script type="text/javascript">
    var preload_revisions = <?php require 'get_revisions.php';?>;
  </script>
  
  <script type="text/javascript" src="js/editor.js"></script>
  
  <?php if($_SESSION['loggedin']){?>
  <script type="text/javascript">
  watedit.admin = true;
  watedit.redraw();
  </script>
  <?php }?>
  
<?php require('post.php');?>
