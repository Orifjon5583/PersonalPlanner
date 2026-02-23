"use client";

import { useState, useEffect } from 'react';
import { Plus, ExternalLink, Trash2, Eye, EyeOff, Globe, User, Lock, FileText, X, LogOut, Mail } from 'lucide-react';
import { useAuth } from '../../../components/AuthProvider';

interface SavedLink {
    id: string;
    siteName: string;
    siteUrl: string;
    username?: string;
    password?: string;
    notes?: string;
}

export default function ProfilePage() {
    const { token, user, logout } = useAuth();
    const [links, setLinks] = useState<SavedLink[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

    // Form state
    const [siteName, setSiteName] = useState('');
    const [siteUrl, setSiteUrl] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (!token) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/links`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : [])
            .then(setLinks)
            .catch(console.error);
    }, [token]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ siteName, siteUrl, username, password, notes }),
            });
            if (res.ok) {
                const newLink = await res.json();
                setLinks([newLink, ...links]);
                setSiteName(''); setSiteUrl(''); setUsername(''); setPassword(''); setNotes('');
                setShowForm(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!token) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/links/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setLinks(links.filter(l => l.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const togglePassword = (id: string) => {
        const next = new Set(visiblePasswords);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setVisiblePasswords(next);
    };

    const openSite = (url: string) => {
        let finalUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            finalUrl = 'https://' + url;
        }
        window.open(finalUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="space-y-6">
            {/* User Profile Card */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                            <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                                <Mail size={14} />
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-5 py-2.5 text-red-600 font-medium hover:bg-red-100 transition-colors"
                    >
                        <LogOut size={18} />
                        Chiqish
                    </button>
                </div>
            </div>

            {/* Saved Sites Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Saqlangan Saytlar</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />}
                    {showForm ? 'Bekor qilish' : 'Sayt Qo\'shish'}
                </button>
            </div>

            {/* Add Link Form */}
            {showForm && (
                <form onSubmit={handleAdd} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-5">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Yangi Sayt Qo'shish</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sayt Nomi</label>
                            <div className="relative">
                                <Globe size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500/70" />
                                <input type="text" required value={siteName} onChange={e => setSiteName(e.target.value)}
                                    placeholder="Masalan: Gmail" className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all sm:text-sm placeholder:text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Elektron manzil (URL)</label>
                            <input type="text" required value={siteUrl} onChange={e => setSiteUrl(e.target.value)}
                                placeholder="gmail.com" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all sm:text-sm placeholder:text-gray-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Login yoki pochta</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500/70" />
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                                    placeholder="Foydalanuvchi nomi" className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all sm:text-sm placeholder:text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Parol</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500/70" />
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••" className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all sm:text-sm placeholder:text-gray-400" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Izoh</label>
                        <div className="relative">
                            <FileText size={18} className="absolute left-3.5 top-3.5 text-blue-500/70" />
                            <textarea value={notes} onChange={e => setNotes(e.target.value)}
                                placeholder="Qo'shimcha ma'lumot..." rows={2}
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all sm:text-sm placeholder:text-gray-400 resize-none" />
                        </div>
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="bg-blue-600 w-full sm:w-auto text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm focus:ring-4 focus:ring-blue-500/30">
                            Saqlash
                        </button>
                    </div>
                </form>
            )}

            {/* Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {links.map(link => (
                    <div key={link.id} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{link.siteName}</h4>
                                    <p className="text-xs text-gray-400 truncate max-w-[150px]">{link.siteUrl}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(link.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {link.username && (
                            <div className="text-sm mb-1">
                                <span className="text-gray-400">Login: </span>
                                <span className="text-gray-700 font-medium">{link.username}</span>
                            </div>
                        )}
                        {link.password && (
                            <div className="text-sm mb-1 flex items-center gap-2">
                                <span className="text-gray-400">Parol: </span>
                                <span className="text-gray-700 font-mono">
                                    {visiblePasswords.has(link.id) ? link.password : '••••••••'}
                                </span>
                                <button onClick={() => togglePassword(link.id)} className="text-gray-400 hover:text-blue-500">
                                    {visiblePasswords.has(link.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        )}
                        {link.notes && <p className="text-xs text-gray-400 mt-2">{link.notes}</p>}

                        <button
                            onClick={() => openSite(link.siteUrl)}
                            className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                        >
                            <ExternalLink size={16} />
                            Saytga kirish
                        </button>
                    </div>
                ))}
            </div>

            {links.length === 0 && !showForm && (
                <div className="text-center py-12 text-gray-400 font-medium">
                    Hozircha saqlangan saytlar yo'q. Yuqoridagi "Sayt Qo'shish" tugmasini bosing.
                </div>
            )}
        </div>
    );
}
