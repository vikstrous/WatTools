/**
 * TODO: faster templating - convert more things to use mustache?
 * TODO: enter button submit dialogs
 * TODO: make revision deletion possible
 * TODO: reuse dialogs
 */

/**
 * Debug tools - built only if necessary and possible
 */
var debug = {
  on: false,
  time: function(label) {
    if(debug.on && window.console !== undefined && console.time !== undefined){
      debug.time = function (label){
        console.time(label);
      };
      debug.time(label);
    } else {
      debug.time = function(){};
    }
  },
  timeEnd: function(label) {
    if(debug.on && window.console !== undefined && console.timeEnd !== undefined){
      debug.timeEnd = function (label){
        console.timeEnd(label);
      };
      debug.timeEnd(label);
    } else {
      debug.timeEnd = function(){};
    }
  }
}

/**
 * Loads json data on demand, supports preloading
 * 
 * @param {string} preload_var variable name where preloaded data is
 * @param {string} url to get the data from if it's not preloaded
 * @param {function} success function to call when done
 * @param {function} error function to call when done
 * @param {boolean} fresh demand fresh data
 * @param {object} params to send to the server
 */
function loader(preload_var, url, success, error, fresh, params){
  if(window[preload_var] !== undefined && !fresh){
    success(window[preload_var]);
  } else {
    $.ajax({
      url: url,
      type: 'GET',
      data: params,
      success: function(data, textStatus, jqXHR){
        window[preload_var] = data;
        success(data, textStatus, jqXHR);
      },
      error: function(data, textStatus, errorThrown){
        error(data, textStatus, errorThrown);
      },
      dataType: 'json',
      cache: false
    });
  }
}

/**
 * Show a dialog with the submit and cancel buttons
 * 
 * @param {string} html
 * @param {string} title
 * @param {function} submit
 * @param {string} submit_label optional
 */
function submit_cancel_dialog(html, title, submit, submit_label){
  //parameter parsing
  submit_label = submit_label || 'Submit';
  
  //vars
  var buttons;
  
  //setup
  buttons = {};
  buttons[submit_label] = submit;
  buttons.Cancel = function () {
    $(this).dialog("close");
  };
  
  //open the dialog
  $(html).dialog({
    title: title,
    buttons: buttons,
    modal:true
  });
}

/**
 * The main application namespaces
 */
var watedit = {}, field_manager = {}, entry_manager = {};

/**
 * Some default state information
 */
watedit.edit_mode = false;
watedit.admin = false;
watedit.LinkData = {};
watedit.RevisionData = {};

/**
 * Sets the main data and draws the app
 * 
 * @param {string} data to set
 */
watedit.init = function() {
  debug.time('start up');
  watedit.attach_events();
  watedit.load_data(false);
  watedit.load_revisions();
  debug.timeEnd('start up');
};

/**
 * Loads new data and draws the app
 *  
 * @param {boolean} fresh if the data should be fetched anew
 */
watedit.load_data = function(fresh) {
  debug.time('load');
  var params = false;
  params = {'revision': watedit.RevisionData.current};
  loader(
    'preload_current_data',
    'get_revision.php',
    function(data){
      watedit.LinkData = data;
      watedit.redraw();
      debug.timeEnd('load');
    },
    function(jqXHR, textStatus, errorThrown){
      console.erorr(errorThrown);
      debug.timeEnd('load');
    },
    fresh,
    params
  );
};

/**
 * Loads revision data
 */
watedit.load_revisions = function() {
  loader(
    'preload_revisions',
    'get_revisions.php',
    function(data){
      watedit.RevisionData = data;
    },
    function(jqXHR, textStatus, errorThrown){
      console.erorr(errorThrown);
    }
  );
};

/**
 * Opens the dialog to log in the admin
 */
