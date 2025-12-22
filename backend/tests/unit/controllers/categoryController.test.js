import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../../src/models/Category.js', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        save: jest.fn(),
    })),
}));

jest.unstable_mockModule('../../../src/models/Book.js', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn()
    }
}));

// Add static methods to the mock
const { default: CategoryMock } = await import('../../../src/models/Category.js');
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
} = await import('../../../src/controllers/categoryController.js');

const { default: Category } = await import('../../../src/models/Category.js');
const { default: Book } = await import('../../../src/models/Book.js');
const { mockRequest, mockResponse, mockCategory } = await import('../helpers/testHelpers.js');

describe('categoryController', () => {
    let req, res;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    describe('getCategories', () => {
        it('returnAllCategories', async () => {
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
        it('returnCategoryWhenFound', async () => {
            const category = mockCategory();
            req.params = { id: category._id };
            Category.findById.mockResolvedValue(category);

            await getCategoryById(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: category
            });
        });

        it('return404WhenNotFound', async () => {
            req.params = { id: 'nonexistent-id' };
            Category.findById.mockResolvedValue(null);

            await expect(getCategoryById(req, res)).rejects.toThrow('Không tìm thấy thể loại');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('createCategory', () => {
        it('createCategorySuccessfully', async () => {
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

        it('return400IfCategoryAlreadyExists', async () => {
            const categoryData = { name: 'Existing Category' };
            req.body = categoryData;

            Category.findOne.mockResolvedValue(mockCategory(categoryData));

            await expect(createCategory(req, res)).rejects.toThrow('Thể loại đã tồn tại');
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('updateCategory', () => {
        it('updateCategorySuccessfully', async () => {
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

        it('updateCategoryWithoutOptionalFields', async () => {
            const category = mockCategory({ name: 'Old Name', description: 'Old Desc' });
            req.params = { id: category._id };
            req.body = {}; // No updates

            const updatedCategory = { ...category };
            updatedCategory.save = jest.fn().mockResolvedValue(updatedCategory);
            Category.findById.mockResolvedValue(updatedCategory);

            await updateCategory(req, res);

            // Verify fields remain unchanged (logic in controller: name = req.body.name ? ... : category.name)
            // Since we mocked the object, we rely on the controller logic being executed.
            // We can check if save was called.
            expect(updatedCategory.save).toHaveBeenCalled();
        });

        it('updateCategoryWithDescriptionOnly', async () => {
            const category = mockCategory({ name: 'Old Name', description: 'Old Desc' });
            req.params = { id: category._id };
            req.body = { description: 'New Desc' };

            const updatedCategory = { ...category, description: 'New Desc' };
            updatedCategory.save = jest.fn().mockResolvedValue(updatedCategory);
            Category.findById.mockResolvedValue(updatedCategory);

            await updateCategory(req, res);

            expect(updatedCategory.description).toBe('New Desc');
            expect(updatedCategory.save).toHaveBeenCalled();
        });

        it('return400IfCategoryNameDuplicateOnUpdate', async () => {
            const category = mockCategory({ name: 'Old Name' });
            req.params = { id: category._id };
            req.body = { name: 'Existing Name' };

            Category.findById.mockResolvedValue(category);
            Category.findOne.mockResolvedValue({ _id: 'other-id', name: 'Existing Name' });

            await expect(updateCategory(req, res)).rejects.toThrow('Tên thể loại đã tồn tại');
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('updateCategoryNameSuccess', async () => {
            const category = mockCategory({ name: 'Old Name' });
            req.params = { id: category._id };
            req.body = { name: 'New Name' };

            Category.findById.mockResolvedValue(category);
            Category.findOne.mockResolvedValue(null); // No duplicate
            category.save = jest.fn().mockResolvedValue({ ...category, name: 'New Name' });

            await updateCategory(req, res);

            expect(category.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true
            }));
        });

        it('return404WhenNotFound', async () => {
            req.params = { id: 'nonexistent-id' };
            req.body = { name: 'Updated Name' };
            Category.findById.mockResolvedValue(null);

            await expect(updateCategory(req, res)).rejects.toThrow('Không tìm thấy thể loại');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteCategory', () => {
        it('deleteCategorySuccessfully', async () => {
            const category = mockCategory();
            req.params = { id: category._id };

            category.deleteOne = jest.fn().mockResolvedValue(true);
            Category.findById.mockResolvedValue(category);

            // Mock Book.findOne to return null (no books using this category)
            Book.findOne.mockResolvedValue(null);

            await deleteCategory(req, res);

            expect(category.deleteOne).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: expect.any(String)
            });
        });

        it('return400IfCategoryHasBooks', async () => {
            const category = mockCategory();
            req.params = { id: category._id };

            Category.findById.mockResolvedValue(category);
            Book.findOne.mockResolvedValue({ _id: 'book-id' });

            await expect(deleteCategory(req, res)).rejects.toThrow('Không thể xóa danh mục đã có sản phẩm');
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('return404WhenNotFound', async () => {
            req.params = { id: 'nonexistent-id' };
            Category.findById.mockResolvedValue(null);

            await expect(deleteCategory(req, res)).rejects.toThrow('Không tìm thấy thể loại');
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
