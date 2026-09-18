#!/usr/bin/env bash
# Encode the ten loops into desktop (1080p), phone (720p) and poster tiers.
set -e
SRC=/root/hunt/top; OUT=/tmp/claude-0/-root-hunt-top/b39c86d2-5584-4c4f-8036-ef85751ad6c4/scratchpad/enc/out; mkdir -p "$OUT"
# name:start:duration:crf1080:crf720  (trimmed to 8-15 s at clean points; sunset drive gets a crossfade seam)
CLIPS="pixel-cyberpunk-city:0:12:24:26 anime-town-rainfall:8:12:25:27 cyberpunk-bedroom:0:10:24:26 hornet-and-the-knight:0:12:24:26 elden-ring-pixel:0:10:24:26 planet-and-moon:0:15:24:26 ultrakill-heaven-sent:0:12:24:26 fallen-knight-blossom-field:0:10:26:28 rest-kingdom-come-deliverance:0:12:26:28"
for spec in $CLIPS; do IFS=: read n ss dur c1 c2 <<< "$spec"; in="$SRC/$n.1920x1080.mp4"
  ffmpeg -v error -y -ss $ss -t $dur -i "$in" -an -vf "fps=30,format=yuv420p" -c:v libx264 -preset slow -crf $c1 -profile:v high -level 4.0 -g 60 -keyint_min 60 -sc_threshold 0 -movflags +faststart "$OUT/$n-1080.mp4"
  ffmpeg -v error -y -ss $ss -t $dur -i "$in" -an -vf "fps=30,scale=-2:720,format=yuv420p" -c:v libx264 -preset slow -crf $c2 -profile:v main -level 3.1 -g 60 -keyint_min 60 -sc_threshold 0 -movflags +faststart "$OUT/$n-720.mp4"
  ffmpeg -v error -y -ss $ss -i "$in" -frames:v 1 -vf "scale=1280:-2" -c:v libwebp -quality 80 "$OUT/$n-poster.webp"
done
# sunset drive: crossfade the last second into the first so the loop seam disappears (16 s source -> 12 s loop)
n=the-drive-on-the-road-at-sunset; in="$SRC/$n.1920x1080.mp4"
ffmpeg -v error -y -i "$in" -an -filter_complex "[0:v]fps=30,trim=0:13,setpts=PTS-STARTPTS[a];[0:v]fps=30,trim=13:14,setpts=PTS-STARTPTS[b];[b][a]xfade=transition=fade:duration=1:offset=0,format=yuv420p[v]" -map "[v]" -c:v libx264 -preset slow -crf 24 -profile:v high -level 4.0 -g 60 -keyint_min 60 -sc_threshold 0 -movflags +faststart "$OUT/$n-1080.mp4"
ffmpeg -v error -y -i "$OUT/$n-1080.mp4" -an -vf "scale=-2:720,format=yuv420p" -c:v libx264 -preset slow -crf 26 -profile:v main -level 3.1 -g 60 -keyint_min 60 -sc_threshold 0 -movflags +faststart "$OUT/$n-720.mp4"
ffmpeg -v error -y -i "$OUT/$n-1080.mp4" -frames:v 1 -vf "scale=1280:-2" -c:v libwebp -quality 80 "$OUT/$n-poster.webp"
# the book's cover-art loop: 960 px, 8 s
ffmpeg -v error -y -ss 8 -t 8 -i "$SRC/anime-town-rainfall.1920x1080.mp4" -an -vf "fps=24,scale=960:-2,format=yuv420p" -c:v libx264 -preset slow -crf 30 -profile:v main -movflags +faststart "$OUT/anime-town-rainfall-cover.mp4"
ls -la "$OUT" | awk '{print $5, $9}' | sort -k2
echo DONE
