const mongoose = require('mongoose');

// Define User Schema
const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, default: () => new mongoose.Types.ObjectId() },  // Auto-generated userId
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
});

// Create User Model
const User = mongoose.model('User', userSchema);

module.exports = User;