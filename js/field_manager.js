/**
 * Redraw all fields
 * 
 * It places the new fields into #field-editor
 */
field_manager.redraw = function () {
  
  //safety first, frosh
  if (!watedit.edit_mode) return;
  
  if (watedit.LinkData.fields === undefined){
    watedit.LinkData.fields = [];
  }
  
  var field, fields_data, this_field, property, view, properties, field_data
    , fields = watedit.LinkData.fields;

  fields_data = [];
  for (field in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, field)) {
      //the sorting function  needs to know the index, but is not given it
      //so we keep track of it ourselves
      fields[field].sort_id = field;
      
      this_field = watedit.LinkData.fields[field];
      
      properties = [];
      for (property in this_field) {
        if (Object.prototype.hasOwnProperty.call(this_field, property)) {
          if (field_manager.hidden_properties.indexOf(property) == -1) {
            properties.push({
              property: property,
              value: this_field[property]
            });
          }
        }
      }

      field_data = {
        id: 'field_' + field,
        title: this_field.name,
        properties: properties,
        buttons: {
          buttons: [{
              label: 'Edit',
              type: 'edit_field',
              parameter: field
            },
            view = {
              label: 'Delete',
              type: 'delete_field',
              parameter: field
            }
          ]
        }
      };
      
      fields_data.push(field_data);
    }
  }
  
  view = {
    fields: fields_data,
    partials: ['buttons']
  };
  
  watedit.attach_events($('#field-editor').empty().append($.mustache('fields', view)));
};

/**
 * These properties will not be displayed in the description of fields
 */
field_manager.hidden_properties = ['order', 'name', 'sort_id'];

/**
 * Builds the html for a field and attaches actions to the edit/delete buttons
 * 
 * @param {number} index of the field to build
 * @return {object} jquery dom element of the field
 */
field_manager.build_field = function (index) {
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

  submit_cancel_dialog($properties, field.name, function () {
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
    $(this).remove();
  }, 'Save');
};
