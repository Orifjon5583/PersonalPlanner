"use client";

import { Bell, LogOut } from 'lucide-react';
import { useAuth } from './AuthProvider';

export default function Header() {
    const { user } = useAuth();

    return (
        <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm">
            <div className="md:hidden w-10"></div> {/* Spacer for mobile menu button */}
            <h2 className="text-lg font-semibold text-gray-800 hidden md:block">
                Xush kelibsiz, {user?.name || 'Foydalanuvchi'}!
            </h2>
            <div className="flex items-center gap-4">
                <button className="text-gray-500 hover:text-gray-700 relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
            </div>
        </header>
    );
}
