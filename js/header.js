/**
 * TODO: faster templating - convert more things to use mustache?
 * TODO: enter button submits dialogs
 * TODO: make revision deletion possible
 * TODO: reuse dialogs? maybe not
 */

/**
 * Debug tools - built only if necessary and possible
 */
var debug = {
  on: true,
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
function submit_cancel_dialog(html, title, submit, submit_label) {
  //parameter parsing
  submit_label = submit_label || 'Submit';
  
  //vars
  var buttons;
  
  //setup
  buttons = {};
  buttons[submit_label] = submit;
  buttons.Cancel = function () {
    $(this).dialog("close");
    $(this).remove();
  };
  
  //open the dialog
  $(html).dialog({
    title: title,
    buttons: buttons,
    modal:true
  });
}
