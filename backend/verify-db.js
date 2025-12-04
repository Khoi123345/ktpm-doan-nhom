import { connect, close, clear } from './tests/integration/setup.js';
import mongoose from 'mongoose';

const run = async () => {
    try {
        console.log('Connecting...');
        await connect();
        console.log('Connected!');

        const TestSchema = new mongoose.Schema({ name: String });
        const TestModel = mongoose.model('Test', TestSchema);

        console.log('Creating document...');
        await TestModel.create({ name: 'test' });
        console.log('Document created!');

        const doc = await TestModel.findOne({ name: 'test' });
        console.log('Document found:', doc);

        await clear();
        await close();
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error);
    }
};

run();
