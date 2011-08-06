$(document).ready(function(){
  var LinkData = {};
  
  function redraw(){
    
    function build_entry(entry){
      var $field;
      var $entry = $('<li>', {class:"item"});
      var $a;
      var $edit;
      var this_entry;
      var this_field;
      var $label = $('<div>', {class:'label'});
      var fields = LinkData.fields.sort(function(a, b){
        return a.order > b.order;
      });
      
      for (field in fields){
        this_field = fields[field];
        this_entry = entry[this_field.name];
        if(this_entry != undefined){
          $field = $('<div>', {class: this_field.class + ' field'});
          if(this_entry.url){
            $a = $('<a>', {href:this_entry.url});
            $a.text(this_entry.text);
            $field.html($a);
          } else {
            $field.text(this_entry.text);
          }
          if(this_field.label){
            $field.prepend($label.clone().text(this_field.label));
          }
          $edit = $('<a>', {class:'edit-button'});
          $edit.text('<edit>');
          $edit.click(function(){
              console.log($(this));
          });
          $field.append($edit);
          $entry.append($field);
        }
      }
      return $entry;
    }
    
    var $ul = $('<ul>', {id:'links', class:'grid'});
    var $li;
    
    for (entry in LinkData.entries){
      $ul.append(build_entry(LinkData.entries[entry]));
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
