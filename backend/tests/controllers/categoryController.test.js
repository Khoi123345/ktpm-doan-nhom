import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../src/models/Category.js', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        save: jest.fn(),
    })),
}));

// Add static methods to the mock
const { default: CategoryMock } = await import('../../src/models/Category.js');
Object.assign(CategoryMock, {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
});

// Import modules dynamically
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = await import('../../src/controllers/categoryController.js');

const { default: Category } = await import('../../src/models/Category.js');
const { mockRequest, mockResponse, mockCategory } = await import('../helpers/testHelpers.js');

describe('categoryController', () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    describe('getCategories', () => {
        it('should return all categories', async () => {
            const categories = [mockCategory(), mockCategory()];
            Category.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(categories)
            });

            await getCategories(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: categories
            });
        });
    });

    describe('getCategoryById', () => {
        it('should return category when found', async () => {
            const category = mockCategory();
            req.params = { id: category._id };
            Category.findById.mockResolvedValue(category);

            await getCategoryById(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: category
            });
        });

        it('should return 404 when not found', async () => {
            req.params = { id: 'nonexistent-id' };
            Category.findById.mockResolvedValue(null);

            await expect(getCategoryById(req, res)).rejects.toThrow('Không tìm thấy thể loại');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('createCategory', () => {
        it('should create category successfully', async () => {
            const categoryData = { name: 'New Category', description: 'Description' };
            req.body = categoryData;

            const newCategory = mockCategory(categoryData);

            Category.findOne.mockResolvedValue(null);
            Category.create.mockResolvedValue(newCategory);

            await createCategory(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: newCategory
            });
        });

        it('should return 400 if category already exists', async () => {
            const categoryData = { name: 'Existing Category' };
            req.body = categoryData;

            Category.findOne.mockResolvedValue(mockCategory(categoryData));

            await expect(createCategory(req, res)).rejects.toThrow('Thể loại đã tồn tại');
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('updateCategory', () => {
        it('should update category successfully', async () => {
            const category = mockCategory();
            const updates = { name: 'Updated Name' };
            req.params = { id: category._id };
            req.body = updates;

            const updatedCategory = { ...category, ...updates };
            updatedCategory.save = jest.fn().mockResolvedValue(updatedCategory);
            Category.findById.mockResolvedValue(updatedCategory);

            await updateCategory(req, res);

            expect(updatedCategory.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updatedCategory
            });
        });

        it('should return 404 when not found', async () => {
            req.params = { id: 'nonexistent-id' };
            req.body = { name: 'Updated Name' };
            Category.findById.mockResolvedValue(null);

            await expect(updateCategory(req, res)).rejects.toThrow('Không tìm thấy thể loại');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteCategory', () => {
        it('should delete category successfully', async () => {
            const category = mockCategory();
            req.params = { id: category._id };

            category.deleteOne = jest.fn().mockResolvedValue(true);
            Category.findById.mockResolvedValue(category);

            await deleteCategory(req, res);

            expect(category.deleteOne).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: expect.any(String)
            });
        });

        it('should return 404 when not found', async () => {
            req.params = { id: 'nonexistent-id' };
            Category.findById.mockResolvedValue(null);

            await expect(deleteCategory(req, res)).rejects.toThrow('Không tìm thấy thể loại');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
