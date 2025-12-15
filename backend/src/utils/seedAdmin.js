import User from '../models/User.js';
import Category from '../models/Category.js';

/**
 * Seed admin account and default category for testing
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

        // Seed default category
        const defaultCategoryName = 'Fiction';
        const categoryExists = await Category.findOne({ name: defaultCategoryName });
        
        if (!categoryExists) {
            await Category.create({
                name: defaultCategoryName,
                description: 'Fiction books category',
            });
            console.log('✅ Default category seeded successfully');
        } else {
            console.log('ℹ️  Default category already exists');
        }
    } catch (error) {
        console.error('❌ Error seeding test data:', error.message);
    }
};
