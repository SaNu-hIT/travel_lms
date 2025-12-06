# MongoDB Atlas Setup Guide

## Current Status

❌ **Connection Failed** - Two issues detected:

### Issue 1: Missing Password ❌

Your current connection string:
```
mongodb+srv://sanufeliz_db_user:@lmsbeta.8aqlbpq.mongodb.net/?appName=lmsbeta
```

Notice the `:@` - there's no password between the colon and @.

**Fix:** The connection string should be:
```
mongodb+srv://sanufeliz_db_user:YOUR_PASSWORD@lmsbeta.8aqlbpq.mongodb.net/?appName=lmsbeta
```

### Issue 2: IP Whitelist ❌

MongoDB Atlas requires you to whitelist IP addresses that can connect to your cluster.

## How to Fix

### Step 1: Get Your Database Password

1. Log into [MongoDB Atlas](https://cloud.mongodb.com)
2. Go to **Database Access** (left sidebar)
3. Find user `sanufeliz_db_user`
4. Click **Edit**
5. Click **Edit Password**
6. Either:
   - Use the existing password (if you know it)
   - Generate a new password (click **Autogenerate Secure Password**)
7. **IMPORTANT:** Copy the password somewhere safe!

### Step 2: Update Your Connection String

Update `.env.local` with the password:

```env
MONGODB_URI=mongodb+srv://sanufeliz_db_user:YOUR_PASSWORD_HERE@lmsbeta.8aqlbpq.mongodb.net/lms_saas?retryWrites=true&w=majority
JWT_SECRET=super-secret-jwt-key-change-in-production-2024
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Note:** I also added:
- `/lms_saas` - the database name
- `?retryWrites=true&w=majority` - recommended connection options

### Step 3: Whitelist Your IP Address

1. In MongoDB Atlas, go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Choose one option:

   **Option A: Add Current IP (Recommended for Development)**
   - Click **Add Current IP Address**
   - Atlas will auto-detect and add your IP

   **Option B: Allow Access from Anywhere (Less Secure)**
   - Click **Allow Access from Anywhere**
   - This adds `0.0.0.0/0` (all IPs)
   - ⚠️ Only use for development/testing

4. Click **Confirm**
5. Wait 1-2 minutes for changes to propagate

## Testing the Connection

After completing the steps above:

```bash
npm run test:mongo
```

You should see:
```
✅ Successfully connected to MongoDB!
📦 Found X collections
```

## Once Connected - Seed the Database

```bash
npm run seed
```

This will create:
- 2 demo companies
- 7 users with different roles
- 7+ sample leads

## Troubleshooting

### "Bad auth: Authentication failed"
- Double-check your password
- Make sure there are no spaces in the connection string
- Ensure password special characters are URL-encoded:
  - `@` → `%40`
  - `#` → `%23`
  - `%` → `%25`
  - `&` → `%26`

### "Could not connect to any servers"
- Check IP whitelist
- Wait 1-2 minutes after adding IP
- Try "Allow Access from Anywhere" temporarily

### "Connection timeout"
- Check your internet connection
- Verify the cluster is running in Atlas
- Check if your network blocks MongoDB Atlas (some corporate networks do)

## Getting the Connection String from Atlas

If you need to get a fresh connection string:

1. In MongoDB Atlas → **Database** → Click **Connect**
2. Choose **Drivers**
3. Select **Node.js** and version **5.5 or later**
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Add `/lms_saas` before the `?` to specify the database name

Example:
```
mongodb+srv://sanufeliz_db_user:<password>@lmsbeta.8aqlbpq.mongodb.net/lms_saas?retryWrites=true&w=majority
```

## Security Best Practices

✅ **DO:**
- Use strong passwords
- Limit IP whitelist to your specific IPs
- Use database user with minimal required permissions
- Keep credentials in `.env.local` (never commit to git)

❌ **DON'T:**
- Commit `.env.local` to git
- Share your connection string publicly
- Use "Allow Access from Anywhere" in production
- Use the same password for multiple environments

## Need Help?

Run the test script to diagnose issues:
```bash
npm run test:mongo
```

The script will show:
- Current connection string (with hidden password)
- Specific error messages
- Helpful tips for common issues
