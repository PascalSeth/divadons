# Login Page Implementation Guide

## Overview
A luxury-themed login page has been created with Google OAuth authentication, matching the main site's design aesthetic.

## What Was Created

### Files
1. **`app/(pages)/login/page.tsx`** - Main login page component
2. **`app/(pages)/login/layout.tsx`** - Login layout (without navbar)
3. **`middleware.ts`** - Route protection and callback URL handling

### Features
✅ **Google OAuth Authentication**
- Single sign-on with Google
- Automatic account creation on first login
- Automatic registration through Google

✅ **UX Enhancements**
- Redirects to previous page after successful login (via `callbackUrl`)
- Auto-redirect if user is already authenticated
- Error handling with user-friendly messages
- Loading states for better feedback

✅ **Design**
- Two-column layout: Image + overlay text (left) and auth form (right)
- Luxury theme: Bodoni Moda + DM Sans fonts
- Matches main page color palette (#f5f1e8)
- Smooth animations with Framer Motion
- Fully responsive (mobile-optimized)

## Environment Variables Required

Make sure these are set in your `.env.local` file:

```env
NEXTAUTH_URL=http://localhost:3000  # Production: your domain
NEXTAUTH_SECRET=your-secret-key-here

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Getting Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

## How It Works

### Login Flow
1. User clicks "Continue with Google"
2. Redirected to Google's authentication
3. After consent, returns to your app
4. User is logged in
5. **Automatically redirects to the previous page they were trying to access**

### Example Redirect Paths
- User tries to visit `/admin` while not logged in
- Redirected to `/login?callbackUrl=/admin`
- After login, redirects back to `/admin`

- User visits `/login` directly from shop
- After login, redirects to `/` (home)
- Can also specify: `/login?callbackUrl=/shop/dress`

## Protected Routes

Currently protected:
- `/admin/*` - Admin dashboard

To protect additional routes, update `middleware.ts`:

```typescript
const protectedRoutes = ["/admin", "/profile", "/orders"];
```

## Authentication Exports

Available from `lib/auth.ts`:
- `getServerSession()` - Get current user session (server-side)
- `signIn()` - Manual sign-in function
- `signOut()` - Manual sign-out function
- `handlers` - NextAuth route handlers

## Usage Examples

### Check Authentication (Server Component)
```tsx
import { getServerSession } from "@/lib/auth";

export default async function Component() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }
  
  return <div>Welcome {session.user.name}</div>;
}
```

### Check Authentication (Client Component)
```tsx
'use client'

import { useSession } from "next-auth/react";

export default function Component() {
  const { data: session } = useSession();
  
  return session ? <div>Logged in: {session.user.email}</div> : <div>Not logged in</div>;
}
```

### Redirect After Login
The login page automatically handles this. Just link to `/login?callbackUrl=/your-page`:

```tsx
<a href="/login?callbackUrl=/admin">Go to Admin</a>
```

## Customization

### Change Login Path
Update `lib/auth.ts`:
```typescript
pages: {
  signIn: "/your-custom-path",
}
```

### Modify Protected Routes
Edit `middleware.ts` and update the `matcher` config

### Theme Colors
Update background color in `app/(pages)/login/page.tsx`:
```typescript
style={{ background: '#your-color' }}
```

### Add More OAuth Providers
Update `lib/auth.ts` and add more providers (GitHub, Discord, etc.)

## Database Schema

NextAuth automatically creates required tables via Prisma adapter:
- `User` - User accounts
- `Account` - OAuth connections
- `Session` - Active sessions
- `VerificationToken` - Email verification

Run migrations if needed:
```bash
npx prisma migrate dev
```

## Testing

1. **Local testing:**
   ```bash
   npm run dev
   # Visit http://localhost:3000/login
   ```

2. **Test redirect flow:**
   ```bash
   # Try accessing protected route
   http://localhost:3000/admin
   # Should redirect to /login?callbackUrl=/admin
   # After login, should return to /admin
   ```

3. **Clear session (for testing):**
   - Delete cookies in browser DevTools
   - Or sign out and sign back in

## Troubleshooting

**Issue: "getServerSession is not a function"**
- Ensure `NextAuth` import is at the top of `lib/auth.ts`
- Restart dev server

**Issue: Google login not working**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`
- Check authorized redirect URIs in Google Cloud Console
- Ensure `NEXTAUTH_SECRET` is set

**Issue: Not redirecting back to previous page**
- Check `callbackUrl` is properly passed in the URL
- Verify middleware is running (check NextAuth output)
- Check `searchParams` is being read correctly

## Next Steps

1. ✅ Set up Google OAuth credentials
2. ✅ Add environment variables
3. ✅ Test login flow locally
4. ✅ Deploy and test on production
5. Optional: Add more providers (GitHub, Discord)
6. Optional: Add email/password authentication
7. Optional: Add two-factor authentication
8. Optional: Customize user session data

## Documentation Links
- [NextAuth.js Documentation](https://authjs.dev/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
