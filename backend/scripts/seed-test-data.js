import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import User from '../src/models/User.js';
import Book from '../src/models/Book.js';
import Category from '../src/models/Category.js';
import Order from '../src/models/Order.js';
import Review from '../src/models/Review.js';
import Coupon from '../src/models/Coupon.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore';

async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

async function clearDatabase() {
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Book.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Coupon.deleteMany({});
    console.log('✅ Database cleared');
}

async function seedCategories() {
    console.log('📚 Seeding categories...');
    
    const categories = [
        { name: 'Fiction', description: 'Fictional literature and novels' },
        { name: 'Non-Fiction', description: 'Real life stories and facts' },
        { name: 'Science', description: 'Scientific books and research' },
        { name: 'Technology', description: 'Technology and programming books' },
        { name: 'Business', description: 'Business and entrepreneurship' },
        { name: 'Self-Help', description: 'Personal development books' },
        { name: 'History', description: 'Historical books and biographies' },
        { name: 'Children', description: 'Books for children' }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);
    return createdCategories;
}

async function seedUsers() {
    console.log('👥 Seeding users...');
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Test123!', salt);

    const users = [
        {
            name: 'Admin User',
            email: 'admin@bookstore.com',
            password: hashedPassword,
            role: 'admin',
            phone: '0123456789',
            address: '123 Admin Street, HCM City'
        },
        {
            name: 'Test Customer',
            email: 'customer@test.com',
            password: hashedPassword,
            role: 'user',
            phone: '0987654321',
            address: '456 Customer Avenue, Hanoi'
        },
        {
            name: 'John Doe',
            email: 'john@example.com',
            password: hashedPassword,
            role: 'user',
            phone: '0912345678',
            address: '789 Main Street, Da Nang'
        }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);
    console.log('📧 Test accounts:');
    console.log('   Admin: admin@bookstore.com / Test123!');
    console.log('   Customer: customer@test.com / Test123!');
    return createdUsers;
}

async function seedBooks(categories) {
    console.log('📖 Seeding books...');
    
    const fictionCat = categories.find(c => c.name === 'Fiction');
    const techCat = categories.find(c => c.name === 'Technology');
    const businessCat = categories.find(c => c.name === 'Business');
    const scienceCat = categories.find(c => c.name === 'Science');
    const selfHelpCat = categories.find(c => c.name === 'Self-Help');

    const books = [
        {
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            price: 150000,
            discountPrice: 120000,
            category: fictionCat._id,
            description: 'A classic American novel set in the Jazz Age',
            stock: 50,
            ISBN: '978-0-7432-7356-5',
            publisher: 'Scribner',
            publishedDate: new Date('1925-04-10'),
            pages: 180,
            language: 'English',
            images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400']
        },
        {
            title: 'Clean Code',
            author: 'Robert C. Martin',
            price: 450000,
            discountPrice: 400000,
            category: techCat._id,
            description: 'A Handbook of Agile Software Craftsmanship',
            stock: 30,
            ISBN: '978-0-13-235088-4',
            publisher: 'Prentice Hall',
            publishedDate: new Date('2008-08-01'),
            pages: 464,
            language: 'English',
            images: ['https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400']
        },
        {
            title: 'Think and Grow Rich',
            author: 'Napoleon Hill',
            price: 180000,
            discountPrice: 220000,
            category: businessCat._id,
            description: 'The timeless classic on achieving success',
            stock: 40,
            ISBN: '978-1-5855-4433-1',
            publisher: 'Ralston Society',
            publishedDate: new Date('1937-01-01'),
            pages: 320,
            language: 'English',
            images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400']
        },
        {
            title: 'A Brief History of Time',
            author: 'Stephen Hawking',
            price: 280000,
            discountPrice: 350000,
            category: scienceCat._id,
            description: 'From the Big Bang to Black Holes',
            stock: 25,
            ISBN: '978-0-553-10953-5',
            publisher: 'Bantam Books',
            publishedDate: new Date('1988-04-01'),
            pages: 256,
            language: 'English',
            images: ['https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400']
        },
        {
            title: 'Atomic Habits',
            author: 'James Clear',
            price: 250000,
            discountPrice: 300000,
            category: selfHelpCat._id,
            description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
            stock: 60,
            ISBN: '978-0-7352-1129-2',
            publisher: 'Avery',
            publishedDate: new Date('2018-10-16'),
            pages: 320,
            language: 'English',
            images: ['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400']
        },
        {
            title: 'JavaScript: The Good Parts',
            author: 'Douglas Crockford',
            price: 320000,
            discountPrice: 400000,
            category: techCat._id,
            description: 'Master JavaScript programming language',
            stock: 35,
            ISBN: '978-0-596-51774-8',
            publisher: "O'Reilly Media",
            publishedDate: new Date('2008-05-01'),
            pages: 176,
            language: 'English',
            images: ['https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400']
        },
        {
            title: 'The Lean Startup',
            author: 'Eric Ries',
            price: 280000,
            discountPrice: 350000,
            category: businessCat._id,
            description: 'How Todays Entrepreneurs Use Continuous Innovation',
            stock: 45,
            ISBN: '978-0-307-88789-4',
            publisher: 'Crown Business',
            publishedDate: new Date('2011-09-13'),
            pages: 336,
            language: 'English',
            images: ['https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400']
        },
        {
            title: '1984',
            author: 'George Orwell',
            price: 160000,
            discountPrice: 200000,
            category: fictionCat._id,
            description: 'A dystopian social science fiction novel',
            stock: 55,
            ISBN: '978-0-452-28423-4',
            publisher: 'Secker & Warburg',
            publishedDate: new Date('1949-06-08'),
            pages: 328,
            language: 'English',
            images: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400']
        },
        {
            title: 'The 7 Habits of Highly Effective People',
            author: 'Stephen Covey',
            price: 220000,
            discountPrice: 280000,
            category: selfHelpCat._id,
            description: 'Powerful lessons in personal change',
            stock: 42,
            ISBN: '978-1-982-13709-9',
            publisher: 'Free Press',
            publishedDate: new Date('1989-08-15'),
            pages: 381,
            language: 'English',
            images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400']
        },
        {
            title: 'Design Patterns',
            author: 'Gang of Four',
            price: 520000,
            discountPrice: 600000,
            category: techCat._id,
            description: 'Elements of Reusable Object-Oriented Software',
            stock: 20,
            ISBN: '978-0-201-63361-0',
            publisher: 'Addison-Wesley',
            publishedDate: new Date('1994-10-31'),
            pages: 416,
            language: 'English',
            images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400']
        }
    ];

    const createdBooks = await Book.insertMany(books);
    console.log(`✅ Created ${createdBooks.length} books`);
    return createdBooks;
}

