<?php
if($_POST['json']){
  $fh = fopen('data.js', 'w') or die('Failed to open file for writing.');
  fwrite($fh, $_POST['json']);
}
?>
<?php require('pre.php');?>
  <div id="content">
    <div class="bold">TODO: auth</div>
    <a id="new-item">New Item</a>
    <div id="edit-area">
    </div>
    <form id="json_form" action="" method="POST" class="hidden">
      <textarea id="json" name="json"></textarea>
      <br/>
      <input type="submit" value="Update data!"/>
    </form>
    <a id="refresh">Refresh</a>
    <a id="submit-data">Submit Data</a>
  </div>
  
  <script type="text/javascript" src="editor.js"></script>
<?php require('post.php');?>
