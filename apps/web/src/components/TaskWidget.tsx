
import { CheckCircle, Circle, Clock, Trash2 } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    time: string;
    status: 'pending' | 'done';
}

interface TaskWidgetProps {
    tasks: Task[];
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function TaskWidget({ tasks, onToggle, onDelete }: TaskWidgetProps) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Bugungi Vazifalar</h3>
                <span className="text-sm font-bold text-blue-600">Jami: {tasks.length}</span>
            </div>
            <div className="space-y-3">
                {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
                        <div className="flex items-center gap-3">
                            <button onClick={() => onToggle(task.id)} className={`${task.status === 'done' ? 'text-green-500' : 'text-orange-500'}`}>
                                {task.status === 'done' ? <CheckCircle size={24} /> : <Circle size={24} />}
                            </button>
                            <div>
                                <p className={`text-base font-bold ${task.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                    {task.title}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                                    <Clock size={12} />
                                    {task.time}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => onDelete(task.id)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {tasks.length === 0 && <p className="text-base font-medium text-gray-500 text-center py-8">Bugun vazifalar yo‘q!</p>}
            </div>
        </div>
    );
}