async function seedReviews(books, users) {
    console.log('⭐ Seeding reviews...');
    
    const customer = users.find(u => u.email === 'customer@test.com');
    const john = users.find(u => u.email === 'john@example.com');

    const reviews = [
        {
            book: books[0]._id,
            user: customer._id,
            rating: 5,
            comment: 'Absolutely loved this classic! A must-read for everyone.',
            createdAt: new Date('2024-11-15')
        },
        {
            book: books[1]._id,
            user: customer._id,
            rating: 5,
            comment: 'Best programming book I have ever read. Changed how I write code!',
            createdAt: new Date('2024-12-01')
        },
        {
            book: books[1]._id,
            user: john._id,
            rating: 4,
            comment: 'Very informative, though some parts are a bit dry.',
            createdAt: new Date('2024-12-05')
        },
        {
            book: books[4]._id,
            user: john._id,
            rating: 5,
            comment: 'Life-changing book! The habit stacking technique really works.',
            createdAt: new Date('2024-11-20')
        },
        {
            book: books[3]._id,
            user: customer._id,
            rating: 4,
            comment: 'Complex topics explained in an accessible way. Fascinating!',
            createdAt: new Date('2024-10-30')
        }
    ];

    const createdReviews = await Review.insertMany(reviews);
    
    // Update books with review stats
    for (const review of createdReviews) {
        await Book.findByIdAndUpdate(review.book, {
            $inc: { numReviews: 1, totalRating: review.rating }
        });
    }

    // Calculate average ratings
    for (const book of books) {
        const bookReviews = createdReviews.filter(r => r.book.equals(book._id));
        if (bookReviews.length > 0) {
            const avgRating = bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length;
            await Book.findByIdAndUpdate(book._id, { rating: avgRating });
        }
    }

    console.log(`✅ Created ${createdReviews.length} reviews`);
    return createdReviews;
}

