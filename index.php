<?php require('pre.php');?>
  <div id="links">
  <?php
  $string = file_get_contents('data/data.json');
  $json_a=json_decode($string,true);
  foreach($json_a as $item){
    echo '<div class="item">'; //open item
    
    foreach($item as $name => $data){
      //skip the url ones
      if(substr($name, -4) == '_url'){
        continue;
      }
      //skip labels
      if(substr($name, -6) == '_label'){
        continue;
      }
      //find the relevant link if there is one
      $has_link = array_key_exists($name . '_url', $item);
      if($has_link){
        $link = $item[$name . '_url'];
      }
      //find the relevant label if there is one
      $has_label = array_key_exists($name . '_label', $item);
      if($has_label){
        $label = $item[$name . '_label'];
      }
      //output the stuff
      if($has_label){
        echo '<div class="label">' . $label . ':</div>';
      }
      echo '<div class="' . $name . '">';
      if($has_link){
        echo '<a href="' . $link . '">' . $data . '</a>';
      } else {
        echo $data;
      }
      echo '</div>';
    }
    
    echo '</div>';// close item
  }
  ?>
<?php require('post.php');
