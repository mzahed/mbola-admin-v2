# Troubleshooting Login Issues

## "Network Error" Fix

If you're getting "Network Error", try these steps:

### 1. Check API URL

Open browser console and check:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL);
```

Should show: `https://mbola.org/applications/api`

### 2. Test API Directly

Open in browser:
```
https://mbola.org/applications/api/test
```

Should return: `{"success":true,"message":"API is working!","timestamp":"..."}`

### 3. Check Browser Console

1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for detailed error messages
4. Check **Network** tab for the `/api/login` request

### 4. Common Issues

#### CORS Error
**Symptom**: Console shows CORS error
**Fix**: Already configured in `api.php` - should work now

#### 404 Not Found
**Symptom**: Network tab shows 404
**Fix**: Routes are configured - should work now

#### Network Error (No Response)
**Symptom**: Request fails before reaching server
**Possible causes**:
- Internet connection issue
- Firewall blocking request
- API URL incorrect

**Fix**: 
1. Check `.env.local` has correct URL
2. Restart dev server: `npm run dev`
3. Clear browser cache

### 5. Test with curl

```bash
curl -X POST https://mbola.org/applications/api/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3001" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

### 6. Check Network Tab Details

1. Open DevTools → Network tab
2. Try logging in
3. Click on the `/api/login` request
4. Check:
   - **Status**: Should be 200 (not 404, 500, or CORS error)
   - **Request URL**: Should be `https://mbola.org/applications/api/login`
   - **Request Headers**: Should include `Content-Type: application/json`
   - **Request Payload**: Should have `email` and `password`
   - **Response**: Should be JSON

### 7. Verify API Controller

The API controller should be at:
```
applications/application/controllers/api.php
```

And routes should be configured in:
```
applications/application/config/routes.php
```

### 8. Restart Everything

```bash
# Stop dev server (Ctrl+C)
# Then restart
cd admin-v2
npm run dev
```

### 9. Check PHP Error Logs

On DreamHost, check PHP error logs for any backend errors.

## Still Not Working?

Share these details:
1. Browser console errors (screenshot or copy text)
2. Network tab - click on `/api/login` request and share:
   - Status code
   - Request URL
   - Response body
3. What happens when you click "Test API Connection" button?
