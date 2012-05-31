// The main application namespaces
var watedit = {},
  field_manager = {},
  entry_manager = {};

// Some default state information
watedit.edit_mode = false;
watedit.admin = false;
watedit.LinkData = {};
watedit.RevisionData = {};

// Sets up the app initially and displays it
watedit.init = function() {
  debug.time('start up');
  watedit.load_data(false);
  watedit.load_revisions();
  debug.timeEnd('start up');
};


// Loads new data and draws the app
//
// tell it if the data should be fetched from the server or
// we should use old data
watedit.load_data = function(fresh) {
  debug.time('load');
  //get data and render it
  loader('preload_current_data', 'get_revision.php',
  //success handler


  function(data) {
    //set data, draw everything
    watedit.LinkData = data;
    watedit.redraw();
    debug.timeEnd('load');
  },
  //error handler


  function(jqXHR, textStatus, errorThrown) {
    console.error(textStatus, errorThrown);
    debug.timeEnd('load');
  }, fresh, {
    'revision': watedit.RevisionData.current
  });
};

// Loads revision data
watedit.load_revisions = function() {
  loader('preload_revisions', 'get_revisions.php', function(data) {
    watedit.RevisionData = data;
  }, function(jqXHR, textStatus, errorThrown) {
    console.error(errorThrown);
  });
};

// Opens the dialog to log in the admin
watedit.login = function() {
  var $dialog = $('<div>'),
    view, submit_func;

  view = {
    inputs: [{
      label: 'Password',
      name: 'password',
      password: true
    }]
  };

  $dialog.append($.mustache('form', view));

  submit_func = function() {
    $.ajax({
      url: '/action.php?action=login',
      type: 'POST',
      data: {
        password: $('input[name="password"]', $dialog).val()
      },
      success: function(data, textStatus, jqXHR) {
        if (data === '1') {
          $.jGrowl('Successfully logged in.');
          watedit.admin = true;
          watedit.redraw();
          $dialog.dialog('close');
        } else {
          $.jGrowl(data);
        }
      },
      error: function() {
        $.jGrowl('Failed to log in.');
      }
    });
    return false;
  };

  $dialog.find('form').submit(submit_func);

  submit_cancel_dialog($dialog, 'Log in', submit_func);
};


// Logs out the admin
watedit.logout = function() {
  $.get('/action.php?action=logout', function() {
    $.jGrowl('You have been logged out.');
    watedit.admin = false;
    watedit.redraw();
  });
};

//Opens a modal to let the user choose which revision to make active
watedit.choose_revisions = function() {

  function revisions_dialog(data) {
    var i, revision, view, revisions_data, current = watedit.RevisionData.current,
      revisions = data.revisions,
      date;

    revisions_data = [];
    for (i in revisions) {
      if (Object.prototype.hasOwnProperty.call(revisions, i)) {
        revision = revisions[i];
        //figure out the date
        date = new Date();
        date.setTime(revision.time * 1000);
        //add this revision to the list
        revisions_data.push({
          label: revision.description,
          description: date.toLocaleDateString() + ' ' + date.toLocaleTimeString(),
          checked: i == current,
          name: 'revision',
          value: i,
          radio: true
        });
      }
    }

    if (watedit.admin) {
      revisions_data.push({
        label: 'Change for everyone.',
        checkbox: true,
        name: 'everyone',
        revisions: revisions_data
      });
    }

    view = {
      inputs: revisions_data
    };

    submit_cancel_dialog($.mustache('form', view), 'Change active revision', function() {
      var $dialog = $(this),
        revision = $('input[name="revision"]:checked', $dialog).val(),
        everyone = $('input[name="everyone"]', $dialog).attr('checked');

      //change active revision
      watedit.RevisionData.current = revision;

      if (everyone && watedit.admin) {
        $.ajax({
          url: '/action.php?action=set_current_revision',
          type: 'POST',
          data: '' + revision,
          success: function(data, textStatus, jqXHR) {
            if (data === '1') {
              $.jGrowl('Successfully changed the active revision.');
              watedit.load_data(true);
              $dialog.dialog("close");
              $dialog.remove();
            } else {
              $.jGrowl(data);
            }
          },
          error: function() {
            $.jGrowl('Failed to change active revision.');
          }
        });
      } else {
        watedit.load_data(true);
        $dialog.dialog("close");
        $dialog.remove();
      }
    });
  }

  loader('preload_revisions', 'get_revisions.php', function(data) {
    var save_current = watedit.RevisionData.current;
    watedit.RevisionData = data;
    watedit.RevisionData.current = save_current;
    revisions_dialog(data);
  }, function(jqXHR, textStatus, errorThrown) {
    console.erorr(errorThrown);
  }, true);

};

