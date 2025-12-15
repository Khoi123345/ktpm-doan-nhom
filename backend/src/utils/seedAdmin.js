import User from '../models/User.js';

/**
 * Seed admin account for testing
 * Only runs in test environment
 */
export const seedAdminUser = async () => {
    if (process.env.NODE_ENV !== 'test') {
        return;
    }

    try {
        const adminEmail = 'admin@bookstore.com';
        
        // Check if admin already exists
        const adminExists = await User.findOne({ email: adminEmail });
        
        if (!adminExists) {
            await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: 'Admin@123456',
                role: 'admin',
            });
            console.log('✅ Admin user seeded successfully');
        } else {
            console.log('ℹ️  Admin user already exists');
        }
    } catch (error) {
        console.error('❌ Error seeding admin user:', error.message);
    }
};
