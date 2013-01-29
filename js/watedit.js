var WatEditModel = Backbone.Model.extend({
  defaults: {
    edit_mode: false,
    admin: false,
    LinkData: {},
    RevisionData: {}
  }
});

var WatEdit = Backbone.View.extend({
  el: '#app',

  events: {
    'click #editor': 'editor_btn',
    'click #new-item': 'new_item_btn',
    'click #new-field': 'new_field_btn',
    'click #revisions': 'revisions_btn',
    'click #login': 'login_btn',
    'click #logout': 'logout_btn',
    'click #submit-data': 'submit_data_btn'
  },

  revisions_btn: function() {
    this.choose_revisions();
  },

  login_btn: function() {
    this.login();
  },

  logout_btn: function() {
    this.logout();
  },

  submit_data_btn: function() {
    this.submit_revision_dialog();
  },


  editor_btn: function() {
    this.model.set('edit_mode', !this.model.get('edit_mode'));
    this.render();
  },

  new_item_btn: function() {
    var new_item_data = {};
    new_item_data[this.model.get('LinkData').fields[0].name] = { //first thing is title amirite?
      'text': 'New Item'
    };
    var old_linkdata = this.model.get('LinkData');
    old_linkdata.entries = old_linkdata.entries || [];
    old_linkdata.entries.push(new_item_data);
    this.model.set('LinkData', old_linkdata);
    this.ee.render();
    this.ee.edit_entry(this.model.get('LinkData').entries.length - 1);
  },

  new_field_btn: function() {
    var LinkData = this.model.get('LinkData');
    LinkData.fields = LinkData.fields || [];
    LinkData.fields.push({
      'name': 'New Field'
    });
    this.model.set('LinkData', LinkData);
    this.fe.render();
    this.fe.edit_field(this.model.get('LinkData').fields.length - 1);
  },

  complex_behaviors: function() {
    //TODO: put this into the editors themselves
    //TODO: make the editors inherit from the common editor class
    var make_sortable = function(thing) {
        var $ul = this.$('#' + thing + 's');
        var LinkData = this.model.get('LinkData');
        var that = this;
        $ul.sortable({
          placeholder: thing + " placeholder",
          update: function(event, ui) {
            var sort_order = $(this).sortable('toArray');
            LinkData['item' == thing ? 'entries' : 'fields'].sort(function(a, b) {
              return sort_order.indexOf(thing + '_' + a.sort_id) - sort_order.indexOf(thing + '_' + b.sort_id);
            });
            that.ee.render();
          }
        });
        $ul.disableSelection();
      }.bind(this);

    if(this.model.get('edit_mode')) { //sortable only in edit mode
      make_sortable('item');
      make_sortable('field');
    }
  },

  initialize: function() {
    debug.time('start up');
    this.model = new WatEditModel();
    this.load_data(false);
    this.load_revisions(); //TODO: I don't think we need this so early
    this.render();
    debug.timeEnd('start up');
  },

  render: function() {
    debug.time('render all');
    this.$el.html($.mustache('app', {
      edit_mode: this.model.get('edit_mode'),
      loggedin: this.model.get('admin')
    }));
    // this.$el.html('<div id="field-editor">fm</div><div id="item-editor">em</div>');
    if(this.model.get('edit_mode')) {
      this.fe = new FieldEditor(this.model);
    }
    this.ee = new EntryEditor(this.model);
    // this.fe.render();
    // this.ee.render();
    this.delegateEvents(this.events);
    this.complex_behaviors();
    debug.timeEnd('render all');
    return this;
  },


  // Loads new data and draws the app when done
  //
  // tell it if the data should be fetched from the server or
  // we should use old data
  load_data: function(fresh) {
    debug.time('load');
    //get data and render it
    loader('preload_current_data', 'get_revision.php',
    //success handler

    function(data) {
      //set data, draw everything
      this.model.set('LinkData', data);
      this.render();
      debug.timeEnd('load');
    }.bind(this),
    //error handler

    function(jqXHR, textStatus, errorThrown) {
      debug.error(textStatus, errorThrown);
      debug.timeEnd('load');
    }.bind(this), fresh, {
      'revision': this.model.get('RevisionData').current
    });
  },

  // Loads revision data
  load_revisions: function() {
    loader('preload_revisions', 'get_revisions.php', function(data) {
      this.model.set('RevisionData', data);
    }.bind(this), function(jqXHR, textStatus, errorThrown) {
      debug.error(errorThrown);
    });
  },

  // Opens the dialog to log in the admin
  login: function() {
    var view, submit_func;

    view = {
      inputs: [{
        label: 'Password',
        name: 'password',
        password: true
      }]
    };

    var that = this;
    submit_func = function() {
      var $dialog = $(this);
      $.ajax({
        url: '/action.php?action=login',
        type: 'POST',
        data: {
          password: $dialog.find('input[name="password"]').val()
        },
        success: function(data, textStatus, jqXHR) {
          if(data === '1') {
            $.jGrowl('Successfully logged in.');
            this.model.set('admin', true);
            this.render();
            $dialog.dialog('close');
          } else {
            $.jGrowl(data);
          }
        }.bind(that),
        error: function() {
          $.jGrowl('Failed to log in.');
        }
      });
      return false;
    };
    submit_cancel_dialog($.mustache('form', view), 'Log in', submit_func);
  },

  // Logs out the admin
  logout: function() {
    $.get('/action.php?action=logout', function() {
      $.jGrowl('You have been logged out.');
      this.model.set('admin', false);
      this.render();
    }.bind(this));
  },


  //Opens a modal to let the user choose which revision to make active
  choose_revisions: function() {

    var revisions_dialog = function(data) {
        var i, revision, view, revisions_data, current = this.model.get('RevisionData').current,
          revisions = data.revisions, dropdown, dropdown_data,
          date;

        revisions_data = [];
        dropdown_data = [];
        for(i in revisions) {
          if(Object.prototype.hasOwnProperty.call(revisions, i)) {
            revision = revisions[i];
            //figure out the date
            date = new Date();
            date.setTime(revision.time * 1000);
            //add this revision to the list
            var truncated = revision.description.substr(0, 25);
            if(revision.description.length > 25) truncated += '...';
            dropdown_data.push({
              label: truncated,
              description: date.toLocaleDateString() + ' ' + date.toLocaleTimeString(),
              checked: i == current,
              name: 'revision',
              value: i
            });
          }
        }
        dropdown = {
          dropdown_data: dropdown_data.reverse(),
          dropdown: true
        };
        revisions_data.push(dropdown);

        if(this.model.get('admin')) {
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

        var that = this;
        submit_cancel_dialog($.mustache('form', view), 'Change active revision', function() {
          var $dialog = $(this),
            revision = $dialog.find('input[name="revision"]:checked').val(),
            everyone = $dialog.find('input[name="everyone"]').attr('checked');

          //change active revision
          var old_data = that.model.get('RevisionData');
          old_data.current = revision;
          that.model.set('RevisionData', old_data);

          if(everyone && that.model.get('admin')) {
            $.ajax({
              url: '/action.php?action=set_current_revision',
              type: 'POST',
              data: '' + revision,
              success: function(data, textStatus, jqXHR) {
                if(data === '1') {
                  $.jGrowl('Successfully changed the active revision.');
                  that.load_data(true);
                  $dialog.dialog("close");
                } else {
                  $.jGrowl(data);
                }
              },
              error: function() {
                $.jGrowl('Failed to change active revision.');
              }
            });
          } else {
            that.load_data(true);
            $dialog.dialog("close");
          }
        });
      }.bind(this);

    loader('preload_revisions', 'get_revisions.php', function(data) {
      data.current = this.model.get('RevisionData').current;
      this.model.set('RevisionData', data);
      revisions_dialog(data);
    }.bind(this), function(jqXHR, textStatus, errorThrown) {
      console.erorr(errorThrown);
    }, true);
  },

  // Opens a dialog where the user enters a description and then submits a new revision
  submit_revision_dialog: function() {
    var view = {
      inputs: [{
        label: 'Description',
        name: 'description',
        multiline: true
      }]
    };

    var that = this;
    submit_cancel_dialog($.mustache('form', view), 'Submit a revision', function() {
      var $dialog = $(this),
        description = $('textarea[name="description"]', $dialog).val(),
        data = {};

      data.data = that.model.get('LinkData');
      data.meta = {
        description: description
      };

      $.ajax({
        url: '/action.php?action=new_revision',
        type: 'POST',
        data: JSON.stringify(data),
        success: function(data, textStatus, jqXHR) {
          if(!isNaN(data)) {
            var old_data = that.model.get('RevisionData');
            old_data.current = data;
            that.model.set('RevisionData', data);
            $.jGrowl('Successfully created new revision! It will be reviewed shortly.');
            $dialog.dialog("close");
          } else {
            $.jGrowl(data);
          }
        },
        error: function() {
          $.jGrowl('Failed to create new revision.');
        }
      });
    });
  }

});