const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedUsers = async () => {
    try {
        console.log('🚀 Starting User Seeding...');
        
        // Check if admin exists
        const adminExists = await User.findOne({ email: 'admin@aurelia.com' });
        
        if (adminExists) {
            console.log('ℹ️  Admin user already exists. Updating password to "admin123"...');
            adminExists.password = 'admin123';
            await adminExists.save();
            console.log('✅ Admin password reset.');
        } else {
            await User.create({
                name: 'Aurelia Admin',
                email: 'admin@aurelia.com',
                password: 'admin123',
                role: 'admin',
                phone: '+84 898 123 456',
                address: 'Aurelia Prada Store, Hanoi',
                gender: 'other'
            });
            console.log('✅ Admin user created (Email: admin@aurelia.com / Pass: admin123).');
        }

        // Optional: Test user
        const userExists = await User.findOne({ email: 'user@example.com' });
        if (!userExists) {
            await User.create({
                name: 'Test User',
                email: 'user@example.com',
                password: 'password123',
                role: 'user',
                phone: '+84 123 456 789'
            });
            console.log('✅ Test user created.');
        }

        console.log('🌟 User seeding completed successfully.');
        process.exit();
    } catch (error) {
        console.error(`❌ Error during user seeding: ${error.message}`);
        process.exit(1);
    }
};

seedUsers();
