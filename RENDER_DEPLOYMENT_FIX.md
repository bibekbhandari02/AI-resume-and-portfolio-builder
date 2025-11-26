# Fix CORS Issue on Render Deployment

## Problem
Your frontend at `https://portfolio-builder-client-9ejw.onrender.com` cannot connect to your backend at `https://portfolio-builder-api.onrender.com` due to CORS policy.

## Solution

### 1. Update Backend Environment Variables on Render

Go to your **backend service** on Render dashboard and add/update these environment variables:

```
CLIENT_URL=https://portfolio-builder-client-9ejw.onrender.com
NODE_ENV=production
```

### 2. Update Frontend Environment Variables on Render

Go to your **frontend service** on Render dashboard and add this environment variable:

```
VITE_API_URL=https://portfolio-builder-api.onrender.com/api
```

### 3. Redeploy Both Services

After setting the environment variables:
1. Redeploy your backend service (it should auto-deploy after env var change)
2. Redeploy your frontend service (it should auto-deploy after env var change)

### 4. Verify the Fix

After redeployment:
1. Go to `https://portfolio-builder-client-9ejw.onrender.com/login`
2. Try to login
3. Check browser console - CORS error should be gone

## What We Fixed in the Code

### Backend (server/index.js)
- Updated CORS configuration to accept multiple origins
- Added your production frontend URL to allowed origins
- Made it more flexible for development and production

### The CORS Configuration Now Allows:
- `http://localhost:5173` (local development)
- `http://localhost:3000` (alternative local port)
- `https://portfolio-builder-client-9ejw.onrender.com` (your production frontend)
- Any URL set in `CLIENT_URL` environment variable

## Important Notes

1. **Never commit .env files** - They contain sensitive information
2. **Always set environment variables in Render dashboard** - Don't rely on .env files in production
3. **Both services need to be redeployed** after environment variable changes
4. **Check Render logs** if issues persist - Go to your service → Logs tab

## Testing Locally

To test the same setup locally:

1. Create `client/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

2. Update `server/.env`:
```
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

3. Restart both servers

## Troubleshooting

If CORS error persists:

1. **Check Render Logs**:
   - Go to backend service → Logs
   - Look for "Blocked origin:" messages
   - Verify the CLIENT_URL is logged correctly on startup

2. **Verify Environment Variables**:
   - Backend: Check that CLIENT_URL is set to your frontend URL
   - Frontend: Check that VITE_API_URL is set to your backend URL

3. **Clear Browser Cache**:
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Or open in incognito/private window

4. **Check Network Tab**:
   - Open browser DevTools → Network tab
   - Look at the failed request
   - Check the request headers and response

## Additional Render Configuration

Make sure your `render.yaml` has the correct build commands:

### Backend Service:
```yaml
- type: web
  name: portfolio-builder-api
  env: node
  buildCommand: cd server && npm install
  startCommand: cd server && npm start
```

### Frontend Service:
```yaml
- type: web
  name: portfolio-builder-client
  env: static
  buildCommand: cd client && npm install && npm run build
  staticPublishPath: ./client/dist
```
