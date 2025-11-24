import mongoose from 'mongoose';
import { User, Task } from './models';

async function checkDatabase(url: string, name: string) {
  try {
    await mongoose.connect(url);
    console.log(`\n📊 ${name}:`);

    const users = await User.find();
    const tasks = await Task.find();

    console.log(`  Users: ${users.length}`);
    console.log(`  Tasks: ${tasks.length}`);

    if (tasks.length > 0) {
      console.log(`  Task titles:`, tasks.map((t) => t.title));
    }
  } catch (error: any) {
    console.log(`\n❌ ${name}: Error - ${error.message}`);
  } finally {
    await mongoose.disconnect();
  }
}

// Check database
const devUrl = process.env.MONGO_URI || 'not set';

console.log('🔍 Checking MongoDB database...');
checkDatabase(devUrl, 'MongoDB Database (from .env)');
