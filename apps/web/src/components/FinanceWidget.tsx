
import { ArrowDownLeft, ArrowUpRight, DollarSign, Trash2 } from 'lucide-react';

interface Transaction {
    id: number;
    amount: number;
    category: string;
    type: 'EXPENSE' | 'INCOME';
    date: string;
}

interface FinanceWidgetProps {
    transactions: Transaction[];
    onDelete: (id: number) => void;
}

export default function FinanceWidget({ transactions, onDelete }: FinanceWidgetProps) {
    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;

    return (
        <div className="space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-blue-600 text-white">
                    <p className="text-sm font-medium opacity-90">Jami Balans</p>
                    <h3 className="text-2xl font-bold mt-1">{balance.toLocaleString('fr-FR')} so'm</h3>
                </div>
                <div className="p-4 rounded-xl bg-green-50 text-green-700 border border-green-100">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowDownLeft size={16} />
                        <p className="text-sm font-bold">Kirim</p>
                    </div>
                    <h3 className="text-xl font-bold">+{totalIncome.toLocaleString('fr-FR')} so'm</h3>
                </div>
                <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-100">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowUpRight size={16} />
                        <p className="text-sm font-bold">Chiqim</p>
                    </div>
                    <h3 className="text-xl font-bold">-{totalExpense.toLocaleString('fr-FR')} so'm</h3>
                </div>
            </div>

            {/* Transactions List */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Oxirgi Tranzaksiyalar</h3>
                <div className="space-y-3">
                    {transactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${t.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {t.type === 'INCOME' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                </div>
                                <div>
                                    <p className="text-base font-bold text-gray-900">{t.category}</p>
                                    <p className="text-xs text-gray-500 font-medium">{t.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString('fr-FR')} so'm
                                </span>
                                <button
                                    onClick={() => onDelete(t.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {transactions.length === 0 && <p className="text-gray-500 text-center py-6 font-medium">Hozircha ma'lumot yo'q.</p>}
                </div>
            </div>
        </div>
    );
}
