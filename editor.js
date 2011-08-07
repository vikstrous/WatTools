/**
 * The main application namespace
 */
var watedit = {};

watedit.LinkData = {};

watedit.init = function(data){
  watedit.LinkData = data;
  watedit.redraw();
};

watedit.load_data = function(){
  $.ajax({
    url: 'data.js',
    success: function(data, textStatus, jqXHR){
      watedit.init(data);
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.erorr(errorThrown);
    },
    dataType: 'json',
    cache: false
  });
};

watedit.redraw = function(){
  field_manager.redraw();
  entry_manager.redraw();
};

/**
 * The namespace for things related to editing the entries
 */
var entry_manager = {};

entry_manager.redraw = function (){
  var $ul = $('<ul>', {id:'links', class:'grid'});
  var entries  = watedit.LinkData.entries;
  
  for (entry in entries){
    //the sorting function needs to know the index, but is not given it
    //so we keep track of it ourselves
    entries[entry].sort_id = entry;
    $ul.append(entry_manager.build_entry(entry));
  }
  
  $('#item-editor').empty().append($ul);
  $ul.sortable({
    placeholder: "item placeholder",
    update: function(event, ui){
      var sort_order = $(this).sortable('toArray');
      watedit.LinkData.entries.sort(function(a, b){
        return sort_order.indexOf('item_'+a.sort_id) > sort_order.indexOf('item_'+b.sort_id);
      });
    }
  });
  $ul.disableSelection();
};

entry_manager.build_entry = function(index){
  var $a, $edit, property, this_field, $field, fields,
      entry = watedit.LinkData.entries[index],
      $label = $('<div>', {class:'label'});
      $entry = $('<li>', {class:"item", id:'item_' + index}),
      fields = watedit.LinkData.fields;

  //go through each field and display its value
  for (field in fields){
    this_field = fields[field];
    property = entry[this_field.name];
    //if this entry has a property coresponding to this field
    if(property != undefined && property.text != ''){
      $field = $('<div>', {class: (this_field.class ? this_field.class + ' field' : 'field')});
      //take care of url
      if(property.url){
        $a = $('<a>', {href:property.url});
        $a.text(property.text);
        $field.html($a);
      } else {
        $field.text(property.text);
      }
      //take care of label
      if(this_field.label){
        $field.prepend($label.clone().text(this_field.label));
      }
      $entry.append($field);
    }
  }
  //edit button
  $edit = $('<a>', {class:'faux-button'});
  $edit.text('Edit');
  $edit.click(function(){
      entry_manager.open_editor(index);
  });
  $entry.append($edit);
  //delete button
  $delete = $('<a>', {class:'faux-button'});
  $delete.text('Delete');
  $delete.click(function(){
    if(confirm('Are you sure you want to delete this item?')){
      watedit.LinkData.entries.splice(index,1);
      watedit.redraw();
    }
  });
  $entry.append($delete);
  return $entry;
};

entry_manager.open_editor = function(index){
  var this_field, property
      entry = watedit.LinkData.entries[index],
      fields = watedit.LinkData.fields;
  
  var $fields = $('<div>');
  
  for (field in fields){
    this_field = fields[field];
    property = entry[this_field.name];
    
    //field properties
    $field = $('<div>');
    
    //input builder
    function build_input(purpose, multiline){
      var $field_editor = $('<div>');
      $input_label = $('<label>', {'for':'input_'+field+purpose});
      $input_label.text(this_field.name + ' ' + purpose);
      if(multiline){
        $input = $('<textarea>', {id:'input_'+field+purpose, purpose:purpose, field:this_field.name});
      } else {
        $input = $('<input>', {id:'input_'+field+purpose, purpose:purpose, field:this_field.name});
      }
      $input.val(property ? property[purpose] : '');
      $field_editor.append($input_label);
      $field_editor.append('<br/>');
      $field_editor.append($input);
      return $field_editor;
    }
    
    //text input
    $field.append(build_input('text', this_field.multiline));
    
    //url input
    if(this_field.url){
      $field.append(build_input('url', false));
    }
    
    $fields.append($field);
  }
  
  $fields.dialog({
    title: entry.name.text,
    modal: true,
    buttons: {
      Save: function(){
          var $inputs = $('input,textarea', $fields);
          var $input, purpose, field, val;
          
          //get all the inputs and text areas
          for (var n = 0, length = $inputs.length; n < length; n++){
            $input = $($inputs[n]);//get the input element
            val = $input.val();//new value to set
            field = $input.attr('field');//field to edit
            purpose = $input.attr('purpose');//text or url
            
            //create the field if it didn't exist but we are giving it a value
            if(entry[field] == undefined && val != ''){
              entry[field] = {};
            }
            
            //set the value
            if(entry[field] != undefined){
              if(val != ''){
                entry[field][purpose] = val;
              } else {
                delete entry[field][purpose];
              }
            }
            //remove empty object
            if($.isEmptyObject(entry[field])){
              delete entry[field];
            }
          }
          entry_manager.redraw();
          $(this).dialog( "close" );
        },
      Cancel: function(){
        $(this).dialog("close");
      }
    }
  });
};

