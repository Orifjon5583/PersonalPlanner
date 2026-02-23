"use client";

import { useState, useEffect } from 'react';
import { StatCard } from '../../components/StatCard';
import TaskWidget from '../../components/TaskWidget';
import { useAuth } from '../../components/AuthProvider';

interface Task {
    id: string;
    title: string;
    time: string;
    status: 'pending' | 'done';
}

interface WeeklyStats {
    totalDone: number;
    dailyCounts: { date: string; count: number }[];
}

export default function Dashboard() {
    const { token, user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
    const [totalTasks, setTotalTasks] = useState(0);
    const [doneTasks, setDoneTasks] = useState(0);

    useEffect(() => {
        if (!token) return;

        // Fetch tasks
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : [])
            .then((data: any[]) => {
                setTotalTasks(data.length);
                setDoneTasks(data.filter(t => t.status === 'DONE').length);

                const todayTasks = data
                    .filter((t: any) => {
                        if (!t.startAt) return true;
                        const d = new Date(t.startAt);
                        const today = new Date();
                        return d.toDateString() === today.toDateString();
                    })
                    .slice(0, 5)
                    .map((t: any) => ({
                        id: t.id,
                        title: t.title,
                        time: t.startAt ? new Date(t.startAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '--:--',
                        status: t.status === 'DONE' ? 'done' as const : 'pending' as const,
                    }));
                setTasks(todayTasks);
            })
            .catch(console.error);

        // Fetch weekly stats
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/analytics/tasks/weekly`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data) setWeeklyStats(data); })
            .catch(console.error);
    }, [token]);

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Boshqaruv Paneli</h1>
                <p className="text-gray-500 font-medium">Xush kelibsiz, {user?.name || 'Foydalanuvchi'}!</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatCard title="Jami Vazifalar" value={String(totalTasks)} subtext={`${doneTasks} ta bajarilgan`} color="blue" />
                <StatCard title="Bajarildi" value={`${completionRate}%`} subtext="Umumiy bajarilish foizi" color="green" />
                <StatCard title="Bu Hafta" value={String(weeklyStats?.totalDone || 0)} subtext="ta vazifa bajarilgan" color="purple" />
                <StatCard title="Bugungi" value={String(tasks.length)} subtext="ta vazifa rejalashtirilgan" color="red" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Task list */}
                <div className="lg:col-span-2">
                    <TaskWidget tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
                </div>

                {/* Weekly mini chart */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Haftalik Faollik</h3>
                    {weeklyStats ? (
                        <div className="flex items-end justify-between gap-2 h-40">
                            {weeklyStats.dailyCounts.map((d, i) => {
                                const max = Math.max(...weeklyStats.dailyCounts.map(x => x.count), 1);
                                const heightPercent = (d.count / max) * 100;
                                const dayName = new Date(d.date).toLocaleDateString('uz-UZ', { weekday: 'short' });
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <span className="text-xs font-bold text-blue-600">{d.count}</span>
                                        <div className="w-full flex items-end justify-center h-24">
                                            <div
                                                className="w-full max-w-[30px] bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md transition-all duration-700"
                                                style={{ height: `${Math.max(heightPercent, 8)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-medium text-gray-400 uppercase">{dayName}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-40 text-gray-400 font-medium">
                            Yuklanmoqda...
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
