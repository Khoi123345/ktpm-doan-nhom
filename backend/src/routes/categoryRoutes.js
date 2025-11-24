import express from 'express';
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { admin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.route('/').get(getCategories).post(protect, admin, createCategory);
router.route('/:id').get(getCategoryById).put(protect, admin, updateCategory).delete(protect, admin, deleteCategory);

export default router;