/**
 * The namespace for things related to editing the fields
 */
var field_manager = {};

field_manager.redraw = function(){
  var $ul = $('<ul>', {id:'fields', class:'grid'});
  var fields  = watedit.LinkData.fields;
  
  for (field in fields){
    //the sorting function needs to know the index, but is not given it
    //so we keep track of it ourselves
    fields[field].sort_id = field;
    $ul.append(field_manager.build_field(field));
  }
  
  $('#field-editor').empty().append($ul);
  
  $ul.sortable({
    placeholder: "field placeholder",
    update: function(event, ui){
      var sort_order = $(this).sortable('toArray');
      watedit.LinkData.fields.sort(function(a, b){
        return sort_order.indexOf('field_'+a.sort_id) > sort_order.indexOf('field_'+b.sort_id);
      });
      entry_manager.redraw();
    }
  });
  $ul.disableSelection();
};

field_manager.build_field = function(index){
  var $li = $('<li>', {class:"field", id:'field_' + index});
  var $div, property, this_field, $title, $edit, $delete;
  this_field = watedit.LinkData.fields[index];
  
  $title = $('<div>', {class:"name"});
  $title.text(this_field.name);
  $li.append($title);
  for (property in this_field){
    $div = $('<div>');
    if(property != 'order' && property != 'name' && property != 'sort_id'){
      $div.text(property + ': ' + this_field[property]);
    }
    $li.append($div);
  }
  
  //edit button
  $edit = $('<a>', {class:'faux-button'});
  $edit.text('Edit');
  $edit.click(function(){
      field_manager.open_editor(index);
  });
  $li.append($edit);
  //delete button
  $delete = $('<a>', {class:'faux-button'});
  $delete.text('Delete');
  $delete.click(function(){
    if(confirm('Are you sure you want to delete this field?')){
      watedit.LinkData.fields.splice(index,1);
      watedit.redraw();
    }
  });
  $li.append($delete);
  return $li;
};

field_manager.possible_properties = {
  'name': 'text',
  'class': 'text',
  'label': 'text',
  'multiline': 'bool',
  'url': 'bool'
};

field_manager.open_editor = function(index){
  var properties, prop_type,
      field = watedit.LinkData.fields[index];

  var $properties = $('<div>');
  
  
  //input builder
  function build_input(name, type){
    var $input;
    var $property_editor = $('<div>');
    var $input_label = $('<label>', {'for':'input_'+name});
    $input_label.text(name);
    $input = $('<input>', {id:'input_'+name, name:name});
    if(type == 'bool'){
      $input.attr('type', 'checkbox');
      $input.attr('checked', field[name]);
    } else {
      $input.val(field[name] ? field[name] : '');
    }
    $property_editor.append($input_label);
    $property_editor.append('<br/>');
    $property_editor.append($input);
    return $property_editor;
  }
  
  for (property in field_manager.possible_properties){
    prop_type = field_manager.possible_properties[property];
    //build input
    $properties.append(build_input(property, prop_type));
  }
  
  $properties.dialog({
    title: field.name,
    modal: true,
    buttons: {
      Save: function(){
          var $inputs = $('input', $properties);
          var $input, val;
          
          //get all the inputs and text areas
          for (var n = 0, length = $inputs.length; n < length; n++){
            $input = $($inputs[n]);//get the input element
            val = $input.val();//new value to set
            name = $input.attr('name');//name of the property to edit
            
            //create the property if it didn't exist but we are giving it a value
            if($input.attr('type') == 'checkbox'){
              if($input.attr('checked')){
                field[name] = true;
              } else {
                delete field[name];
              }
            } else {
              if(val != ''){
                field[name] = val;
              } else {
                delete field[name];
              }
            }
          }
          watedit.redraw();
          $(this).dialog( "close" );
        },
      Cancel: function(){
        $(this).dialog("close");
      }
    }
  });
}

$(document).ready(function(){
  
  //set up event handlers for buttons
  $('#submit-data').click(function(){
    if(confirm('Are you sure you want to submit your changes to the list?')){
      $("#json").text(JSON.stringify(watedit.LinkData));
      $("#json_form").submit();
    }
  });
  
  $('#new-item').click(function(){
    watedit.LinkData.entries.push(
      {
        'name' : {
          'text' : 'New Item'
        },
        'description': {
          'text' : 'This item is new.'
        }
      }
    );
    enty_manager.redraw();
  });
  
  $('#new-field').click(function(){
    watedit.LinkData.fields.push(
      {
        'name' : 'New Field'
      }
    );
    field_manager.redraw();
  });
  
  $('#refresh').click(function(){
    watedit.redraw();
  });
  
  $('#reload').click(function(){
    watedit.load_data();
  });
  
  watedit.load_data();
});
