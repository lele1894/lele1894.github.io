<?php
  
header("Content-type: text/html; charset=utf-8"); 
  
error_reporting(E_ALL ^ E_NOTICE);// 显示除去 E_NOTICE 之外的所有错误信息
$uid = $_GET["uid"];
  
if ($uid != null) {
    $file_contents = curl_get_https('https://api.bilibili.com/x/relation/stat?vmid=' . $uid);
    $arr = json_decode($file_contents,true);
}
  
function curl_get_https($url){
    $curl = curl_init(); // 启动一个CURL会话
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);// TRUE 将curl_exec()获取的信息以字符串返回，而不是直接输出。
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); // 跳过证书检查
    $tmpInfo = curl_exec($curl); // 返回api的json对象
    curl_close($curl);
    return $tmpInfo; // 返回json对象
}
  
?>
 
<html>
<head>
<meta http-equiv="refresh" content="50">
<title>BiliBili粉丝数实时显示</title>
<style type="text/css">
#font {
		font-size: 350px;
	color: #000000;
	vertical-align: top;
}
#font2 {
	font-size: 150px;
	color: #000;
	vertical-align: top;
}
</style>
</head>
<body>
<p align="center">&nbsp;</p>
<div id="font2">
 
  <p align="center"><strong><img src="https://dss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=2235388275,3809603206&fm=85&app=79&f=JPG?w=121&h=75&s=8197C732C535FA313E526557030030BB" width="229" height="130" align="texttop"></strong>星夜星在线</p>
  </div>
  <b>
<p align="center">
  </div>
</div>
</span>
<div id="font">
  <b><p align="center"><strong><?php echo "" . $arr['data']['follower'];?><b></strong></div>

</body>
</html>