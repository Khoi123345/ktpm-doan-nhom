import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import User from '../src/models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore';

async function checkAdminUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Find admin user
        const adminUser = await User.findOne({ email: 'admin@bookstore.com' });
        
        if (!adminUser) {
            console.log('❌ Admin user not found!');
        } else {
            console.log('✅ Admin user found:');
            console.log('   Email:', adminUser.email);
            console.log('   Name:', adminUser.name);
            console.log('   Role:', adminUser.role);
            console.log('   ID:', adminUser._id);
            
            if (adminUser.role === 'admin') {
                console.log('✅ Role is correct: admin');
            } else {
                console.log('❌ Role is WRONG:', adminUser.role);
            }
        }
        
        // Check customer user too
        const customerUser = await User.findOne({ email: 'customer@test.com' });
        if (customerUser) {
            console.log('\n✅ Customer user found:');
            console.log('   Email:', customerUser.email);
            console.log('   Name:', customerUser.name);
            console.log('   Role:', customerUser.role);
        }
        
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkAdminUser();
