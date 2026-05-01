import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './src/models/User';

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const count = await User.countDocuments();
    console.log(`Total users: ${count}`);
    const users = await User.find().limit(5).select('email isVerified');
    console.log('Last 5 users:', users);
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkUsers();
