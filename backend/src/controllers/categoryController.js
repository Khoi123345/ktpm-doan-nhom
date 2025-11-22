import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
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

    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
        res.status(400);
        throw new Error('Thể loại đã tồn tại');
    }

    const category = await Category.create({
        name,
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

    if (category) {
        category.name = req.body.name || category.name;
        category.description = req.body.description || category.description;
        category.image = req.body.image || category.image;

        const updatedCategory = await category.save();
        res.json({
            success: true,
            data: updatedCategory,
        });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy thể loại');
    }
});

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
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
