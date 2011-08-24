<?php
require('pre.php');?>
  <div id="content">
    <div id="app"></div>
  </div>

  <!-- we are preloading some templates and we should be able to get the rest through ajax (currently we preload all) -->
  <script type="text/template" id="app-tpl">
    <a id="editor" class="faux-button">Editor</a>
    {{#edit_mode}}
      <a id="submit-data" class="faux-button">Submit New Revision</a>
      <a id="revisions" class="faux-button">Revisions</a>
      <a id="refresh" class="faux-button">Refresh</a>
      <a id="reload" class="faux-button">Reload</a>
      {{^loggedin}}<a id="login" class="faux-button">Log in</a>{{/loggedin}}
      {{#loggedin}}<a id="logout" class="faux-button">Log out</a>{{/loggedin}}
      <div id="field-editor">
      </div>
      <a id="new-field" class="faux-button">New Field</a>
    {{/edit_mode}}
    <div id="item-editor">
    </div>
    {{#edit_mode}}
      <a id="new-item" class="faux-button">New Item</a>
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

  <script type="text/template" id="button-tpl">
    <a class="faux-button" type="{{type}}" parameter="{{parameter}}">
      {{label}}
    </a>
  </script>

  <script type="text/template" id="radio-tpl">
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
    {{#description}}
      <div class="description">{{description}}</div>
    {{/description}}
    </div>
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

<?php require('post.php');?>
