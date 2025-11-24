import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập tên thể loại'],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        image: {
            type: String,
            default: 'https://res.cloudinary.com/demo/image/upload/category-default.png',
        },
    },
    {
        timestamps: true,
    }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;
