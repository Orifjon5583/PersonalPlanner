"use client";

import { ListTodo, CheckCircle2, Activity, Clock } from 'lucide-react';

export function StatCard({ title, value, subtext, color = "blue" }: { title: string; value: string; subtext: string; color?: string }) {
    const colorClasses: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        red: "bg-red-50 text-red-600",
    };

    const icons: Record<string, React.ReactNode> = {
        blue: <ListTodo size={24} />,
        green: <Activity size={24} />,
        purple: <Clock size={24} />,
        red: <CheckCircle2 size={24} />,
    };

    return (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="mt-1 text-2xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={`p-3 rounded-full ${colorClasses[color] || colorClasses.blue}`}>
                    {icons[color] || <Activity size={24} />}
                </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">{subtext}</p>
        </div>
    );
}
