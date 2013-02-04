// TODO:
//
//- faster templating - convert more things to use mustache?
//- enter button submits dialogs
//- make revision deletion possible
//- reuse dialogs? maybe not
//- extract form related things into a form api

// Debug tools - built only if necessary and possible
var debug = {
  on: true,
  error: function(text){
    $.jGrowl(text);
    if(window.console !== undefined && console.error !== undefined) {
      console.error(text);
    }
  },
  time: function(label) {
    if (debug.on && window.console !== undefined && console.time !== undefined) {
      debug.time = function(label) {
        console.time(label);
      };
      debug.time(label);
    } else {
      debug.time = function() {};
    }
  },
  timeEnd: function(label) {
    if (debug.on && window.console !== undefined && console.timeEnd !== undefined) {
      debug.timeEnd = function(label) {
        console.timeEnd(label);
      };
      debug.timeEnd(label);
    } else {
      debug.timeEnd = function() {};
    }
  }
};


// Loads json data on demand, supports preloading
//
// Parameters:
//
// - *string* preload_var variable name where preloaded data is
// - *string* url to get the data from if it's not preloaded
// - *function* success function to call when done
// - *function* error function to call when done
// - *boolean* fresh demand fresh data
// - *object* params to send to the server


function loader(preload_var, url, success, error, fresh, params) {
  if (window[preload_var] !== undefined && !fresh) {
    success(window[preload_var]);
  } else {
    $.ajax({
      url: url,
      type: 'GET',
      data: params,
      success: function(data, textStatus, jqXHR) {
        window[preload_var] = data;
        success(data, textStatus, jqXHR);
      },
      error: function(data, textStatus, errorThrown) {
        error(data, textStatus, errorThrown);
      },
      dataType: 'json',
      cache: false
    });
  }
}

// Show a dialog with the submit and cancel buttons
//
// Parameters:
//
// - *string* html
// - *string* title
// - *function* submit
// - *string* submit_label optional


function submit_cancel_dialog(html, title, submit, submit_label) {
  //parameter parsing
  submit_label = submit_label || 'Submit';

  //vars
  var buttons, $dialog = $('#dialog');

  //setup
  buttons = {};
  buttons[submit_label] = submit;
  buttons.Cancel = function() {
    $dialog.dialog("close");
  };

  //open the dialog
  $dialog.html(html).dialog({
    title: title,
    buttons: buttons,
    modal: true
  });

  $dialog.find('form').submit(submit.bind($dialog));
}

// a convenient function when using backbone
function mkobj(k, v){
  var r = {};
  r[k] = v;
  return r;
}