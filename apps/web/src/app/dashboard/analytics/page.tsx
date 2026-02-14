"use client";

import { useState, useEffect } from 'react';
import { BarChart, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
    const [weeklyStats, setWeeklyStats] = useState<{ totalDone: number, dailyCounts: { date: string, count: number }[] } | null>(null);
    const [productivityStats, setProductivityStats] = useState<{ totalDone30Days: number, dailyTrend: { date: string, count: number }[] } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const weeklyRes = await fetch('http://localhost:3001/api/analytics/tasks/weekly', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (weeklyRes.ok) setWeeklyStats(await weeklyRes.json());

                const prodRes = await fetch('http://localhost:3001/api/analytics/productivity', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (prodRes.ok) setProductivityStats(await prodRes.json());

            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            }
        };

        fetchData();
    }, []);

    const getMaxCount = (data: { count: number }[]) => Math.max(...data.map(d => d.count), 1);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Analitika</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Weekly Tasks Chart */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col h-96">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <BarChart className="text-blue-600" size={20} />
                                Haftalik Vazifalar
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Oxirgi 7 kunlik statistika</p>
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-bold text-blue-600">{weeklyStats?.totalDone || 0}</span>
                            <span className="text-xs text-gray-400 font-medium">JAM Bajarilgan</span>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-2 pt-4 border-b border-gray-100 pb-2">
                        {weeklyStats?.dailyCounts.map((d, i) => {
                            const heightPercent = (d.count / getMaxCount(weeklyStats.dailyCounts)) * 100;
                            const dayName = new Date(d.date).toLocaleDateString('uz-UZ', { weekday: 'short' });
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="relative w-full flex justify-center items-end h-48 bg-gray-50 rounded-t-lg overflow-hidden">
                                        <div
                                            className="w-full mx-1 bg-blue-500 rounded-t-md transition-all duration-500 group-hover:bg-blue-600"
                                            style={{ height: `${heightPercent}%` }}
                                        ></div>
                                        {d.count > 0 && (
                                            <span className="absolute -top-6 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                {d.count}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 uppercase">{dayName}</span>
                                </div>
                            );
                        })}
                        {!weeklyStats && <p className="w-full text-center text-gray-400">Yuklanmoqda...</p>}
                    </div>
                </div>

                {/* Productivity Trend */}
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col h-96">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <TrendingUp className="text-green-600" size={20} />
                                Unumdorlik Trendi
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Oxirgi 30 kunlik dinamika</p>
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-bold text-green-600">{productivityStats?.totalDone30Days || 0}</span>
                            <span className="text-xs text-gray-400 font-medium">30 Kunda Bajarilgan</span>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end gap-1 overflow-x-auto pb-2">
                        {productivityStats?.dailyTrend.map((d, i) => {
                            const heightPercent = (d.count / getMaxCount(productivityStats.dailyTrend)) * 100;
                            return (
                                <div key={i} className="flex-1 min-w-[10px] flex flex-col items-center gap-1 group relative">
                                    <div
                                        className="w-full bg-green-100 rounded-t-sm hover:bg-green-500 transition-colors duration-300"
                                        style={{ height: `${Math.max(heightPercent, 5)}%` }}
                                    ></div>
                                    {d.count > 0 && (
                                        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded z-10 whitespace-nowrap">
                                            {new Date(d.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' })}: {d.count}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {!productivityStats && <p className="w-full text-center text-gray-400">Yuklanmoqda...</p>}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                        <span>30 kun oldin</span>
                        <span>Bugun</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
