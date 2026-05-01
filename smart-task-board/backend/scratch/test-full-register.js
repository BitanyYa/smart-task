require('dotenv').config();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  password: { type: String }
});
const User = mongoose.model('UserTest2', UserSchema);

const RefreshTokenSchema = new mongoose.Schema({
  token: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserTest2' },
  expiresAt: Date
});
const RefreshToken = mongoose.model('RefreshTokenTest2', RefreshTokenSchema);

async function testFullRegister() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = 'test-full-' + Date.now() + '@example.com';
    
    console.log('1. Creating user...');
    const user = await User.create({
      name: 'Full Test',
      email: email,
      password: 'password123'
    });
    console.log('User created:', user._id);
    
    console.log('2. Creating refresh token...');
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ token, user: user._id, expiresAt });
    console.log('Refresh token created.');
    
    await RefreshToken.deleteOne({ token });
    await User.deleteOne({ _id: user._id });
    await mongoose.disconnect();
    console.log('Full test success!');
  } catch (err) {
    console.error('Full test error:', err);
    process.exit(1);
  }
}

testFullRegister();
