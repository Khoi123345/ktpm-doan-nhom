import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Vui lòng nhập tên sách'],
            trim: true,
        },
        author: {
            type: String,
            required: [true, 'Vui lòng nhập tên tác giả'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Vui lòng nhập mô tả'],
        },
        price: {
            type: Number,
            required: [true, 'Vui lòng nhập giá'],
            min: 0,
        },
        discountPrice: {
            type: Number,
            default: 0,
            min: 0,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Vui lòng chọn thể loại'],
        },
        images: {
            type: [String],
            default: [],
        },
        stock: {
            type: Number,
            required: [true, 'Vui lòng nhập số lượng'],
            min: 0,
            default: 0,
        },
        ISBN: {
            type: String,
            unique: true,
            sparse: true,
        },
        publisher: {
            type: String,
            default: '',
        },
        publishedDate: {
            type: Date,
        },
        pages: {
            type: Number,
            min: [1, 'Số trang phải lớn hơn 0'],
        },
        language: {
            type: String,
            default: 'Tiếng Việt',
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);


// Index for search
bookSchema.index({ title: 'text', author: 'text', description: 'text' }, {
    default_language: 'none',
    language_override: 'language_dummy'
});

const Book = mongoose.model('Book', bookSchema);

export default Book;
