require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: { type: String, lowercase: true, trim: true },
  password: { type: String }
});

UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('UserTest', UserSchema);

async function testAuth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const email = 'test-' + Date.now() + '@example.com';
    const password = 'password123';
    
    console.log(`Creating user: ${email}`);
    const user = await User.create({ email, password });
    console.log('User created. Hashed password:', user.password);
    
    const isMatch = await user.comparePassword(password);
    console.log('Password match test:', isMatch);
    
    const isMatchWrong = await user.comparePassword('wrongpassword');
    console.log('Wrong password test (should be false):', isMatchWrong);
    
    await User.deleteOne({ _id: user._id });
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

testAuth();
