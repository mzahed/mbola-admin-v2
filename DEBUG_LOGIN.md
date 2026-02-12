# Debugging Login Issues

## Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try logging in
4. Look for any errors

## Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try logging in
4. Look for the `/api/login` request
5. Click on it to see:
   - **Request URL**: Should be `https://mbola.org/applications/api/login`
   - **Request Method**: Should be `POST`
   - **Request Payload**: Should have `email` and `password`
   - **Response**: Check the response body

## Test API Directly

Open this URL in your browser (replace with your credentials):
```
https://mbola.org/applications/api/login
```

Or use curl:
```bash
curl -X POST https://mbola.org/applications/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

## Common Issues

### 1. CORS Error
**Symptom**: Browser console shows CORS error
**Solution**: Check `api.php` CORS headers are set correctly

### 2. 404 Not Found
**Symptom**: Network tab shows 404
**Solution**: 
- Check URL is correct: `https://mbola.org/applications/api/login`
- Verify `.htaccess` routing is working
- Check if CodeIgniter is routing correctly

### 3. 500 Internal Server Error
**Symptom**: Network tab shows 500
**Solution**:
- Check PHP error logs
- Verify models are loading correctly
- Check database connection

### 4. Invalid JSON Response
**Symptom**: Response is HTML instead of JSON
**Solution**:
- Check for PHP errors before JSON output
- Verify `ob_clean()` is called
- Check for any output before JSON

### 5. "Invalid email or password"
**Symptom**: Always returns this error
**Solution**:
- Check if user exists in database
- Verify email field name matches (should be `email` not `user_email`)
- Check password comparison logic

## Enable Debug Logging

Add this to `api.php` login function temporarily:

```php
error_log('Login attempt - Email: ' . $email);
error_log('User found: ' . (empty($user) ? 'NO' : 'YES'));
if (!empty($user)) {
    error_log('User data: ' . print_r($user, true));
}
```

Then check PHP error logs on DreamHost.
