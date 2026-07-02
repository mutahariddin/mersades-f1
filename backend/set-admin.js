require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

(async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('📡 MongoDB connected');
    
    const user = await User.findOne({ email: 'admin@merc-store.com' });
    if (!user) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }
    
    user.role = 'admin';
    await user.save();
    console.log('✅ Admin role set for:', user.email);
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
