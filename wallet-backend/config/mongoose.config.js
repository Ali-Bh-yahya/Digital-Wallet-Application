// config/mongoose.config.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import  User  from '../models/wallet.models.js';

dotenv.config();

// Optional sane defaults
const dbName = process.env.DB || 'walletDB';
const username = process.env.ATLAS_USERNAME;
const password = encodeURIComponent(process.env.ATLAS_PASSWORD || '');
const uri = `mongodb+srv://${username}:${password}@cluster0.zj8ys.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

// --- Define the admin-creation function BEFORE using it ---
async function createAdminUserIfNotExists() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@wallet.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Warn if using default weak credentials
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.warn('WARNING: Using default admin credentials. Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env for production!');
    }

    // Look for existing admin by email
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Admin',
        email: adminEmail,
        password: adminPassword, // will be hashed by UserSchema.pre('save')
        phone: '0000000000',
        idNumber: 'ADMIN000',
        role: 'admin',
        status: 'active'
      });

      await adminUser.save(); // pre-save hook in wallet.models will hash password
      console.log('Admin user created with email:', adminEmail);
    } else {
      console.log('Admin user already exists with email:', adminEmail);
    }
  } catch (err) {
    // If a duplicate-key error happens because of race conditions, handle it gracefully:
    if (err.code === 11000) {
      console.log('Admin user creation attempted but another process created it first (duplicate key).');
    } else {
      console.error('Error creating admin user:', err);
    }
  }
}

// --- Connect to MongoDB and then attempt admin creation ---
mongoose.connect(uri)
  .then(async () => {
    console.log('Established a connection to the database');
    await createAdminUserIfNotExists(); 
  })
  .catch(err => console.error('Something went wrong when connecting to the database', err));
