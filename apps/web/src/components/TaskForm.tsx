
"use client";

import { useState } from 'react';
import { PlusCircle, Type, AlertCircle, Clock, Save } from 'lucide-react';

interface TaskFormProps {
    onAdd: (task: { id?: string; title: string; priority: string; duration: number; startAt?: string }) => void;
}

export default function TaskForm({ onAdd }: TaskFormProps) {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('NORMAL');
    const [duration, setDuration] = useState(60);
    const [startAt, setStartAt] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // If token exists, send to backend
            if (token) {
                const res = await fetch('http://localhost:3001/api/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title,
                        priority: priority as any,
                        durationMinutes: duration,
                        startAt: startAt ? new Date(startAt).toISOString() : undefined,
                        planned: !!startAt
                    })
                });

                if (res.ok) {
                    const newTask = await res.json();
                    onAdd({
                        id: newTask.id,
                        title: newTask.title,
                        priority: newTask.priority,
                        duration: newTask.durationMinutes,
                        startAt: newTask.startAt
                    });
                } else {
                    console.error('Failed to save task');
                    // Fallback to optimistic update if needed, but error hints at backend issue
                    alert('Xatolik: Vazifa saqlanmadi!');
                    return;
                }
            } else {
                // If no token (demo mode), just optimistic
                console.warn('No token found, skipping API save');
                onAdd({ title, priority, duration, startAt });
            }

            setTitle('');
            setStartAt('');
        } catch (error) {
            console.error(error);
            alert('Tarmoq xatoligi!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <PlusCircle className="text-blue-600" />
                Yangi Vazifa Qo‘shish
            </h3>

            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Vazifa Nomi</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Type size={16} className="text-gray-500" />
                    </div>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="block w-full pl-10 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                        placeholder="Masalan: Hisobot yozish"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Boshlanish Vaqti</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock size={16} className="text-gray-500" />
                    </div>
                    <input
                        type="datetime-local"
                        value={startAt}
                        onChange={(e) => setStartAt(e.target.value)}
                        className="block w-full pl-10 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Muhimlik</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <AlertCircle size={16} className="text-gray-500" />
                        </div>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="block w-full pl-10 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                        >
                            <option value="NORMAL">Normal</option>
                            <option value="IMPORTANT">Muhim</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Davomiyligi</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Clock size={16} className="text-gray-500" />
                        </div>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="block w-full pl-10 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                        >
                            <option value={30}>30 daqiqa</option>
                            <option value={60}>1 soat</option>
                            <option value={90}>1.5 soat</option>
                            <option value={120}>2 soat</option>
                            <option value={180}>3 soat</option>
                        </select>
                    </div>
                </div>
            </div>

            {startAt && (
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                    <p className="font-bold flex items-center gap-2">
                        <Clock size={16} />
                        Bot Eslatmasi:
                    </p>
                    <p>
                        Vazifa {new Date(startAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} da boshlanadi.
                        <br />
                        Bot sizga <b>{new Date(new Date(startAt).getTime() - 30 * 60000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</b> da xabar yuboradi.
                    </p>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300 font-bold"
            >
                {loading ? 'Saqlanmoqda...' : <><Save size={20} /> Saqlash</>}
            </button>
        </form>
    );
}
