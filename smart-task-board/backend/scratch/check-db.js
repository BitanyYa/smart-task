require('dotenv').config();
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: String,
  isVerified: Boolean
});
const User = mongoose.model('User', UserSchema);

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await User.countDocuments();
    console.log(`Total users: ${count}`);
    const users = await User.find().limit(5).select('email isVerified');
    console.log('Last 5 users:', JSON.stringify(users, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
