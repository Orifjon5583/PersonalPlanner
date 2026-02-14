"use client";

import { useState } from 'react';
import { StatCard } from '../../components/StatCard';
import TaskWidget from '../../components/TaskWidget';

export default function Dashboard() {
    const [tasks, setTasks] = useState([
        { id: '1', title: 'Loyiha taklifini tugatish', time: '10:00', status: 'pending' as const },
        { id: '2', title: 'Jamoa yig\'ilishi', time: '14:00', status: 'done' as const },
        { id: '3', title: 'Kodlarni tekshirish', time: '16:30', status: 'pending' as const },
    ]);

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Boshqaruv Paneli</h1>
                <p className="text-gray-500 font-medium">Xush kelibsiz, Foydalanuvchi!</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard title="Jami Vazifalar" value="12" subtext="4 ta bugungi" color="blue" />
                <StatCard title="Bajarildi" value="85%" subtext="+12% o'tgan haftaga nisbatan" color="green" />
                <StatCard title="Sarflangan Byudjet" value="1,240,000 so'm" subtext="3,000,000 so'm limitdan" color="red" />
                <StatCard title="Unumdorlik" value="6.4s" subtext="O'rtacha kunlik fokus" color="purple" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <TaskWidget tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 min-h-[300px]">
                    <h3 className="font-bold text-gray-900 mb-4">Tezkor Kalendar</h3>
                    <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg text-gray-400 font-medium">
                        Kalendar Komponenti Tez Orada...
                    </div>
                </div>
            </div>

            <div className="mt-8 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Moliya Umumlashmasi</h3>
                <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg text-gray-400 font-medium">
                    Diagramma Komponenti Tez Orada...
                </div>
            </div>
        </>
    );
}
