import { connectDB, disconnectDB } from '../db/client';
import { User, Task } from '../models';

jest.mock('../services/llm');

// SAFETY CHECK: Make sure we're in test environment
beforeAll(async () => {
  // Verify we're using test database
  const dbUrl = process.env.MONGO_TEST_URI || '';

  if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'test') {
    throw new Error('❌ Tests must run with NODE_ENV=test! Aborting to protect dev database.');
  }

  // Additional safety: check if dbUrl looks like a test database
  // (You can customize this check based on your naming convention)
  if (!dbUrl.includes('test') && process.env.NODE_ENV === 'test') {
    console.warn('⚠️  WARNING: dbUrl does not contain "test" - are you sure this is your test database?');
    console.warn('    Current dbUrl:', dbUrl.substring(0, 50) + '...');
    console.warn('    Waiting 3 seconds before proceeding...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  await connectDB();
  console.log('🧪 Test database connected');
  console.log('   Using dbUrl:', dbUrl.substring(0, 50) + '...');
});

// Clean up after EACH test
afterEach(async () => {
  // Only clean up if we're definitely in test mode
  if (process.env.NODE_ENV === 'test') {
    // Delete in correct order (children first, then parents)
    await Task.deleteMany({});
    await User.deleteMany({});
  }
});

// Disconnect after ALL tests
afterAll(async () => {
  await disconnectDB();
  console.log('🧪 Test database disconnected');
});
