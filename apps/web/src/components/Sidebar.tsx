"use client";

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Home, CheckSquare, Wallet, BarChart, Calendar, Menu, X, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { logout, user } = useAuth();

    const closeSidebar = () => setIsOpen(false);

    const navItems = [
        { href: '/dashboard', label: 'Boshqaruv', icon: <Home size={20} /> },
        { href: '/dashboard/tasks', label: 'Vazifalar', icon: <CheckSquare size={20} /> },
        { href: '/dashboard/finance', label: 'Moliya', icon: <Wallet size={20} /> },
        { href: '/dashboard/analytics', label: 'Analitika', icon: <BarChart size={20} /> },
        { href: '/dashboard/scheduler', label: 'Rejalashtirish', icon: <Calendar size={20} /> },
        { href: '/dashboard/profile', label: 'Profil', icon: <UserCircle size={20} /> },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="fixed top-4 left-4 z-50 rounded-lg bg-blue-600 p-2.5 text-white shadow-lg md:hidden hover:bg-blue-700 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-xl transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:block`}
            >
                <div className="flex h-full flex-col">
                    {/* Brand */}
                    <div className="flex h-16 items-center justify-center border-b border-gray-100 px-6">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Personal Planner
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={closeSidebar}
                                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <span className={isActive ? 'text-blue-600' : 'text-gray-400'}>{item.icon}</span>
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <div className="ml-auto h-2 w-2 rounded-full bg-blue-600"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User info + Logout */}
                    <div className="border-t border-gray-100 p-4 space-y-2">
                        {user && (
                            <div className="flex items-center gap-3 px-2 py-1">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={logout}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                        >
                            <LogOut size={18} />
                            <span>Chiqish</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
