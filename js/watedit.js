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
  },

  new_item_btn: function() {
    var new_item_data = {};
    new_item_data[this.model.get('current_revision').get('fields').at(0).get('name')] = { //first thing is title amirite?
      'text': 'New Item'
    };
    this.model.get('current_revision').get('entries').unshift(new_item_data);
    this.ee.edit_entry(0);
  },

  new_field_btn: function() {
    this.model.get('current_revision').get('fields').unshift({
      'name': 'New Field'
    });
    this.fe.edit_field(0);
  },

  initialize: function() {
    debug.time('start up');
    this.model = new WatEditModel();
    this.model.on('change:edit_mode', this.render, this);
    this.model.on('change:admin', function(){
      if(this.model.get('edit_mode')) this.render();
    }, this);
    this.model.on('change:current_revision_id', this.render, this);
    // this.model.get('revisions_summary').on('change', this.render, this);
    this.load_data(false);
    this.fe = new FieldEditor(this.model);
    this.ee = new EntryEditor(this.model);
    this.load_revisions();
    debug.timeEnd('start up');
  },

  render: function() {
    debug.time('render all');
    this.$el.html($.mustache('app', {
      edit_mode: this.model.get('edit_mode'),
      loggedin: this.model.get('admin')
    }));
    this.fe.render();
    this.ee.render();
    this.delegateEvents(this.events);
    // this.complex_behaviors();
    debug.timeEnd('render all');
    return this;
  },


  // Loads new data and draws the app when done
  //
  // tell it if the data should be fetched from the server or
  // we should use old data
  load_data: function(fresh, revision) {
    debug.time('load');
    var rev = fresh ? revision: this.model.get('current_revision_id');
    //get data and render it
    loader('preload_current_data', 'get_revision.php',
    //success handler

    function(data) {
      //set data, draw everything
      this.model.get('current_revision').get('entries').reset(data.entries);
      this.model.get('current_revision').get('fields').reset(data.fields);
      this.model.set('current_revision_id', rev);
      debug.timeEnd('load');
    }.bind(this),
    //error handler

    function(jqXHR, textStatus, errorThrown) {
      debug.error(textStatus, errorThrown);
      debug.timeEnd('load');
    }.bind(this), fresh, {
      'revision': rev
    });
  },

  // Loads revision data
  // The user has his own revision different from the current revision on the server; this initializes that revision
  // We don't necessarily need the revisions data here, but we use it anyway
  load_revisions: function() {
    loader('preload_revisions', 'get_revisions.php', function(data) {
      this.model.set('current_revision_id', data.current);
      // this.model.get('revisions_summary').reset(data.revisions);
    }.bind(this), function(jqXHR, textStatus, errorThrown) {
      debug.error(errorThrown);
    });
  },

  // Opens the dialog to log in the admin
  login: function() {
    var that = this;
    submit_cancel_dialog($.mustache('form', {
      inputs: [{
        label: 'Password',
        name: 'password',
        password: true
      }]
    }), 'Log in', function() {
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
            that.model.set('admin', true);
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
    });
  },

  // Logs out the admin
  logout: function() {
    $.get('/action.php?action=logout', function() {
      $.jGrowl('You have been logged out.');
      this.model.set('admin', false);
    }.bind(this));
  },


  //Opens a modal to let the user choose which revision to make active
  choose_revisions: function() {

    var revisions_dialog = function(data) {
        var i, revision, view, revisions_data, current = this.model.get('current_revision_id'),
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
              selected: i == current,
              value: i
            });
          }
        }
        dropdown = {
          dropdown_data: dropdown_data.reverse(),
          name: 'revision',
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

        var that = this;
        submit_cancel_dialog($.mustache('form', {
          inputs: revisions_data
        }), 'Change active revision', function() {
          var $dialog = $(this),
            revision = $dialog.find('select[name="revision"]>option:selected').val(),
            everyone = $dialog.find('input[name="everyone"]').attr('checked');

          if(everyone && that.model.get('admin')) {
            $.ajax({
              url: '/action.php?action=set_current_revision',
              type: 'POST',
              data: '' + revision,
              success: function(data, textStatus, jqXHR) {
                if(data === '1') {
                  $.jGrowl('Successfully changed the active revision.');
                  that.load_data(true, revision);
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
            that.load_data(true, revision);
            $dialog.dialog("close");
          }
          return false;
        });
      }.bind(this);

    loader('preload_revisions', 'get_revisions.php', function(data) {
      revisions_dialog(data);
    }.bind(this), function(jqXHR, textStatus, errorThrown) {
      debug.erorr(errorThrown);
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

      data.data = that.model.get('current_revision');
      data.meta = {
        description: description
      };

      $.ajax({
        url: '/action.php?action=new_revision',
        type: 'POST',
        data: JSON.stringify(data),
        success: function(data, textStatus, jqXHR) {
          if(!isNaN(data)) {
            that.model.set('current_revision_id', data);
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
      return false;
    });
  }

});