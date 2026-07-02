const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

module.exports = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (e) {
    console.error('MongoDB error:', e.message);

    if (e.message.includes('querySrv')) {
      console.error('MongoDB SRV DNS ishlamadi.');
      console.error('Tekshiring: Atlas Network Access IP whitelist, internet/DNS yoki DB_URI.');
      console.error("Tezkor yechim: Atlas > Network Access > Add IP Address > 0.0.0.0/0 qo'shing.");
    }

    if (e.message.includes("isn't whitelisted") || e.message.includes('IP whitelist')) {
      console.error("MongoDB Atlas sizning IP manzilingizga ruxsat bermayapti.");
      console.error("Atlas > Network Access > Add IP Address > Add Current IP Address ni bosing.");
      console.error("Test uchun vaqtincha 0.0.0.0/0 qo'shsangiz ham bo'ladi.");
    }

    process.exit(1);
  }
};
