import { useState } from 'react';
import Sidebar from '../admin/Sidebar';
import AdminHeader from '../admin/AdminHeader';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Mobile Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen transition-all duration-300">
                <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                    {children}
                </main>

                <footer className="bg-white border-t py-6 px-8">
                    <div className="text-center text-gray-500 text-sm">
                        <p>© 2024 Bookstore Admin Panel. Designed for excellence.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;


