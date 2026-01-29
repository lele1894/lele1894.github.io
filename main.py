from googleapiclient.discovery import build
from googletrans import Translator
ts = Translator()
from datetime import datetime
import json
import os
from jinja2 import Template
from zoneinfo import ZoneInfo
import time
import random
import warnings
from concurrent.futures import ThreadPoolExecutor
import threading

warnings.filterwarnings('ignore')

print_lock = threading.Lock()
result_lock = threading.Lock()

def translate_text(text, max_retries=3):
    """使用googletrans翻译文本"""
    for attempt in range(max_retries):
        try:
            time.sleep(random.uniform(0.5, 1))
            result = ts.translate(text, dest='zh-cn', src='auto')
            return result.text
        except Exception as e:
            continue
    return text

def get_video_duration(duration):
    """转换视频时长格式"""
    duration = duration.replace('PT', '')
    hours = 0
    minutes = 0
    seconds = 0

    if 'H' in duration:
        hours = int(duration.split('H')[0])
        duration = duration.split('H')[1]
    if 'M' in duration:
        minutes = int(duration.split('M')[0])
        duration = duration.split('M')[1]
    if 'S' in duration:
        seconds = int(duration.split('S')[0])

    if hours > 0:
        return f"{hours}:{minutes:02d}:{seconds:02d}"
    else:
        return f"{minutes}:{seconds:02d}"

def process_video(video, region):
    """处理单个视频信息"""
    try:
        video_title = video['snippet']['title']
        translated_title = translate_text(video_title)
        
        # 处理上传时间
        published_at = datetime.fromisoformat(video['snippet']['publishedAt'].replace('Z', '+00:00'))
        shanghai_tz = ZoneInfo("Asia/Shanghai")
        published_at = published_at.astimezone(shanghai_tz)
        
        # 计算发布时间差
        now = datetime.now(shanghai_tz)
        time_diff = now - published_at
        
        if time_diff.days > 365:
            upload_time = f"{time_diff.days // 365}年前"
        elif time_diff.days > 30:
            upload_time = f"{time_diff.days // 30}个月前"
        elif time_diff.days > 0:
            upload_time = f"{time_diff.days}天前"
        elif time_diff.seconds // 3600 > 0:
            upload_time = f"{time_diff.seconds // 3600}小时前"
        else:
            upload_time = f"{time_diff.seconds // 60}分钟前"
        
        # 获取视频封面图,按分辨率从高到低尝试
        video_id = video['id']
        thumbnail_urls = [
            f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg",
            f"https://i.ytimg.com/vi/{video_id}/sddefault.jpg",
            f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
            f"https://i.ytimg.com/vi/{video_id}/mqdefault.jpg",
            f"https://i.ytimg.com/vi/{video_id}/default.jpg"
        ]
        
        return {
            '原标题': video_title,
            '中文标题': translated_title,
            '创作者': video['snippet']['channelTitle'],
            'URL': f"https://www.youtube.com/watch?v={video['id']}",
            '时长': get_video_duration(video['contentDetails']['duration']),
            '播放量': int(video['statistics']['viewCount']),
            '地区': region,
            '上传时间': upload_time,
            'thumbnail': thumbnail_urls
        }
    except Exception as e:
        print(f"处理视频时出错: {str(e)}")
        return None

def get_trending_videos(api_key, region_code, region_name):
    """获取指定地区的视频"""
    youtube = build('youtube', 'v3', developerKey=api_key)
    
    try:
        request = youtube.videos().list(
            part='snippet,contentDetails,statistics',
            chart='mostPopular',
            regionCode=region_code,
            maxResults=50  # 每个地区获取50个视频
        )
        
        response = request.execute()
        videos = response['items']
        
        # 使用线程池处理视频
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [
                executor.submit(process_video, video, region_name)
                for video in videos
            ]
            
            results = []
            for future in futures:
                result = future.result()
                if result:
                    results.append(result)
        
        return sorted(results, key=lambda x: x['播放量'], reverse=True)
        
    except Exception as e:
        print(f"获取{region_name}视频数据时出错: {str(e)}")
        return []

def generate_html(videos, template_path, output_path):
    """生成HTML报告"""
    try:
        with open(template_path, 'r', encoding='utf-8') as f:
            template_content = f.read()
            
        template = Template(template_content)
        current_time = datetime.now(ZoneInfo("Asia/Shanghai")).strftime('%Y年%m月%d日 %H:%M')
        
        html_content = template.render(
            videos=videos,
            current_time=current_time,
            regions=videos[0]['地区'] if videos else '',
            update_time=current_time
        )
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
            
    except Exception as e:
        print(f"生成HTML报告时出错: {str(e)}")

def update_index_html(current_time):
    """更新index.html中的时间标签"""
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 查找所有包含时间的链接
        import re
        pattern = r'title="更新时间: .*?"'
        content = re.sub(pattern, f'title="更新时间: {current_time}"', content)
            
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(content)
            
        print("已更新index.html的时间标签")
    except Exception as e:
        print(f"更新index.html时出错: {str(e)}")

def main():
    api_key = os.environ.get('YOUTUBE_API_KEY')
    if not api_key:
        raise ValueError("未设置YOUTUBE_API_KEY环境变量")
    
    # 修改时间获取方式
    current_time = datetime.now(ZoneInfo("Asia/Shanghai")).strftime('%Y年%m月%d日 %H:%M')
    
    regions = [
        {'code': 'US', 'name': '美国', 'file': 'us.html'},
        {'code': 'HK', 'name': '中国香港', 'file': 'hk.html'},
        {'code': 'TW', 'name': '中国台湾', 'file': 'tw.html'}
    ]
    
    # 先更新 index.html
    update_index_html(current_time)
    
    for region in regions:
        print(f"正在获取{region['name']}地区的热门视频...")
        videos = get_trending_videos(api_key, region['code'], region['name'])
        
        if videos:
            print(f"成功获取到 {len(videos)} 个{region['name']}视频")
            generate_html(videos, 'template.html', region['file'])
            print(f"已生成 {region['file']}")
        else:
            print(f"未能获取到{region['name']}地区的视频")

if __name__ == '__main__':
    main()