async function seedOrders(books, users) {
    console.log('🛒 Seeding orders...');
    
    const customer = users.find(u => u.email === 'customer@test.com');
    const john = users.find(u => u.email === 'john@example.com');

    const orders = [
        {
            user: customer._id,
            orderItems: [
                {
                    book: books[0]._id,
                    quantity: 2,
                    price: books[0].price,
                    title: books[0].title,
                    image: books[0].images[0]
                },
                {
                    book: books[1]._id,
                    quantity: 1,
                    price: books[1].price,
                    title: books[1].title,
                    image: books[1].images[0]
                }
            ],
            shippingAddress: {
                fullName: 'Test Customer',
                phone: '0987654321',
                address: '456 Customer Avenue',
                city: 'Hanoi',
                district: 'Ba Dinh',
                ward: 'Phuong 1'
            },
            paymentMethod: 'COD',
            itemsPrice: 750000,
            shippingPrice: 30000,
            totalPrice: 780000,
            isPaid: false,
            isDelivered: false,
            status: 'pending',
            createdAt: new Date('2024-12-15')
        },
        {
            user: customer._id,
            orderItems: [
                {
                    book: books[4]._id,
                    quantity: 1,
                    price: books[4].price,
                    title: books[4].title,
                    image: books[4].images[0]
                }
            ],
            shippingAddress: {
                fullName: 'Test Customer',
                phone: '0987654321',
                address: '456 Customer Avenue',
                city: 'Hanoi',
                district: 'Ba Dinh',
                ward: 'Phuong 1'
            },
            paymentMethod: 'MoMo',
            itemsPrice: 250000,
            shippingPrice: 30000,
            totalPrice: 280000,
            isPaid: true,
            paidAt: new Date('2024-12-10'),
            isDelivered: true,
            deliveredAt: new Date('2024-12-12'),
            status: 'delivered',
            createdAt: new Date('2024-12-10')
        },
        {
            user: john._id,
            orderItems: [
                {
                    book: books[2]._id,
                    quantity: 1,
                    price: books[2].price,
                    title: books[2].title,
                    image: books[2].images[0]
                },
                {
                    book: books[3]._id,
                    quantity: 1,
                    price: books[3].price,
                    title: books[3].title,
                    image: books[3].images[0]
                }
            ],
            shippingAddress: {
                fullName: 'John Doe',
                phone: '0912345678',
                address: '789 Main Street',
                city: 'Da Nang',
                district: 'Hai Chau',
                ward: 'Phuong 5'
            },
            paymentMethod: 'COD',
            itemsPrice: 460000,
            shippingPrice: 30000,
            totalPrice: 490000,
            isPaid: false,
            isDelivered: false,
            status: 'processing',
            createdAt: new Date('2024-12-16')
        }
    ];

    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ Created ${createdOrders.length} orders`);
    return createdOrders;
}

async function seedCoupons() {
    console.log('🎟️  Seeding coupons...');
    
    const coupons = [
        {
            code: 'WELCOME10',
            discountValue: 10,
            discountType: 'percentage',
            minOrderValue: 100000,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2025-12-31'),
            isActive: true,
            usageLimit: 100,
            usedCount: 5,
            description: 'Welcome discount for new customers'
        },
        {
            code: 'SAVE50K',
            discountValue: 50000,
            discountType: 'fixed',
            minOrderValue: 500000,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2025-06-30'),
            isActive: true,
            usageLimit: 50,
            usedCount: 12,
            description: '50k off for orders above 500k'
        },
        {
            code: 'FREESHIP',
            discountValue: 30000,
            discountType: 'fixed',
            minOrderValue: 200000,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2025-03-31'),
            isActive: true,
            usageLimit: 200,
            usedCount: 45,
            description: 'Free shipping voucher'
        }
    ];

    const createdCoupons = await Coupon.insertMany(coupons);
    console.log(`✅ Created ${createdCoupons.length} coupons`);
    console.log('🎫 Available coupons: WELCOME10, SAVE50K, FREESHIP');
    return createdCoupons;
}

async function seedDatabase() {
    try {
        await connectDB();
        await clearDatabase();
        
        const categories = await seedCategories();
        const users = await seedUsers();
        const books = await seedBooks(categories);
        await seedReviews(books, users);
        await seedOrders(books, users);
        await seedCoupons();
        
        console.log('\n🎉 Test data seeding completed successfully!\n');
        console.log('📝 Summary:');
        console.log(`   - ${categories.length} categories`);
        console.log(`   - ${users.length} users`);
        console.log(`   - ${books.length} books`);
        console.log(`   - 5 reviews`);
        console.log(`   - 3 orders`);
        console.log(`   - 3 coupons`);
        console.log('\n🔑 Login credentials:');
        console.log('   Admin: admin@bookstore.com / Test123!');
        console.log('   Customer: customer@test.com / Test123!');
        console.log('   Customer 2: john@example.com / Test123!');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    }
}

// Run the seed function
seedDatabase();