watedit.login = function() {
  var $dialog = $('<div>'), view;
  
  view = {
    label: 'Password',
    name: 'password',
    password: true
  };
  
  $dialog.append($.mustache('input', view));
  
  submit_cancel_dialog($dialog, 'Log in', function() {
    var $dialog = $(this);
    
    $.ajax({
      url: '/login.php',
      type: 'POST',
      data: {password: $('input[name="password"]', $dialog).val()},
      success: function (data, textStatus, jqXHR) {
        if (data === '1') {
          $.jGrowl('Successfully logged in.');
          watedit.admin = true;
          watedit.redraw();
          $dialog.dialog('close');
        } else {
          $.jGrowl(data);
        }
      },
      error: function () {
        $.jGrowl('Failed to log in.');
      }
    });
  });
};

/**
 * Logs out the admin
 */
watedit.logout = function() {
  $.get('logout.php', function() {
    $.jGrowl('You have been logged out.');
    watedit.admin = false;
    watedit.redraw();
  });
};

/**
 * Opens a modal to let the user choose which revision to make active
 */
watedit.choose_revisions = function () {
  
  function revisions_dialog(data){
    var i, revision, $dialog = $('<dialog>'), view, current = watedit.RevisionData.current, revisions = data.revisions, date;
    
    for (i in revisions) {
      if (Object.prototype.hasOwnProperty.call(revisions, i)) {
        revision = revisions[i];
        date = new Date();
        date.setTime( revision.time*1000 );
        view = {
          label: revision.description,
          description: date.toLocaleDateString() + ' ' + date.toLocaleTimeString() ,
          checked: i == current,
          name: 'revision',
          value: i
        };
        $dialog.append($.mustache('radio', view));
      }
    }

    if(watedit.admin){
      view = {
        label: 'Change for everyone.',
        checkbox: true,
        name: 'everyone'
      };

      $dialog.append($.mustache('input', view));
    }
    
    submit_cancel_dialog($dialog, 'Change active revision', function () {
      $dialog = $(this);
      var revision = $('input[name="revision"]:checked', $dialog).val(),
          everyone = $('input[name="everyone"]', $dialog).attr('checked');
      
      //change active revision
      watedit.RevisionData.current = revision;
      
      if (everyone && watedit.admin) {
        $.ajax({
          url: '/set_current_revision.php',
          type: 'POST',
          data: ''+revision,
          success: function (data, textStatus, jqXHR) {
            if (data === '1') {
              $.jGrowl('Successfully changed the active revision.');
              watedit.load_data(true);
              $dialog.dialog("close");
            } else {
              $.jGrowl(data);
            }
          },
          error: function () {
            $.jGrowl('Failed to change active revision.');
          }
        });
      } else {
        watedit.load_data(true);
        $dialog.dialog("close");
      }
    });
  }
  
  loader(
    'preload_revisions',
    'get_revisions.php',
    function(data){
      var save_current = watedit.RevisionData.current;
      watedit.RevisionData = data;
      watedit.RevisionData.current = save_current;
      revisions_dialog(data);
    },
    function(jqXHR, textStatus, errorThrown){
      console.erorr(errorThrown);
    },
    true
  );
  
};

/**
 * Redraws everything
 */
watedit.redraw = function () {
  debug.time('redraw all');
  if (watedit.edit_mode) {
    field_manager.redraw();
    $('#submit-data, #new-item, #new-field, #refresh, #reload, #field-editor, #revisions').show();
    if(watedit.admin){
      $('#login').hide();
      $('#logout').show();
    } else {
      $('#login').show();
      $('#logout').hide();
    }
  } else {
    $('#submit-data, #new-item, #new-field, #refresh, #reload, #field-editor, #revisions, #login, #logout').hide();
  }
  entry_manager.redraw();
  debug.timeEnd('redraw all');
};

/**
 * Opens a dialog where the user enters a description and then submits a new revision
 */
