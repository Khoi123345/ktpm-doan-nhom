import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import Book from '../models/Book.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({}).sort({ name: 1 });

    res.json({
        success: true,
        data: categories,
    });
});

/**
 * @desc    Get single category
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        res.json({
            success: true,
            data: category,
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy thể loại');
    }
});

/**
 * @desc    Create a category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
    const { name, description, image } = req.body;

    // Check for duplicate category name (case-insensitive)
    const categoryExists = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (categoryExists) {
        res.status(400);
        throw new Error('Thể loại đã tồn tại');
    }

    const category = await Category.create({
        name: name.trim(),
        description,
        image,
    });

    res.status(201).json({
        success: true,
        data: category,
    });
});

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error('Không tìm thấy thể loại');
    }

    // Check for duplicate category name when updating (case-insensitive)
    if (req.body.name && req.body.name.trim() !== category.name) {
        const categoryExists = await Category.findOne({ 
            name: { $regex: new RegExp(`^${req.body.name.trim()}$`, 'i') },
            _id: { $ne: req.params.id }
        });

        if (categoryExists) {
            res.status(400);
            throw new Error('Tên thể loại đã tồn tại');
        }
    }

    category.name = req.body.name ? req.body.name.trim() : category.name;
    category.description = req.body.description !== undefined ? req.body.description : category.description;
    category.image = req.body.image || category.image;

    const updatedCategory = await category.save();
    res.json({
        success: true,
        data: updatedCategory,
    });
});

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        // Check if any book uses this category
        const Book = (await import('../models/Book.js')).default;
        const book = await Book.findOne({ category: req.params.id });
        if (book) {
            res.status(400);
            throw new Error('Không thể xóa danh mục đã có sản phẩm');
        }

        await category.deleteOne();
        res.json({
            success: true,
            message: 'Đã xóa thể loại',
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy thể loại');
    }
});

export default {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
