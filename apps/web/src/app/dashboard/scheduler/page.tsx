"use client";

import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function SchedulerPage() {
    const days = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Rejalashtirish</h1>
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    <Plus size={20} />
                    <span>Tadbir Qo‘shish</span>
                </button>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Fevral 2026</h2>
                    <div className="flex gap-2">
                        <button className="p-2 rounded-lg hover:bg-gray-100"><ChevronLeft size={20} /></button>
                        <button className="p-2 rounded-lg hover:bg-gray-100"><ChevronRight size={20} /></button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-4 text-center">
                    {days.map(day => (
                        <div key={day} className="font-medium text-gray-500 text-sm mb-2">{day}</div>
                    ))}
                    {/* Mock Days */}
                    {Array.from({ length: 35 }).map((_, i) => (
                        <div key={i} className={`h-24 rounded-lg border border-gray-200 p-2 text-left ${i === 12 ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}>
                            <span className={`text-sm ${i === 12 ? 'font-bold text-blue-600' : 'text-gray-700'}`}>{i + 1}</span>
                            {i === 12 && (
                                <div className="mt-1 text-xs bg-blue-200 text-blue-800 p-1 rounded">
                                    Loyiha muhokamasi
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
