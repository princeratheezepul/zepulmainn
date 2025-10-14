# Marketplace Session Management System

## Overview

This document describes the session management system implemented for the marketplace to prevent multiple concurrent sessions for the same user. When a user logs in from a new device/browser, any existing sessions are automatically invalidated.

## Architecture

### Backend Components

1. **MpUser Model Updates** (`server/src/models/mpuser.model.js`)
   - Added `currentSessionId`: Unique identifier for the active session
   - Added `lastLoginAt`: Timestamp of the last login
   - Added `sessionExpiresAt`: When the current session expires

2. **Session Manager** (`server/src/utils/sessionManager.js`)
   - `generateSessionId()`: Creates unique session IDs
   - `createUserSession()`: Creates new session, invalidates existing ones
   - `validateUserSession()`: Validates session ID and expiration
   - `invalidateUserSession()`: Logs out user by clearing session
   - `extendUserSession()`: Extends session expiration
   - `cleanupExpiredSessions()`: Removes expired sessions

3. **Updated Authentication Middleware** (`server/src/middleware/marketplace.auth.middleware.js`)
   - Validates session ID from JWT token
   - Checks session expiration
   - Rejects requests with invalid/expired sessions

4. **Updated Controllers** (`server/src/controllers/marketplace.controller.js`)
   - Login creates new session and invalidates existing ones
   - Logout properly invalidates session
   - JWT tokens now include session ID

### Frontend Components

1. **MarketplaceAuthContext Updates** (`client/src/context/MarketplaceAuthContext.jsx`)
   - Session monitoring every 30 seconds
   - Automatic logout on session conflicts
   - Session ID extraction from JWT tokens
   - Proper cleanup on logout

## How It Works

### Login Process

1. User submits credentials
2. Backend validates credentials
3. `createUserSession()` is called:
   - Generates new unique session ID
   - Sets `currentSessionId` in user document
   - Sets `sessionExpiresAt` to 24 hours from now
   - **Any existing session is automatically invalidated**
4. JWT token is generated with session ID
5. Frontend stores token and starts session monitoring

### Session Validation

1. Every API request includes JWT token with session ID
2. Middleware validates:
   - JWT token is valid
   - Session ID matches user's `currentSessionId`
   - Session hasn't expired
3. If validation fails, user is logged out

### Multiple Login Prevention

When User A logs in from Device 1:
- Session ID "abc123" is created and stored
- User A can use the marketplace normally

When User A logs in from Device 2:
- New session ID "def456" is created
- User's `currentSessionId` is updated to "def456"
- Device 1's session "abc123" becomes invalid
- Device 1 will be logged out on next API call or session check

### Session Monitoring

Frontend monitors sessions by:
1. Checking session validity every 30 seconds
2. Calling `/api/marketplace/validate-session` endpoint
3. If session is invalid, automatically logging out user
4. Showing notification about session conflict

## API Endpoints

### New Endpoints

- `POST /api/marketplace/logout` - Properly logout and invalidate session
- `GET /api/marketplace/validate-session` - Check if current session is valid

### Updated Endpoints

- `POST /api/marketplace/login` - Now creates session and invalidates existing ones
- `POST /api/marketplace/register` - Now creates session for new users

## Configuration

### Session Duration
- Default: 24 hours
- Configurable in `sessionManager.js`

### Monitoring Frequency
- Default: Every 30 seconds
- Configurable in `MarketplaceAuthContext.jsx`

### Cleanup Frequency
- Default: Every hour
- Configurable in `server/src/index.js`

## Testing

Run the session management test:
```bash
cd server
node src/scripts/testSessionManagement.js
```

This will test:
- Session creation
- Session validation
- Multiple session prevention
- Session invalidation
- Expired session cleanup

## Security Features

1. **Unique Session IDs**: Cryptographically secure random session IDs
2. **Automatic Expiration**: Sessions expire after 24 hours
3. **Immediate Invalidation**: New login immediately invalidates old sessions
4. **Frontend Monitoring**: Continuous session validation
5. **Server-side Cleanup**: Automatic removal of expired sessions

## Error Handling

### Session Conflicts
- User sees notification: "Your session has expired or another user has logged in with your credentials. Please login again."
- Automatic redirect to login page
- All local data is cleared

### Network Issues
- Session validation errors don't cause unnecessary logouts
- Graceful degradation when API calls fail

## Maintenance

### Manual Session Cleanup
```bash
cd server
node src/scripts/cleanupExpiredSessions.js
```

### Monitoring
- Check server logs for session cleanup messages
- Monitor session validation failures
- Track concurrent login attempts

## Migration Notes

### Existing Users
- Existing users will get sessions on their next login
- No data migration required
- Backward compatible with existing tokens (until they expire)

### Database Changes
- New fields added to MpUser model
- No breaking changes to existing functionality
- Optional fields with sensible defaults

## Troubleshooting

### Common Issues

1. **User gets logged out immediately after login**
   - Check if session ID is being properly extracted from JWT
   - Verify session validation logic

2. **Multiple sessions not being invalidated**
   - Check if `createUserSession` is being called on login
   - Verify database updates are working

3. **Session monitoring not working**
   - Check if `startSessionMonitoring` is called after login
   - Verify API endpoint `/validate-session` is accessible

### Debug Mode
Enable detailed logging by setting:
```javascript
console.log('Session validation:', validation);
console.log('Session ID:', sessionId);
```

## Future Enhancements

1. **Session History**: Track all login sessions
2. **Device Management**: Allow users to see and manage active sessions
3. **Session Notifications**: Notify users of new logins via email
4. **Configurable Timeouts**: Allow different timeout settings per user role
5. **Session Analytics**: Track session patterns and security events
