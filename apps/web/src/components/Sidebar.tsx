"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Home, CheckSquare, Wallet, BarChart, Calendar, Settings, Menu, X } from 'lucide-react';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="fixed top-4 left-4 z-50 rounded-md bg-blue-600 p-2 text-white md:hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:static md:block`}
            >
                <div className="flex h-full flex-col">
                    <div className="flex h-16 items-center justify-center border-b px-6">
                        <h1 className="text-xl font-bold text-blue-600">Personal Planner</h1>
                    </div>
                    <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
                        <NavLink href="/dashboard" label="Boshqaruv" icon={<Home size={20} />} />
                        <NavLink href="/dashboard/tasks" label="Vazifalar" icon={<CheckSquare size={20} />} />
                        <NavLink href="/dashboard/finance" label="Moliya" icon={<Wallet size={20} />} />
                        <NavLink href="/dashboard/analytics" label="Analitika" icon={<BarChart size={20} />} />
                        <NavLink href="/dashboard/scheduler" label="Rejalashtirish" icon={<Calendar size={20} />} />
                    </nav>
                    <div className="border-t p-4">
                        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                            <Settings size={20} />
                            <span>Sozlamalar</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
            <span className="text-gray-500">{icon}</span>
            <span className="font-medium">{label}</span>
        </Link>
    );
}
