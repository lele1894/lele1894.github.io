# lele1894.github.io

# YouTube 热门视频聚合

这是一个自动抓取YouTube热门视频的静态网站项目。网站会定时更新各地区的YouTube热门视频，并提供中文翻译和详细信息。

## 主要功能

- 自动抓取YouTube各地区（美国、中国香港、中国台湾）热门视频
- 视频标题自动翻译为中文
- 显示视频详细信息（时长、播放量、上传时间等）
- 自动更新，保持内容实时性

## 技术栈

- Python
- YouTube Data API
- GitHub Pages
- GitHub Actions（自动部署）

## 文件说明

- `main.py`: 核心爬虫程序
- `template.html`: 页面模板文件
- `index.html`: 网站主页
- `us.html/hk.html/tw.html`: 各地区视频页面
- `requirements.txt`: Python依赖包列表

## 自动更新

项目通过GitHub Actions实现自动更新，定时抓取最新的热门视频数据。

## 访问地址

你可以通过以下地址访问网站：[YouTube热门视频](https://lele1894.github.io)