// Redraws everything
watedit.redraw = function() {
  debug.time('redraw all');
  var $app = $('#app'),
    view = {
      edit_mode: watedit.edit_mode,
      loggedin: watedit.admin
    };

  $app.empty().append($.mustache('app', view));
  watedit.attach_events($app);

  field_manager.redraw();
  entry_manager.redraw();

  debug.timeEnd('redraw all');
};

// Opens a dialog where the user enters a description and then submits a new revision
watedit.submit_revision_dialog = function() {
  var view = {
    inputs: [{
      label: 'Description',
      name: 'description',
      multiline: true
    }]
  };

  submit_cancel_dialog($.mustache('form', view), 'Submit a revision', function() {
    var $dialog = $(this),
      description = $('textarea[name="description"]', $dialog).val(),
      data = {};

    data.data = watedit.LinkData;
    data.meta = {
      description: description
    };

    $.ajax({
      url: '/action.php?action=new_revision',
      type: 'POST',
      data: JSON.stringify(data),
      success: function(data, textStatus, jqXHR) {
        if (!isNaN(data)) {
          watedit.RevisionData.current = data;
          $.jGrowl('Successfully created new revision! It will be reviewed shortly.');
          $dialog.dialog("close");
          $dialog.remove();
        } else {
          $.jGrowl(data);
        }
      },
      error: function() {
        $.jGrowl('Failed to create new revision.');
      }
    });
  });
};

// This is a universal event handler for all buttons. It's very convenient.
//
// pass in the DOM object of the button which was pressed
watedit.handle_button_click = function(button) {
  var $btn = $(button),
    param = $btn.attr('parameter');

  switch ($btn.attr('type')) {
  case 'edit_field':
    field_manager.open_editor(param);
    break;
  case 'delete_field':
    if (confirm('Are you sure you want to delete this item?')) {
      watedit.LinkData.fields.splice(param, 1);
      watedit.redraw();
    }
    break;
  case 'edit_entry':
    entry_manager.open_editor(param);
    break;
  case 'delete_entry':
    if (confirm('Are you sure you want to delete this item?')) {
      watedit.LinkData.entries.splice(param, 1);
      watedit.redraw();
    }
    break;
  default:
    break;
  }
};

// Attaches events to buttons and make things sortable
// 
// $context is a jquery dom element to limit the scope of the changes (similar to how drupal does this)
//
watedit.attach_events = function($context) {

  // Set up event handlers for buttons
  $('.faux-button', $context).click(function() {
    watedit.handle_button_click(this);
  });

  $('#revisions', $context).click(function() {
    watedit.choose_revisions();
  });

  $('#login', $context).click(function() {
    watedit.login();
  });

  $('#logout', $context).click(function() {
    watedit.logout();
  });

  $('#submit-data', $context).click(function() {
    watedit.submit_revision_dialog();
  });

  $('#new-item', $context).click(function() {
    var new_item_data = {};
    new_item_data[watedit.LinkData.fields[0].name] = { //first thing is title amirite?
      'text': 'New Item'
    };
    watedit.LinkData.entries = watedit.LinkData.entries || [];
    watedit.LinkData.entries.unshift(new_item_data);
    entry_manager.redraw();
    entry_manager.open_editor(watedit.LinkData.entries.length - 1);
  });

  if (watedit.edit_mode) { //sortable only in edit mode

    function make_sortable(thing) {
      var $ul = $('#' + thing + 's', $context);
      $ul.sortable({
        placeholder: thing + " placeholder",
        start: function(){
          if ('item' == thing)
            entry_manager.reindex();
          else
            field_manager.reindex();
        },
        update: function(event, ui) {
          var sort_order = $(this).sortable('toArray');
          watedit.LinkData['item' == thing ? 'entries' : 'fields'].sort(function(a, b) {
            return sort_order.indexOf(thing + '_' + a.sort_id) - sort_order.indexOf(thing + '_' + b.sort_id);
          });
          entry_manager.redraw();
        }
      });
      $ul.disableSelection();
    }
    make_sortable('item');
    make_sortable('field');
  }

  $('#new-field', $context).click(function() {
    watedit.LinkData.fields.push({
      'name': 'New Field'
    });
    field_manager.redraw();
    field_manager.open_editor(watedit.LinkData.fields.length - 1);
  });

/*
  $('#refresh', $context).click(function() {
    watedit.redraw();
  });

  $('#reload', $context).click(function() {
    watedit.load_data(true);
  });
*/

  $('#editor', $context).click(function() {
    watedit.edit_mode = watedit.edit_mode ? false : true;
    watedit.redraw();
  });
};
