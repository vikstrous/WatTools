// These properties will not be displayed in the description of fields
var field_manager = {};
field_manager.hidden_properties = ['order', 'name', 'sort_id'];

// Builds the html for a field and attaches actions to the edit/delete buttons
//
// @param {number} index of the field to build
// @return {object} jquery dom element of the field
field_manager.build_field = function(index) {};

// This is a list of all properties a field may define.
// Currently anything other than bool is a text value and bool is a
// checkbox which results in true/false when saved
field_manager.possible_properties = {
  //property name : property type
  'name': 'text',
  'class': 'text',
  'label': 'textarea',
  'multiline': 'bool',
  'url': 'bool'
};



var FieldEditor = Backbone.View.extend({
  el: '#field-editor',

  events: {
    'click .faux-button[type="edit_field"]': 'edit_field_btn',
    'click .faux-button[type="delete_field"]': 'delete_field_btn'
  },

  delete_field_btn: function(e) {
    if(confirm('Are you sure you want to delete this item?')) {
      var param = $(e.target).attr('parameter');
      var LinkData = this.model.get('LinkData');
      LinkData.fields.splice(param, 1);
      this.model.set('LinkData', LinkData);
      this.render();
    }
  },

  initialize: function(model) {
    this.model = model;
    this.render();
  },

  render: function() {
    debug.time('render fields');
    //safety first, frosh
    if(!this.model.get('edit_mode')) return;

    var LinkData = this.model.get('LinkData');
    if(LinkData.fields === undefined) {
      LinkData.fields = [];
      this.model.ste('LinkData', LinkData);
    }

    var field, fields_data, this_field, property, view, properties, field_data, fields = LinkData.fields;

    fields_data = [];
    for(field in fields) {
      if(Object.prototype.hasOwnProperty.call(fields, field)) {
        //the sorting function  needs to know the index, but is not given it
        //so we keep track of it ourselves
        fields[field].sort_id = field;

        this_field = fields[field];

        properties = [];
        for(property in this_field) {
          if(Object.prototype.hasOwnProperty.call(this_field, property)) {
            if(field_manager.hidden_properties.indexOf(property) == -1) {
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
            }]
          }
        };

        fields_data.push(field_data);
      }
    }

    view = {
      fields: fields_data,
      partials: ['buttons']
    };

    this.$el.html($.mustache('fields', view));
    this.delegateEvents(this.events);
    debug.timeEnd('render fields');
    return this;
  },
  // Open a modal to edit the field with this index
  //
  // Modifies watedit.LinkData and triggers redraw of everything
  edit_field_btn: function(e) {
    this.edit_field($(e.target).attr('parameter'));
  },

  edit_field: function(index) {
    var property, prop_type, view, properties_data, field = this.model.get('LinkData').fields[index];

    properties_data = [];
    //go through each property that a field can have
    for(property in field_manager.possible_properties) {
      if(Object.prototype.hasOwnProperty.call(field_manager.possible_properties, property)) {
        prop_type = field_manager.possible_properties[property];

        properties_data.push({
          val: field[property],
          label: property,
          name: property,
          checked: field[property] === true,
          checkbox: prop_type === 'bool',
          multiline: prop_type === 'multiline'
        });
      }
    }
    view = {
      inputs: properties_data
    };

    var that = this;
    submit_cancel_dialog($.mustache('form', view), field.name, function() {
      var $dialog = $(this),
        $inputs = $('input,textarea', $dialog),
        n, $input, val, old_data, name, entry, length, old_name = field.name,
        LinkData = that.model.get('LinkData');

      //get all the inputs and text areas
      for(n = 0, length = $inputs.length; n < length; n += 1) {
        $input = $($inputs[n]); //get the input element
        val = $input.val(); //new value to set
        name = $input.attr('name'); //name of the property to edit
        //we have to not lose the relationship if we change the name!
        if(name === 'name' && val !== old_name) {
          for(entry in LinkData.entries) {
            if(Object.prototype.hasOwnProperty.call(LinkData.entries, entry)) {
              old_data = LinkData.entries[entry][old_name];
              LinkData.entries[entry][val] = old_data;
              that.model.set('LinkData', LinkData);
            }
          }
        }

        //create the property if it didn't exist but we are giving it a value
        if($input.attr('type') === 'checkbox') {
          if($input.attr('checked')) {
            field[name] = true;
          } else {
            delete field[name];
          }
        } else {
          if(val !== '') {
            field[name] = val;
          } else {
            delete field[name];
          }
        }
      }
      that.render();
      $dialog.dialog("close");
    }, 'Save');
  }

});