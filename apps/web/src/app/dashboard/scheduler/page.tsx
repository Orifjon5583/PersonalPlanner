"use client";

import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, X, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../../../components/AuthProvider';

interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    color: string;
    startAt: string;
    endAt: string;
    allDay: boolean;
}

export default function SchedulerPage() {
    const { token } = useAuth();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showForm, setShowForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState<number | null>(null);

    // Form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [color, setColor] = useState('#3B82F6');

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' });

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
    const today = new Date();
    const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const dayNames = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'];

    useEffect(() => {
        if (!token) return;
        const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
        fetch(`http://localhost:3001/api/events?month=${monthStr}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : [])
            .then(setEvents)
            .catch(console.error);
    }, [token, year, month]);

    const getEventsForDay = (day: number) => {
        return events.filter(e => {
            const d = new Date(e.startAt);
            return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
        });
    };

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !selectedDate) return;

        const startAt = new Date(year, month, selectedDate, parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]));
        const endAt = new Date(year, month, selectedDate, parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]));

        try {
            const res = await fetch('http://localhost:3001/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title, description, color, startAt: startAt.toISOString(), endAt: endAt.toISOString() }),
            });
            if (res.ok) {
                const newEvent = await res.json();
                setEvents([...events, newEvent]);
                setTitle(''); setDescription(''); setShowForm(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!token) return;
        try {
            await fetch(`http://localhost:3001/api/events/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setEvents(events.filter(e => e.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const handleDayClick = (day: number) => {
        setSelectedDate(day);
        setShowForm(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Rejalashtirish</h1>
            </div>

            {/* Add Event Modal */}
            {showForm && (
                <div className="rounded-xl bg-white p-6 shadow-sm border border-blue-200 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">
                            Tadbir Qo'shish — {selectedDate} {currentDate.toLocaleDateString('uz-UZ', { month: 'long' })}
                        </h3>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleAddEvent} className="space-y-3">
                        <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="Tadbir nomi" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900" />
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                            placeholder="Tavsif (ixtiyoriy)" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-gray-900" />
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-600">Boshlanish</label>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900" />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-600">Tugash</label>
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 block mb-1">Rang</label>
                            <div className="flex gap-2">
                                {colors.map(c => (
                                    <button key={c} type="button" onClick={() => setColor(c)}
                                        className={`h-8 w-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                                        style={{ backgroundColor: c }} />
                                ))}
                            </div>
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                            Saqlash
                        </button>
                    </form>
                </div>
            )}

            {/* Calendar */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 capitalize">{monthName}</h2>
                    <div className="flex gap-2">
                        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ChevronLeft size={20} /></button>
                        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ChevronRight size={20} /></button>
                    </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(d => (
                        <div key={d} className="text-center text-sm font-semibold text-gray-400 py-1">{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells before first day */}
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-24 rounded-lg bg-gray-50"></div>
                    ))}

                    {/* Days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayEvents = getEventsForDay(day);
                        return (
                            <div
                                key={day}
                                onClick={() => handleDayClick(day)}
                                className={`h-24 rounded-lg border p-1.5 cursor-pointer transition-all hover:border-blue-300 hover:shadow-sm ${isToday(day) ? 'bg-blue-50 border-blue-300' : 'border-gray-100 hover:bg-gray-50'}`}
                            >
                                <span className={`text-sm font-medium ${isToday(day) ? 'text-blue-700 font-bold' : 'text-gray-700'}`}>{day}</span>
                                <div className="mt-0.5 space-y-0.5 overflow-hidden">
                                    {dayEvents.slice(0, 2).map(ev => (
                                        <div key={ev.id} className="flex items-center gap-1 group">
                                            <div className="text-[10px] px-1 py-0.5 rounded truncate flex-1 text-white font-medium"
                                                style={{ backgroundColor: ev.color }}>
                                                {ev.title}
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id); }}
                                                className="hidden group-hover:block text-gray-400 hover:text-red-500 flex-shrink-0">
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <span className="text-[10px] text-gray-400">+{dayEvents.length - 2} yana</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Today's Events */}
            {events.filter(e => {
                const d = new Date(e.startAt);
                return d.toDateString() === today.toDateString();
            }).length > 0 && (
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Bugungi Tadbirlar</h3>
                        <div className="space-y-2">
                            {events.filter(e => new Date(e.startAt).toDateString() === today.toDateString()).map(ev => (
                                <div key={ev.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                    <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }}></div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{ev.title}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(ev.startAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                            {' — '}
                                            {new Date(ev.endAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <button onClick={() => handleDeleteEvent(ev.id)} className="text-gray-300 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
        </div>
    );
}
