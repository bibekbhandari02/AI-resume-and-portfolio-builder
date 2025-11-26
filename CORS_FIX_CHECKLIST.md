# CORS Fix Checklist - Step by Step

## ✅ Step 1: Commit and Push Updated Code

The code has been updated with better CORS handling. You need to push it to GitHub:

```bash
git add .
git commit -m "Fix CORS configuration for production"
git push origin main
```

## ✅ Step 2: Set Environment Variables on Render

### Backend Service (portfolio-builder-api):

1. Go to https://dashboard.render.com
2. Click on your **backend service** (portfolio-builder-api)
3. Click **Environment** tab on the left
4. Add this environment variable:
   - Key: `CLIENT_URL`
   - Value: `https://portfolio-builder-client-9ejw.onrender.com`
5. Click **Save Changes**

### Frontend Service (portfolio-builder-client):

1. Click on your **frontend service** (portfolio-builder-client)
2. Click **Environment** tab on the left
3. Add this environment variable:
   - Key: `VITE_API_URL`
   - Value: `https://portfolio-builder-api.onrender.com/api`
4. Click **Save Changes**

## ✅ Step 3: Wait for Auto-Deploy

After pushing code and setting environment variables:
- Render will automatically detect the changes
- Both services will redeploy (this takes 2-5 minutes)
- Watch the **Logs** tab to see deployment progress

## ✅ Step 4: Check Backend Logs

Once backend is deployed:

1. Go to backend service → **Logs** tab
2. Look for this line:
   ```
   Allowed CORS origins: [ 'http://localhost:5173', 'http://localhost:3000', 'https://portfolio-builder-client-9ejw.onrender.com', 'https://portfolio-builder-client-9ejw.onrender.com' ]
   ```
3. Make sure your frontend URL is in the list

## ✅ Step 5: Test the Login

1. Go to: `https://portfolio-builder-client-9ejw.onrender.com/login`
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Try to login
5. Check for CORS errors

### If Login Works:
✅ You're done! The CORS issue is fixed.

### If CORS Error Still Appears:

Check the backend logs for:
- `✅ Allowed origin: https://portfolio-builder-client-9ejw.onrender.com`
- OR `❌ Blocked origin: https://portfolio-builder-client-9ejw.onrender.com`

## 🔍 Troubleshooting

### Issue: Backend logs show "Blocked origin"

**Solution:** The CLIENT_URL environment variable might not be set correctly.
- Double-check the environment variable in Render dashboard
- Make sure there are no extra spaces or typos
- Redeploy the backend service manually

### Issue: No logs about origins at all

**Solution:** The new code hasn't been deployed yet.
- Check if the latest commit is deployed
- Manually trigger a deploy: Click "Manual Deploy" → "Deploy latest commit"

### Issue: Frontend can't reach backend at all

**Solution:** Check the VITE_API_URL
- Make sure it's set to: `https://portfolio-builder-api.onrender.com/api`
- Note: It must include `/api` at the end
- Redeploy the frontend service

### Issue: "ERR_FAILED" in network tab

**Solution:** Backend might be sleeping (Render free tier)
- Visit `https://portfolio-builder-api.onrender.com/health` directly
- Wait 30-60 seconds for it to wake up
- Try login again

## 📝 What Changed in the Code

1. **Added logging** to see which origins are allowed/blocked
2. **Added explicit OPTIONS handler** for preflight requests
3. **Added more CORS headers** for better compatibility
4. **Hardcoded your production URL** as a fallback

## 🎯 Expected Result

After following all steps, you should see:
- ✅ No CORS errors in browser console
- ✅ Login works successfully
- ✅ Backend logs show "✅ Allowed origin: https://portfolio-builder-client-9ejw.onrender.com"

## 🆘 Still Not Working?

If you've followed all steps and it still doesn't work, check:

1. **Is the backend running?**
   - Visit: `https://portfolio-builder-api.onrender.com/health`
   - Should return: `{"status":"ok","message":"Server is running"}`

2. **Is the frontend using the correct API URL?**
   - Open browser DevTools → Network tab
   - Try to login
   - Check the request URL - should be `https://portfolio-builder-api.onrender.com/api/auth/login`

3. **Are both services on the same Render account?**
   - They should be in the same dashboard

4. **Check Render service status**
   - Sometimes Render has outages
   - Check: https://status.render.com/
