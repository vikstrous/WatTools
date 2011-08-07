var sort_by_order = function(a, b){
      a.order > b.order;
};

/**
 * The main application namespace
 */
var watedit = {};

watedit.LinkData = {};

watedit.init = function(data){
  watedit.LinkData = data;
  watedit.redraw();
}

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
}

watedit.redraw = function(){
  field_manager.redraw();
  entry_manager.redraw();
}

/**
 * The namespace for things related to editing the entries
 */
var entry_manager = {};

entry_manager.redraw = function (){
  var $ul = $('<ul>', {id:'links', class:'grid'});
  var entries  = watedit.LinkData.entries.sort(sort_by_order);
  
  for (entry in entries){
    //the sorting function needs to know the index, but is not given it
    //so we keep track of it ourselves
    entries[entry].sort_id = entry;
    $ul.append(entry_manager.build_entry(entry));
  }
  
  $('#edit-area').empty().append($ul);
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
}

entry_manager.build_entry = function(index){
  var $a, $edit, property, this_field, $field, fields,
      entry = watedit.LinkData.entries[index],
      $label = $('<div>', {class:'label'});
      $entry = $('<li>', {class:"item", id:'item_' + index}),
      fields = watedit.LinkData.fields.sort(sort_by_order);

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
}

entry_manager.open_editor = function(index){
    var fields, this_field, property
        entry = watedit.LinkData.entries[index],
        fields = watedit.LinkData.fields.sort(sort_by_order);
    
    var $fields = $('<div>');
    
    for (field in fields){
      this_field = fields[field];
      property = entry[this_field.name];
      
      //field properties
      $field = $('<div>');
      
      //input builder
      function build_input(purpose, multiline){
        var $field_editor = $('<div>');
        $name_input_label = $('<label>', {'for':'name'+field+purpose});
        $name_input_label.text(this_field.name + ' ' + purpose);
        if(multiline){
          $name_input = $('<textarea>', {id:'name'+field+purpose, purpose:purpose, field:this_field.name});
        } else {
          $name_input = $('<input>', {id:'name'+field+purpose, purpose:purpose, field:this_field.name});
        }
        $name_input.val(property ? property[purpose] : '');
        $field_editor.append($name_input_label);
        $field_editor.append('<br/>');
        $field_editor.append($name_input);
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
}

/**
 * The namespace for things related to editing the fields
 */
var field_manager = {};
field_manager.redraw = function(){
  console.log('drawing');
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
    watedit.redraw();
  });
  
  $('#refresh').click(function(){
    watedit.redraw();
  });
  
  $('#reload').click(function(){
    watedit.load_data();
  });
  
  watedit.load_data();
});
