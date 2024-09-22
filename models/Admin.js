const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// Hash password before saving the admin
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();  // Only hash if password is new or modified
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Validate the password
adminSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

// Seed default admin if it doesn't exist
async function seedDefaultAdmin() {
  try {
    const existingAdmin = await Admin.findOne({ username: 'Admin' });
    if (!existingAdmin) {
      const defaultAdmin = new Admin({ username: 'Admin', password: 'Admin@1' });
      await defaultAdmin.save();
      console.log('Default Admin user created.');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

seedDefaultAdmin();  // Automatically seed the default admin when the server starts

module.exports = Admin;
