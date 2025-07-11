# Event Slider Deployment Guide

## 🚀 Deploying to Coolify (HTTPS)

### 1. **Set Environment Variables in Coolify**

In your Coolify application settings, add this environment variable:

```bash
VITE_WSS_SERVER=wss://your-domain.com:8081
```

Replace `your-domain.com` with your actual Coolify domain.

### 2. **Example for Current Deployment**

For the current Coolify deployment:

```bash
VITE_WSS_SERVER=wss://xc0soc80sowgsocwcgw4ckko.cachevalley.co:8081
```

## 🐳 Local Development

### Docker Compose Development
```bash
# No environment variable needed - auto-detects as ws://websocket-server:8081
docker compose up
```

### Local Development (no Docker)
```bash
# No environment variable needed - auto-detects as ws://localhost:8081
npm run dev
```

## 🌐 Other Deployment Platforms

### Custom Domain
```bash
VITE_WSS_SERVER=wss://your-custom-domain.com:8081
```

### Local HTTPS Testing
```bash
VITE_WSS_SERVER=wss://localhost:8081
```

## 📝 How It Works

### Priority Order:
1. **`VITE_WSS_SERVER` environment variable** (if set) - Explicit configuration
2. **Auto-detection** (if not set):
   - `localhost`/`127.0.0.1` → `ws://localhost:8081`
   - Any other host → `ws://websocket-server:8081` (Docker networking)

### Examples:
```javascript
// Coolify with VITE_WSS_SERVER set:
// → wss://xc0soc80sowgsocwcgw4ckko.cachevalley.co:8081

// Local development:
// → ws://localhost:8081

// Docker without VITE_WSS_SERVER:
// → ws://websocket-server:8081 (uses Docker internal networking)
```

## 🔧 Troubleshooting

### WebSocket Connection Issues

1. **Check Console Logs**: Look for WebSocket connection messages
2. **Verify Environment Variable**: Ensure `VITE_WSS_SERVER` is set correctly
3. **Protocol Mismatch**: HTTPS sites need `wss://`, HTTP sites need `ws://`
4. **Port Access**: Ensure port 8081 is accessible on your deployment

### Common Fixes

```bash
# For HTTPS deployments (Coolify, production):
VITE_WSS_SERVER=wss://your-domain.com:8081

# For HTTP deployments:
VITE_WSS_SERVER=ws://your-domain.com:8081

# For local development with HTTPS:
VITE_WSS_SERVER=wss://localhost:8081
```

## 🎯 Quick Setup for Coolify

1. **Set Environment Variable**:
   ```bash
   VITE_WSS_SERVER=wss://YOUR_COOLIFY_DOMAIN:8081
   ```

2. **Deploy**: Push to Git - Coolify will auto-deploy

3. **Test**: Open browser console and look for:
   ```
   📡 Using configured WebSocket URL: wss://YOUR_DOMAIN:8081
   ✅ WebSocket connected successfully
   ```

That's it! 🎉
