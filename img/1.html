<!DOCTYPE html>
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
<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>	</title>
    <style>
        body {
          color: #000000;
          background-color: #ffffff;
        }

        .page {
          position: fixed;
          width: 100%;
          height: 100%;
        }

        .time_container,
		.fans_container,
        .date_container {
          width: 100%;
          margin: auto;
          text-align: center;
		  line-height:37px
        }
        .fans_container {
          top: 0;
          height: 10%;
        }

        .time_container {
          top: 0;
          height: 60%;
        }

        .date_container {

        }

        .time {
          padding-top: 50px;
          font-size: 15rem;
        }

        .date {
          padding-top: 35px;
          font-size: 5rem;
        }
		
	    .fans {
          padding-top: 50px;
          font-size: 3rem;
        }
		
	    .bili {
          padding-top: 10px;
          font-size: 3rem;
        }
    .date_container1 {          width: 100%;
          margin: auto;
          text-align: center;
		  line-height:22px
}
.time_container1 {          width: 100%;
          margin: auto;
          text-align: center;
		  line-height:22px
}
    </style>
<meta http-equiv="refresh" content="50">
</head>

<body>
    <div class="page">
<div class="time_container">
          <br><br><br><br><br><br>
          <div class="time" id="time">18:09</div>
		  <br><br><br>
<div class="fans_container">
<div class="bili" id="bili"> 
  <div class="fans" id="fans">
    <p><strong>粉丝数<?php echo "" . $arr['data']['follower'];?></strong></p>
  </div>
  </div>
  
  <div class="date_container"><span class="fans"><strong><img src="https://dss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=2235388275,3809603206&fm=85&app=79&f=JPG?w=121&h=75&s=8197C732C535FA313E526557030030BB" width="218" height="140" align="texttop"></strong></span>
          <br><br>
          <div class="date" id="date">7月7日</div>
		  <br><br><br><br>
          <div class="date" id="week">星期日</div>
  </div>
</div>
    <script>
      function update() {
        var date = new Date()
        var utc8DiffMinutes = date.getTimezoneOffset() + 480
        date.setMinutes(date.getMinutes() + utc8DiffMinutes)

        var timeString = date.getHours() + ':' + ('0' + date.getMinutes()).slice(-2)
        var dateString = (date.getMonth() + 1) + '月' + date.getDate() + '日'
        var weekList = ['日', '一', '二', '三', '四', '五', '六']
        var weekString = '星期' + weekList[date.getDay()]

        document.getElementById("time").innerHTML = timeString
        document.getElementById("date").innerHTML = dateString
        document.getElementById("week").innerHTML = weekString
      }

      update()
      setInterval("update()", 60 * 1000)
    </script>

</body></html>