watedit.submit = function() {
  var $dialog, $label, $input;

  $dialog = $('<div>');

  var view = {
    label: 'Description',
    name: 'description',
    multiline: true
  };
  $dialog.append($.mustache('input', view));

  submit_cancel_dialog($dialog, 'Submit a revision', 
    function (){
      var $dialog = $(this),
          description = $('textarea[name="description"]', $dialog).val(),
          data = {};
          
      data.data = watedit.LinkData;
      data.meta = {
        description: description
      };
      
      $.ajax({
        url: '/new_revision.php',
        type: 'POST',
        data: JSON.stringify(data),
        success: function (data, textStatus, jqXHR) {
          if (!isNaN(data)) {
            watedit.RevisionData.current = data;
            $.jGrowl('Successfully created new revision! It will be reviewed shortly.');
            $dialog.dialog("close");
          } else {
            $.jGrowl(data);
          }
        },
        error: function () {
          $.jGrowl('Failed to create new revision.');
        }
      });
    });
};

/**
 * Attaches events to buttons and other things
 * 
 * @param {obejct} a jquery dom element to limit the scope of the changes (similar to how drupal does this)
 */
watedit.attach_events = function($context) {
  //set up event handlers for buttons
  $('#revisions', $context).click(function () {
    watedit.choose_revisions();
  });
  
  $('#login', $context).click(function () {
    watedit.login();
  });
  
  $('#logout', $context).click(function () {
    watedit.logout();
  });
  
  $('#submit-data', $context).click(function () {
    watedit.submit();
  });

  $('#new-item', $context).click(function () {
    var new_item_data = {};
    //first thing is title amirite?
    new_item_data[watedit.LinkData.fields[0].name] = {
      'text': 'New Item'
    };
    watedit.LinkData.entries = watedit.LinkData.entries || [];
    watedit.LinkData.entries.push(new_item_data);
    entry_manager.redraw();
    entry_manager.open_editor(watedit.LinkData.entries.length - 1);
  });

  $('#new-field', $context).click(function () {
    watedit.LinkData.fields.push({
      'name': 'New Field'
    });
    field_manager.redraw();
    field_manager.open_editor(watedit.LinkData.fields.length - 1);
  });

  $('#refresh', $context).click(function () {
    watedit.redraw();
  });

  $('#reload', $context).click(function () {
    watedit.load_data(true);
  });
  $('#editor', $context).click(function () {
    watedit.edit_mode = watedit.edit_mode ? false : true;
    watedit.redraw();
  });
}


/**
 * Redraws all entries and inserts them into #item-editor
 */
entry_manager.redraw = function () {
  var $ul = $('<ul>', {
    id: 'links',
    'class': 'grid'
  }),
    entry,
    editor = $('#item-editor'),
    entries = watedit.LinkData.entries;

  for (entry in entries) {
    if (Object.prototype.hasOwnProperty.call(entries, entry)) {
      //the sorting function  needs to know the index, but is not given it
      //so we keep track of it ourselves
      entries[entry].sort_id = entry;
      $ul.append(entry_manager.build_entry(entry));
    }
  }

  editor.empty();
  if (watedit.edit_mode) {
    editor.append('<div class="big">Entires</div>');
  }
  editor.append($ul);

  if (watedit.edit_mode) { //sortable only in edit mode
    $ul.sortable({
      placeholder: "item placeholder",
      update: function (event, ui) {
        var sort_order = $(this).sortable('toArray');
        watedit.LinkData.entries.sort(function (a, b) {
          return sort_order.indexOf('item_' + a.sort_id) - sort_order.indexOf('item_' + b.sort_id);
        });
        entry_manager.redraw();
      }
    });
    $ul.disableSelection();
  }
};

/**
 * Builds the entry's html and sets up the edit/delete events
 * 
 * @param {number} index of entry to build
 * @return {object} jquery dom element of the entry
 */
