# Command Reference for Event Slider App

This document describes all the commands available in the Event Slider application. Commands can be sent via:

1. WebSocket interface (see WEBSOCKET.md for details)
2. Browser console commands

## WebSocket Commands

### Video and Audio Commands

#### YouTube Video

Show a YouTube video in a popup:

```json
{
  "type": "video",
  "action": "youtube",
  "args": {
    "videoId": "YOUTUBE_VIDEO_ID"
  }
}
```

#### YouTube Audio Only

Play audio from a YouTube video without showing the video:

```json
{
  "type": "audio",
  "action": "youtube-audio",
  "args": {
    "videoId": "YOUTUBE_VIDEO_ID"
  }
}
```

#### Volume Controls

Set the audio volume level (0-1):

```json
{
  "type": "audio",
  "action": "volume",
  "args": {
    "level": 0.7
  }
}
```

Increase the volume by 10%:

```json
{
  "type": "audio",
  "action": "volume-up"
}
```

Decrease the volume by 10%:

```json
{
  "type": "audio",
  "action": "volume-down"
}
```

Close the audio player:

```json
{
  "type": "audio",
  "action": "close"
}
```

#### Direct Video URL

Show a video from a direct URL:

```json
{
  "type": "video",
  "action": "url",
  "args": {
    "url": "https://example.com/video.mp4"
  }
}
```

#### Direct Audio URL

Play audio from a direct URL:

```json
{
  "type": "audio",
  "action": "url-audio",
  "args": {
    "url": "https://example.com/audio.mp3"
  }
}
```

#### Close Video

Close any open video popups:

```json
{
  "type": "video",
  "action": "close"
}
```

### Livestream Commands

#### YouTube Livestream

Show a YouTube livestream in a popup:

```json
{
  "type": "stream",
  "action": "youtube",
  "args": {
    "channelId": "CHANNEL_ID"
  }
}
```

#### Close Livestream

Close any open livestream popups:

```json
{
  "type": "stream",
  "action": "close"
}
```

### Time-of-Day Commands

#### Set Time by Name

Set the time of day to a preset:

```json
{
  "type": "time",
  "action": "set",
  "args": {
    "name": "noon"
  }
}
```

Available presets: `dawn`, `morning`, `noon`, `afternoon`, `dusk`, `night`, `midnight`

#### Set Time by Value

Set the time of day to a specific value (0-1):

```json
{
  "type": "time",
  "action": "set",
  "args": {
    "value": 0.5
  }
}
```

### Alert Commands

#### Show Alert

Show an alert message:

```json
{
  "type": "alert",
  "action": "show",
  "args": {
    "message": "Hello world!",
    "type": "info"
  }
}
```

Alert types: `info`, `success`, `warning`, `error`

#### Custom Alert

Show a custom alert with more options:

```json
{
  "type": "alert",
  "action": "custom",
  "args": {
    "message": "Custom alert message",
    "type": "warning"
  }
}
```

### Scroll Commands

#### Start/Stop Scrolling

Control scrolling behavior:

```json
{
  "type": "scroll",
  "action": "start"
}
```

```json
{
  "type": "scroll",
  "action": "stop"
}
```

#### Set Scroll Speed

Set the scrolling speed:

```json
{
  "type": "scroll",
  "action": "speed",
  "args": {
    "value": 2
  }
}
```

### Debug Commands

#### Toggle Debug Info

Show/hide debug information:

```json
{
  "type": "debug",
  "action": "toggle"
}
```

## Browser Console Commands

All WebSocket commands can also be executed directly in the browser console using:

```javascript
window.game.scene.scenes[0].commandSystem.executeCommand("command-name", { args });
```

For example:

```javascript
// Time commands
window.game.scene.scenes[0].commandSystem.executeCommand("noon");
window.game.scene.scenes[0].commandSystem.executeCommand("time", { time: "sunset" });

// Show an alert
window.game.scene.scenes[0].commandSystem.executeCommand("alert", { message: "Hello world!", type: "info" });
window.game.scene.scenes[0].commandSystem.executeCommand("alert", { preset: "emergency" });

// Video commands
window.game.scene.scenes[0].commandSystem.executeCommand("youtube", { videoId: "VIDEO_ID" });
window.game.scene.scenes[0].commandSystem.executeCommand("video-url", { url: "https://example.com/video.mp4" });

// Audio commands
window.game.scene.scenes[0].commandSystem.executeCommand("youtube-audio", { videoId: "VIDEO_ID" });
window.game.scene.scenes[0].commandSystem.executeCommand("url-audio", { url: "https://example.com/audio.mp3" });
window.game.scene.scenes[0].commandSystem.executeCommand("volume", { level: 0.5 });
window.game.scene.scenes[0].commandSystem.executeCommand("volume-up");
window.game.scene.scenes[0].commandSystem.executeCommand("volume-down");
window.game.scene.scenes[0].commandSystem.executeCommand("close-audio");
```
