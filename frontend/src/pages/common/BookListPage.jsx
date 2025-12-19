import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { getBooks } from '../../features/bookSlice';
import { getCategories } from '../../features/categorySlice';
import { FiSearch, FiFilter, FiX, FiChevronDown, FiGrid, FiList } from 'react-icons/fi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import ProductCard from '../../components/common/ProductCard';

const BookListPage = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { books, loading, page, pages, total } = useSelector((state) => state.books);
    const { categories } = useSelector((state) => state.categories);

    const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [sortBy, setSortBy] = useState('newest'); // newest, price-asc, price-desc, rating

    useEffect(() => {
        dispatch(getCategories());
    }, [dispatch]);

    useEffect(() => {
        const params = Object.fromEntries(searchParams);
        dispatch(getBooks({ 
            keyword: params.keyword || '', 
            category: params.category || '', 
            page: parseInt(params.page) || 1, 
            minPrice: params.minPrice || '', 
            maxPrice: params.maxPrice || '' 
        }));
    }, [dispatch, searchParams]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        const params = {};
        if (keyword) params.keyword = keyword;
        if (category) params.category = category;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        params.page = 1;
        setSearchParams(params);
    };

    const updateSearchParams = () => {
        const params = {};
        if (keyword) params.keyword = keyword;
        if (category) params.category = category;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (currentPage > 1) params.page = currentPage;
        setSearchParams(params);
    };

    const handleClearFilters = () => {
        setKeyword('');
        setCategory('');
        setMinPrice('');
        setMaxPrice('');
        setCurrentPage(1);
        setSearchParams({});
    };

    // Client-side sorting (since backend doesn't support it yet)
    const sortedBooks = [...books].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4">
                {/* Header & Mobile Filter Toggle */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tất Cả Sách</h1>
                        <p className="text-gray-500 mt-1">Hiển thị {books.length} / {total} kết quả</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm"
                            onClick={() => setShowMobileFilters(true)}
                        >
                            <FiFilter /> Bộ lọc
                        </button>

                        <div className="relative flex-1 md:flex-none">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none w-full md:w-48 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="price-asc">Giá: Thấp đến Cao</option>
                                <option value="price-desc">Giá: Cao đến Thấp</option>
                                <option value="rating">Đánh giá cao</option>
                            </select>
                            <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar (Desktop) */}
                    <div className={`lg:w-1/4 ${showMobileFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden lg:block'}`}>
                        {showMobileFilters && (
                            <div className="flex justify-between items-center mb-6 lg:hidden">
                                <h2 className="text-xl font-bold">Bộ Lọc</h2>
                                <button onClick={() => setShowMobileFilters(false)}>
                                    <FiX className="w-6 h-6" />
                                </button>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Search */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <FiSearch className="text-primary-600" /> Tìm Kiếm
                                </h3>
                                <form onSubmit={handleSearch}>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                            placeholder="Tên sách, tác giả..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    </div>
                                </form>
                            </div>

                            {/* Categories */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <FiGrid className="text-primary-600" /> Danh Mục
                                </h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                    <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
                                        <input
                                            type="radio"
                                            name="category"
                                            value=""
                                            checked={category === ''}
                                            onChange={(e) => {
                                                setCategory(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                        />
                                        <span className="text-gray-700">Tất cả</span>
                                    </label>
                                    {categories.map((cat) => (
                                        <label key={cat._id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat._id}
                                                checked={category === cat._id}
                                                onChange={(e) => {
                                                    setCategory(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                            />
                                            <span className="text-gray-700">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <FiFilter className="text-primary-600" /> Khoảng Giá
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            placeholder="Từ"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            min="0"
                                        />
                                        <span className="text-gray-400">-</span>
                                        <input
                                            type="number"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            placeholder="Đến"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            min="0"
                                        />
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setCurrentPage(1);
                                            updateSearchParams();
                                            setShowMobileFilters(false);
                                        }}
                                        className="w-full"
                                    >
                                        Áp Dụng
                                    </Button>
                                </div>
                            </div>

                            {/* Clear Filters */}
                            <button
                                onClick={handleClearFilters}
                                className="w-full py-2 text-gray-500 hover:text-primary-600 transition text-sm font-medium border border-dashed border-gray-300 rounded-lg hover:border-primary-600"
                            >
                                Xóa Tất Cả Bộ Lọc
                            </button>
                        </div>
                    </div>

                    {/* Books Grid */}
                    <div className="flex-1 relative min-h-[400px]">
                        {loading && (
                            <div className="absolute inset-0 z-10 flex items-start justify-center pt-40 pointer-events-none">
                                <div className="bg-white/90 p-3 rounded-full shadow-lg backdrop-blur-sm">
                                    <Loader size="lg" />
                                </div>
                            </div>
                        )}

                        <div className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            {sortedBooks.length === 0 && !loading ? (
                                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiSearch className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                                    <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                                    <button
                                        onClick={handleClearFilters}
                                        className="mt-4 text-primary-600 font-medium hover:underline"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                        {sortedBooks.map((book) => (
                                            <ProductCard
                                                key={book._id}
                                                book={book}
                                                showQuickAdd={true}
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    <div className="flex justify-center">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={pages}
                                            onPageChange={(page) => {
                                                setCurrentPage(page);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookListPage;
