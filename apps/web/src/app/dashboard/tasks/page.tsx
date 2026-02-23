"use client";

import { useState, useEffect } from 'react';
import TaskForm from '../../../components/TaskForm';
import TaskWidget from '../../../components/TaskWidget';

interface Task {
    id: string; // Changed to string for DB ID compatibility
    title: string;
    time: string;
    status: 'pending' | 'done';
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        fetchTasks();
    }, []);

    const formatTaskTime = (dateStr?: string, durationMinutes: number = 60) => {
        if (!dateStr) return 'Vaqt belgilanmagan';
        const start = new Date(dateStr);
        const end = new Date(start.getTime() + durationMinutes * 60000);

        const today = new Date();
        const isToday = start.getDate() === today.getDate() && start.getMonth() === today.getMonth() && start.getFullYear() === today.getFullYear();

        const startTime = start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const endTime = end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        if (isToday) return `Bugun ${startTime} - ${endTime}`;
        return `${start.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })} ${startTime} - ${endTime}`;
    };

    const fetchTasks = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/tasks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const formattedTasks = data.map((t: any) => ({
                    id: t.id,
                    title: t.title,
                    time: formatTaskTime(t.startAt, t.durationMinutes),
                    status: t.status === 'DONE' ? 'done' : 'pending'
                }));
                // Limit to recent or today? For now just show all
                setTasks(formattedTasks);
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        }
    };

    const addTask = (newTask: { id?: string; title: string; priority: string; duration: number; startAt?: string }) => {
        // Optimistic update or just relying on fetch?
        // Let's just append for now, assuming success from Form
        const task: Task = {
            id: newTask.id || Date.now().toString(),
            title: newTask.title,
            time: formatTaskTime(newTask.startAt || new Date().toISOString(), newTask.duration),
            status: 'pending'
        };
        setTasks(prev => [...prev, task]);
    };

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Vazifalar</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Form */}
                <div>
                    <TaskForm onAdd={addTask} />
                </div>

                {/* Right Column: List */}
                <div className="lg:col-span-2">
                    <TaskWidget tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
                </div>
            </div>
        </div>
    );
}