entry_manager.build_entry = function (index) {
  var $a, $edit, property, this_field, $field, entry = watedit.LinkData.entries[index], view,
    $entry = $('<li>', {
      'class': "item",
      id: 'item_' + index
    }), fields = watedit.LinkData.fields, field, $delete;

  //go through each field and display its value
  for (field in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, field)) {
      this_field = fields[field];
      property = entry[this_field.name];
      //if this entry has a property coresponding to this field
      if (property !== undefined && property.text !== '') {
        view = {
          'class': this_field['class'],
          link: property.url,
          label: this_field.label,
          text: property.text
        };
        $entry.append($.mustache('entry-field', view));
      }
    }
  }
  if (watedit.edit_mode) {
    //edit button
    $edit = $('<a>', {
      'class': 'faux-button'
    });
    $edit.text('Edit');
    $edit.click(function () {
      entry_manager.open_editor(index);
    });
    $entry.append($edit);
    //delete button
    $delete = $('<a>', {
      'class': 'faux-button'
    });
    $delete.text('Delete');
    $delete.click(function () {
      if (confirm('Are you sure you want to delete this item?')) {
        watedit.LinkData.entries.splice(index, 1);
        watedit.redraw();
      }
    });
    $entry.append($delete);
  }
  return $entry;
};

/**
 * Open a modal to edit the entry with this index
 * 
 * Modifies watedit.LinkData and triggers redraw of entries
 * 
 * @param index of entry to edit
 */
entry_manager.open_editor = function (index) {
  var this_field, property, field, $field, view, title,
    entry = watedit.LinkData.entries[index],
    fields = watedit.LinkData.fields,
    $fields = $('<div>');
  
  for (field in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, field)) {
      this_field = fields[field];
      property = entry[this_field.name];
      view = {
        val: property ? property.text : '',
        label: this_field.name,
        purpose: 'text',
        field: this_field.name,
        multiline: this_field.multiline
      };

      //text input
      $fields.append($.mustache('input', view));

      //url input
      if (this_field.url) {
        view.label += ' url';
        view.val = property ? property.url : '';
        view.purpose = 'url';
        $fields.append($.mustache('input', view));
      }
    }
  }
  
  title = entry[watedit.LinkData.fields[0].name] ? entry[watedit.LinkData.fields[0].name].text : 'Untitled';
  
  submit_cancel_dialog($fields, title, function(){
    var $dialog = $(this),
        $inputs = $('input,textarea', $dialog),
        $input, purpose, field, val, n, length;

    try{
      //get all the inputs and text areas
      for (n = 0, length = $inputs.length; n < length; n += 1) {
        $input = $($inputs[n]); //get the input element
        val = $input.val(); //new value to set
        field = $input.attr('field'); //field to edit
        purpose = $input.attr('purpose'); //text or url
        //create the field if it didn't exist but we are giving it a value
        if (entry[field] === undefined && val !== '') {
          entry[field] = {};
        }

        //set the value
        if (entry[field] !== undefined) {
          if (val !== '') {
            if(purpose == 'url' && val.substr(0,4) != 'http'){
              throw 'Invalid URL';
            }
            entry[field][purpose] = val;
          } else {
            delete entry[field][purpose];
          }
        }
        //remove empty object
        if ($.isEmptyObject(entry[field])) {
          delete entry[field];
        }
      }
      entry_manager.redraw();
      $(this).dialog("close");
    } catch (e) {
      $.jGrowl(e.toString());
    }
  }, 'Save');
};


/**
 * Redraw all fields
 * 
 * It places the new fields into #field-editor
 */
field_manager.redraw = function () {
  //safety first, frosh
  if(watedit.LinkData.fields === undefined){
    watedit.LinkData.fields = [];
  }
  
  var $ul = $('<ul>', {
    id: 'fields',
    'class': 'grid'
  }), fields = watedit.LinkData.fields, field;

  for (field in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, field)) {
      //the sorting function  needs to know the index, but is not given it
      //so we keep track of it ourselves
      fields[field].sort_id = field;
      $ul.append(field_manager.build_field(field));
    }
  }

  $('#field-editor').empty().append('<div class="big">Fields</div>').append($ul);

  $ul.sortable({
    placeholder: "field placeholder",
    update: function (event, ui) {
      var sort_order = $(this).sortable('toArray');
      watedit.LinkData.fields.sort(function (a, b) {
        return sort_order.indexOf('field_' + a.sort_id) - sort_order.indexOf('field_' + b.sort_id);
      });
      watedit.redraw();
    }
  });
  $ul.disableSelection();
};

