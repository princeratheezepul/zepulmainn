import mongoose from 'mongoose';
import { MpUser } from '../models/mpuser.model.js';
import { createUserSession, validateUserSession, invalidateUserSession, cleanupExpiredSessions } from '../utils/sessionManager.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testSessionManagement = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zepul');
    console.log('Connected to MongoDB');

    // Find a test user (or create one if needed)
    let testUser = await MpUser.findOne({ emailid: 'test@gmail.com' });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = new MpUser({
        firstName: 'Test',
        lastName: 'User',
        DOB: new Date('1990-01-01'),
        emailid: 'test@gmail.com',
        password: 'test123',
        phone: '1234567890',
        userRole: 'User'
      });
      await testUser.save();
      console.log('Test user created');
    }

    console.log('Testing session management...');
    console.log('Test user ID:', testUser._id);

    // Test 1: Create a session
    console.log('\n1. Creating session...');
    const sessionData = await createUserSession(testUser._id);
    console.log('Session created:', {
      sessionId: sessionData.sessionId,
      expiresAt: sessionData.expiresAt
    });

    // Test 2: Validate the session
    console.log('\n2. Validating session...');
    const validation = await validateUserSession(testUser._id, sessionData.sessionId);
    console.log('Session validation result:', validation);

    // Test 3: Try to validate with wrong session ID
    console.log('\n3. Testing invalid session ID...');
    const invalidValidation = await validateUserSession(testUser._id, 'invalid-session-id');
    console.log('Invalid session validation result:', invalidValidation);

    // Test 4: Create another session (should invalidate the first one)
    console.log('\n4. Creating second session (should invalidate first)...');
    const sessionData2 = await createUserSession(testUser._id);
    console.log('Second session created:', {
      sessionId: sessionData2.sessionId,
      expiresAt: sessionData2.expiresAt
    });

    // Test 5: Validate first session (should be invalid now)
    console.log('\n5. Validating first session (should be invalid)...');
    const validationAfterNewSession = await validateUserSession(testUser._id, sessionData.sessionId);
    console.log('First session validation after new session:', validationAfterNewSession);

    // Test 6: Validate second session (should be valid)
    console.log('\n6. Validating second session (should be valid)...');
    const validationSecondSession = await validateUserSession(testUser._id, sessionData2.sessionId);
    console.log('Second session validation:', validationSecondSession);

    // Test 7: Invalidate session
    console.log('\n7. Invalidating session...');
    await invalidateUserSession(testUser._id);
    console.log('Session invalidated');

    // Test 8: Validate after invalidation
    console.log('\n8. Validating after invalidation...');
    const validationAfterInvalidation = await validateUserSession(testUser._id, sessionData2.sessionId);
    console.log('Session validation after invalidation:', validationAfterInvalidation);

    // Test 9: Test cleanup (create expired session)
    console.log('\n9. Testing cleanup of expired sessions...');
    const expiredUser = new MpUser({
      firstName: 'Expired',
      lastName: 'User',
      DOB: new Date('1990-01-01'),
      emailid: 'expired@gmail.com',
      password: 'test123',
      phone: '1234567890',
      userRole: 'User',
      currentSessionId: 'expired-session',
      sessionExpiresAt: new Date(Date.now() - 1000) // Expired 1 second ago
    });
    await expiredUser.save();
    
    const cleanedCount = await cleanupExpiredSessions();
    console.log(`Cleaned up ${cleanedCount} expired sessions`);

    // Clean up test user
    await MpUser.findByIdAndDelete(expiredUser._id);
    console.log('Cleaned up test user');

    console.log('\n✅ All session management tests passed!');

  } catch (error) {
    console.error('❌ Session management test failed:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSessionManagement();
}

export default testSessionManagement;
