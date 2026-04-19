# HEARTBEAT.md - 定时任务处理

## 系统事件处理

当收到 `weather` 系统事件时，发送天气信息：

```bash
# 获取天气并发送早安消息
WEATHER_DONGGUAN=$(curl -s "wttr.in/东莞石排?format=%c+%t")
WEATHER_LAOJIA=$(curl -s "wttr.in/贺州钟山?format=%c+%t")

echo "早安小道～☀️ 新的一天来啦！

今天的天气：

📍 东莞石排：$WEATHER_DONGGUAN

🏠 广西钟山：$WEATHER_LAOJIA

记得带伞、多喝水哦～爱你！💕"
```

## 定时检查

每5分钟检查一次是否有待处理任务。