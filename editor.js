var sort_by_order = function(a, b){
      a.order > b.order;
};

$(document).ready(function(){
  var LinkData = {};
  
  function show_entry_editor(index){
    var fields, this_field, property
        entry = LinkData.entries[index],
        fields = LinkData.fields.sort(sort_by_order);
    
    var $fields = $('<div>');
    
    for (field in fields){
      this_field = fields[field];
      property = entry[this_field.name];
      
      //field properties
      $field = $('<div>');
      
      //name input
      $name_input_label = $('<label>', {'for':'name'+field});
      $name_input_label.text(this_field.name);
      if(this_field.multiline){
        $name_input = $('<textarea>', {id:'name'+field, purpose:'text', field:this_field.name});
      } else {
        $name_input = $('<input>', {id:'name'+field, purpose:'text', field:this_field.name});
      }
      $name_input.val(property ? property.text : '');
      $field.append($name_input_label);
      $field.append($name_input);
      
      //url input
      if(this_field.url){
        $field.append('<br/>');
        $url_input_label = $('<label>', {'for':'url'+field});
        $url_input_label.text(this_field.name + ' url');
        $url_input = $('<input>', {id:'url'+field, purpose:'url', field:this_field.name});
        $url_input.val(property ? property.url : '');
        $field.append($url_input_label);
        $field.append($url_input);
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
            for (var n = 0, length = $inputs.length; n < length; n++){
              $input = $($inputs[n]);//get the input element
              val = $input.val();//new value to set
              field = $input.attr('field');//field to edit
              purpose = $input.attr('purpose');//text or url
              
              if(entry[field] == undefined && val != ''){
                entry[field] = {};
              }
              if(entry[field] != undefined){
                entry[field][purpose] = val;
              }
              //console.log(entry[field][purpose]);
            }
            redraw();
            $(this).dialog( "close" );
          },
        Cancel: function(){
          $(this).dialog("close");
        }
      }
    });
  }
  
  function build_entry(index){
    var $a, $edit, property, this_field, $field, fields,
        entry = LinkData.entries[index],
        $label = $('<div>', {class:'label'}),
        $entry = $('<li>', {class:"item"}),
        fields = LinkData.fields.sort(sort_by_order);
    
    for (field in fields){
      this_field = fields[field];
      property = entry[this_field.name];
      if(property != undefined){
        $field = $('<div>', {class: this_field.class + ' field'});
        if(property.url){
          $a = $('<a>', {href:property.url});
          $a.text(property.text);
          $field.html($a);
        } else {
          $field.text(property.text);
        }
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
        show_entry_editor(index);
    });
    $entry.append($edit);
    //delete button
    $delete = $('<a>', {class:'faux-button'});
    $delete.text('Delete');
    $delete.click(function(){
        LinkData.entries.splice(index,1);
        redraw();
    });
    $entry.append($delete);
    return $entry;
  }
  
  function redraw(){
    var $ul = $('<ul>', {id:'links', class:'grid'});
    var $li;
    var entries  = LinkData.entries.sort(sort_by_order);
    
    for (entry in entries){
      $ul.append(build_entry(entry));
    }
    
    $('#edit-area').empty().append($ul);
		$ul.sortable({
			placeholder: "item placeholder"
		});
		$ul.disableSelection();
  }
  
  function init(){
    $('#new-item').click(function(){
      LinkData.entries.push(
        {
          'name' : {
            'text' : 'New Item'
          },
          'description': {
            'text' : 'This item is new'
          }
        }
      );
      redraw();
    });
    $('#submit-data').click(function(){
      if(confirm('Are you sure you want to submit your changes to the list?')){
        $("#json").text(JSON.stringify(LinkData));
        $("#json_form").submit();
      }
    });
    $('#refresh').click(function(){
      redraw();
    });
    redraw();
  }
  
  $.ajax({
    url: 'data.js',
    success: function(data, textStatus, jqXHR){
      LinkData = data;
      init();
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.erorr(errorThrown);
    },
    dataType: 'json',
    cache: false
  });
});
