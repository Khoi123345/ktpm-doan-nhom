import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, changePassword } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { admin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.put('/change-password', protect, changePassword);
router.get('/', protect, admin, getAllUsers);
router.route('/:id').get(protect, admin, getUserById).put(protect, admin, updateUser).delete(protect, admin, deleteUser);

export default router;