/**
 * Builds the html for a field and attaches actions to the edit/delete buttons
 * 
 * @param {number} index of the field to build
 * @return {object} jquery dom element of the field
 */
field_manager.build_field = function (index) {
  var $li = $('<li>', {
    'class': "field",
    id: 'field_' + index
  }), $div, property, $title, $edit, $delete,
      this_field = watedit.LinkData.fields[index];

  $title = $('<div>', {
    'class': "name"
  });
  $title.text(this_field.name);
  $li.append($title);
  for (property in this_field) {
    if (Object.prototype.hasOwnProperty.call(this_field, property)) {
      $div = $('<div>');
      if (property !== 'order' && property !== 'name' && property !== 'sort_id') {
        $div.text(property + ': ' + this_field[property]);
      }
      $li.append($div);
    }
  }

  //edit button
  $edit = $('<a>', {
    'class': 'faux-button'
  });
  $edit.text('Edit');
  $edit.click(function () {
    field_manager.open_editor(index);
  });
  $li.append($edit);
  //delete button
  $delete = $('<a>', {
    'class': 'faux-button'
  });
  $delete.text('Delete');
  $delete.click(function () {
    if (confirm('Are you sure you want to delete this field?')) {
      watedit.LinkData.fields.splice(index, 1);
      watedit.redraw();
    }
  });
  $li.append($delete);
  return $li;
};

/**
 * This is a list of all properties a field may define.
 * Currently anything other than bool is a text value and bool is a 
 * checkbox which results in true/false when saved
 */
field_manager.possible_properties = {
  //property name : property type
  'name': 'text',
  'class': 'text',
  'label': 'multiline',
  'multiline': 'bool',
  'url': 'bool'
};

/**
 * Open a modal to edit the field with this index
 * 
 * Modifies watedit.LinkData and triggers redraw of everything
 * 
 * @param index of field to edit
 */
field_manager.open_editor = function (index) {
  var property, prop_type, view,
      field = watedit.LinkData.fields[index],
      $properties = $('<div>');

  //go through each property that a field can have
  for (property in field_manager.possible_properties) {
    if (Object.prototype.hasOwnProperty.call(field_manager.possible_properties, property)) {
      prop_type = field_manager.possible_properties[property];
      
      view = {
        val: field[property],
        label: property,
        name: property,
        checked: field[property] === true,
        checkbox: prop_type === 'bool',
        multiline: prop_type === 'multiline'
      };
      $properties.append($.mustache('input', view));
    }
  }

  $properties.dialog({
    title: field.name,
    modal: true,
    buttons: {
      Save: function () {
        var $inputs = $('input,textarea', $properties), n,
            $input, val, old_data, name, entry, length,
            old_name = field.name;

        //get all the inputs and text areas
        for (n = 0, length = $inputs.length; n < length; n += 1) {
          $input = $($inputs[n]); //get the input element
          val = $input.val(); //new value to set
          name = $input.attr('name'); //name of the property to edit
          //we have to not lose the relationship if we change the name!
          if (name === 'name' && val !== old_name) {
            for (entry in watedit.LinkData.entries) {
              if (Object.prototype.hasOwnProperty.call(watedit.LinkData.entries, entry)) {
                old_data = watedit.LinkData.entries[entry][old_name];
                watedit.LinkData.entries[entry][val] = old_data;
              }
            }
          }

          //create the property if it didn't exist but we are giving it a value
          if ($input.attr('type') === 'checkbox') {
            if ($input.attr('checked')) {
              field[name] = true;
            } else {
              delete field[name];
            }
          } else {
            if (val !== '') {
              field[name] = val;
            } else {
              delete field[name];
            }
          }
        }
        watedit.redraw();
        $(this).dialog("close");
      },
      Cancel: function () {
        $(this).dialog("close");
      }
    }
  });
};
