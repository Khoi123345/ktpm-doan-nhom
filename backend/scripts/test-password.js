import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../src/models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore';

async function testAdminPassword() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        
        const admin = await User.findOne({ email: 'admin@bookstore.com' }).select('+password');
        
        if (!admin) {
            console.log('❌ Admin not found');
            return;
        }
        
        console.log('Admin user found:');
        console.log('  Email:', admin.email);
        console.log('  Role:', admin.role);
        console.log('  Has password hash:', !!admin.password);
        console.log('  Password hash length:', admin.password?.length);
        
        // Test password
        const testPassword = 'Test123!';
        console.log('\nTesting password:', testPassword);
        
        const isMatch = await bcrypt.compare(testPassword, admin.password);
        console.log('Password match result:', isMatch);
        
        if (isMatch) {
            console.log('✅ Password is CORRECT!');
        } else {
            console.log('❌ Password is WRONG!');
            console.log('\nTrying to create new hash for comparison...');
            const salt = await bcrypt.genSalt(10);
            const newHash = await bcrypt.hash(testPassword, salt);
            console.log('New hash:', newHash);
            const newMatch = await bcrypt.compare(testPassword, newHash);
            console.log('New hash works:', newMatch);
        }
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testAdminPassword();
