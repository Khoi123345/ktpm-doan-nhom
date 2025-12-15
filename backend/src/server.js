import app from './app.js';
import connectDB from './config/database.js';
import { seedAdminUser } from './utils/seedAdmin.js';

// Connect to database
connectDB().then(() => {
    // Seed admin user in test environment
    seedAdminUser();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
