"use client";

import { useState, useEffect } from 'react';
import FinanceForm from '../../../components/FinanceForm';
import FinanceWidget from '../../../components/FinanceWidget';

interface Transaction {
    id: number;
    amount: number;
    category: string;
    type: 'EXPENSE' | 'INCOME';
    date: string;
}

export default function FinancePage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/finance/transactions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const formatted = data.map((t: any) => ({
                    id: t.id,
                    amount: t.amount,
                    category: t.category,
                    type: t.type,
                    date: new Date(t.date).toLocaleDateString('en-GB')
                }));
                setTransactions(formatted);
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        }
    };

    const addTransaction = (newTx: { id?: number; amount: number; category: string; type: 'EXPENSE' | 'INCOME' }) => {
        const tx: Transaction = {
            id: newTx.id || Date.now(),
            ...newTx,
            date: new Date().toLocaleDateString('en-GB')
        };
        setTransactions([tx, ...transactions]);
    };

    const deleteTransaction = (id: number) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Moliya</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Form */}
                <div>
                    <FinanceForm onAdd={addTransaction} />
                </div>

                {/* Right Column: List & Stats */}
                <div className="lg:col-span-2">
                    <FinanceWidget transactions={transactions} onDelete={deleteTransaction} />
                </div>
            </div>
        </div>
    );
}
