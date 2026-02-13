
import { Bell } from 'lucide-react';

export default function Header() {
    return (
        <header className="flex h-16 items-center justify-end bg-white px-6 shadow-sm">
            <div className="flex items-center gap-4">
                <button className="text-gray-500 hover:text-gray-700 relative">
                    <Bell size={20} />
                    <span className="sr-only">Notifications</span>
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                    U
                </div>
            </div>
        </header>
    );
}
