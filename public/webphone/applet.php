<html>
<?php
$serveraddress=$_GET['serveraddress'];
$phoneuser=$_GET['username'];
$phonepass=$_GET['password'];
?>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
<title>RCS Web Phone</title>
</head>

<body>

<p><b>RCS Web Phone</b></p>
<applet
  archive  = "webphone.jar"
  codebase = "."
  code     = "webphone.webphone.class"
  hspace   = "0"
  vspace   = "0"
  width    = "140"  
  height   = "200"
  name     = "webphone"
  align    = "middle"
  hasaudio = "true"
>
<param name = "serveraddress" value = "<?php echo $serveraddress?>">
<param name = "multilinegui" value = "false">
<param name = "username" value = "<?php echo $phoneuser?>">
<param name = "password" value = "<?php echo $phonepass?>">
<param name = "register" value = "true">
<param name = "hasaudio" value = "true">
<param name = "hasconnect" value = "false">
<param name = "displaysipusername" value = "false">
<param name = "hideusernamepwdinput" value = "true">
<param name = "autoaccept" value = "true">
<param name = "agc" value = "0">
<param name = "aec" value = "0">


<b>Java is currently not installed or not enabled.</b>

</applet>

</p>

<p>
Need Java? <br> Click Here <b><a href="http://www.java.com/en/download/index.jsp">here</a></b>.<br>
</p>
</body>

</html>

