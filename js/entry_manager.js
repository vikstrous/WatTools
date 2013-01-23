// Redraws all entries and inserts them into #item-editor
entry_manager.redraw = function() {
  var data = watedit.LinkData.entries;
  var logic = {
    '/': function(data, path) {
      data = Conveyor.name(data, 'entries');
      data.edit_mode = watedit.edit_mode;
      return data;
    },
    '/entries/*': function(entry, path, key) {
      var fields_data = [];
      //go through each field to organize the data
      var fields = watedit.LinkData.fields;
      for (var field in fields) {
        var this_field = fields[field];
        var property = entry[this_field.name];//FIXME: namespace collisions!
        //if this entry has a property coresponding to this field
        if (property !== undefined && property.text !== '') {
          fields_data.push({
            'class': this_field['class'],
            link: property.url,
            label: this_field.label,
            text: property.text
          });
        }
      }

      //add display data
      entry.id = 'item_' + key;
      entry.fields = fields_data;
      entry.buttons = { //partial
        buttons: [{
          label: 'Edit',
          type: 'edit_entry',
          parameter: key
        }, {
          label: 'Delete',
          type: 'delete_entry',
          parameter: key
        }]
      };
      return entry;
    }
  };

  watedit.attach_events(
    $('#item-editor').empty().append(
      $.conveyor('entries', data, logic, ['buttons'])
    )
  );
  //watedit.attach_events($('#item-editor').empty().append($.mustache('entries', view)));
};

//the sorting function  needs to know the index, but is not given it
//so we keep track of it ourselves
entry_manager.reindex = function(){
  for (var entry in watedit.LinkData.entries) {
    //entry data
    watedit.LinkData.entries[entry].sort_id = entry;
  }
};

// Open a modal to edit the entry with this index
//
// Modifies watedit.LinkData and triggers redraw of entries
entry_manager.open_editor = function(index) {
  var this_field, property, field, $field, view, title, fields_data, field_data, entry = watedit.LinkData.entries[index],
    fields = watedit.LinkData.fields,
    $fields = $('<div>');

  fields_data = [];
  for (field in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, field)) {
      this_field = fields[field];
      property = entry[this_field.name];
      field_data = {
        val: property ? property.text : '',
        label: this_field.name,
        purpose: 'text',
        field: this_field.name,
        multiline: this_field.multiline
      };

      //text input
      fields_data.push(field_data);

      //url input
      if (this_field.url) {
        //make a copy of the old data
        field_data = $.extend({}, field_data);
        field_data.label += ' url';
        field_data.val = property ? property.url : '';
        field_data.purpose = 'url';
        //then add a field for the url
        fields_data.push(field_data);
      }
    }
  }
  view = {
    inputs: fields_data
  };

  title = entry[watedit.LinkData.fields[0].name] ? entry[watedit.LinkData.fields[0].name].text : 'Untitled';

  submit_cancel_dialog($.mustache('form', view), title, function() {
    var $dialog = $(this),
      $inputs = $('input,textarea', $dialog),
      $input, purpose, field, val, n, length;

    try {
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
            if (purpose == 'url' && val.substr(0, 4) != 'http') {
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
      $(this).remove();
    } catch (e) {
      $.jGrowl(e.toString());
    }
  }, 'Save');
};
