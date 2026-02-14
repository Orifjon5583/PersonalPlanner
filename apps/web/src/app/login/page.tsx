"use client";

import { useState } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {

    const [platform, setPlatform] = useState<'select' | 'web' | 'telegram'>('select');
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, register, loading, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isRegister) {
            await register(name, email, password);
        } else {
            await login(email, password);
        }
    };

    if (platform === 'select') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="w-full max-w-md mx-4 text-center">
                    <h1 className="text-4xl font-bold text-blue-600 mb-2">Personal Planner</h1>
                    <p className="text-gray-500 mb-8">Davom etish uchun platformani tanlang</p>

                    <div className="grid gap-4">
                        <button
                            onClick={() => setPlatform('web')}
                            className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:border-blue-500 hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <User size={24} />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-gray-900">Web Sayt</h3>
                                    <p className="text-sm text-gray-500">Brauzer orqali kirish</p>
                                </div>
                            </div>
                            <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </button>

                        <button
                            onClick={() => setPlatform('telegram')}
                            className="flex items-center justify-between p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:border-blue-500 hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Mail size={24} /> {/* Telegram icon usually requires external SVG, using Mail as placeholder */}
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-gray-900">Telegram Bot</h3>
                                    <p className="text-sm text-gray-500">Bot orqali boshqarish</p>
                                </div>
                            </div>
                            <ArrowRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (platform === 'telegram') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="w-full max-w-md mx-4 text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Telegram Bot</h2>
                    <p className="text-gray-500 mb-6">Botimizga o'tish uchun quyidagi havolani bosing yoki skanerlang.</p>

                    <a
                        href="https://t.me/PersonalPlannerBot"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors mb-6"
                    >
                        Botga o'tish <ArrowRight size={18} />
                    </a>

                    <button
                        onClick={() => setPlatform('select')}
                        className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                        Ortga qaytish
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="w-full max-w-md mx-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600">Personal Planner</h1>
                    <p className="text-gray-500 mt-2">
                        {isRegister ? "Yangi hisob yarating" : "Hisobingizga kiring"}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <button
                        onClick={() => setPlatform('select')}
                        className="mb-4 text-sm text-gray-400 hover:text-blue-600 flex items-center gap-1"
                    >
                        ← Ortga
                    </button>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isRegister && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ism</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ismingizni kiriting"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400 transition-colors"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Parol</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400 transition-colors"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    {isRegister ? "Ro'yxatdan o'tish" : "Kirish"}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => { setIsRegister(!isRegister); }}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                            {isRegister
                                ? "Hisobingiz bormi? Kirish"
                                : "Hisobingiz yo'qmi? Ro'yxatdan o'ting"}
                        </button>
                    </div>
                </div>

                {/* Demo credentials hint */}
                <div className="mt-4 text-center text-xs text-gray-400">
                    Demo: demo@planner.uz / demo123 (Orifjon Kenjaboyev)
                </div>
            </div>
        </div>
    );
}
