<?php
if($_POST['suggest']){
  $fh = fopen('suggest', 'a');
  fwrite($fh, $_POST['suggest']."\n\n");
}
?>
<?php require('pre.php');?>
  <div id="content">
    <div class="bold">Suggestions:</div>
    <?php
    $string = file_get_contents('suggest');
    echo str_replace("\n", '<br/>', htmlentities($string));
    ?>
    <form action="" method="POST">
      <textarea name="suggest"></textarea>
      <br/>
      <input type="submit" value="Submit suggestion!"/>
    </form>
  </div>
<?php require('post.php');?>
