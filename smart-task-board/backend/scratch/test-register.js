require('dotenv').config();
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  password: { type: String },
  isVerified: Boolean,
  verificationToken: String,
  verificationExpires: Date
});
const User = mongoose.model('User', UserSchema);

async function testRegister() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = 'test-' + Date.now() + '@example.com';
    console.log(`Attempting to register: ${email}`);
    
    const user = await User.create({
      name: 'Test User',
      email: email,
      password: 'password123',
      isVerified: false
    });
    console.log('Registration success:', user._id);
    
    await User.deleteOne({ _id: user._id });
    await mongoose.disconnect();
  } catch (err) {
    console.error('Registration error:', err);
    process.exit(1);
  }
}

testRegister();
