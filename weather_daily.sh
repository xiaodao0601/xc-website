#!/bin/bash

# 天气获取
WEATHER_DONGGUAN=$(curl -s "wttr.in/东莞石排?format=%c+%t")
WEATHER_LAOJIA=$(curl -s "wttr.in/贺州钟山?format=%c+%t")

# 读取access_token
TOKEN=$(cat /root/.openclaw/config.json | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# 发送消息
curl -s "https://api.openclaw.ai/v1/messages/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "openclaw-weixin",
    "to": "o9cq80_xlou3xrofGl_IF14cwiig@im.wechat",
    "message": "早安小道～☀️ 新的一天来啦！\n\n今天的天气：\n\n📍 东莞石排：'"$WEATHER_DONGGUAN"'\n\n🏠 广西钟山：'"$WEATHER_LAOJIA"'\n\n记得带伞、多喝水哦～爱你！💕"
  }'