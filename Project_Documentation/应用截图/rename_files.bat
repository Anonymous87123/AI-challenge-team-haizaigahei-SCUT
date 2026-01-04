@echo off
chcp 65001
cd /d "%~dp0"

echo 正在重命名截图文件...

:: 重命名文件使用通配符
ren 智能对话*.png chat_demo.png
ren 校园墙帖子*.png wall_posts.png
ren 评论*.png comment_emoji.png
ren 发现*.png discover_friends.png
ren 成长*雷达*.png growth_radar.png
ren 成长*目标*.png growth_progress.png
ren 消费分析*.png expense_analysis.png
ren 消费记录*.png expense_records.png
ren 天气*.png weather.png
ren 校车*.png bus_schedule.png
ren 场馆*.png venue_hours.png
ren 通知*.png notifications.png
ren 公益*.png donation_list.png
ren 捐赠成功*.png donation_success.png
ren 捐赠记录*.png donation_history.png
ren 二手*.png marketplace.png
ren 夜光*.png dark_mode.png
ren 帖子评论*.png comment_reply.png

echo 重命名完成！
pause