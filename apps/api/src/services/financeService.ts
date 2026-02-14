import { PrismaClient, BudgetType } from '@prisma/client';
import { prisma } from '../app';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export class FinanceService {
    static async addIncome(userId: string, amount: number, monthStr: string) {
        // monthStr format: YYYY-MM
        // 1. Create Income record
        const income = await prisma.income.create({
            data: {
                userId,
                amount,
                month: monthStr
            }
        });

        // 2. Create or Update Budgets (50/30/20)
        // If budgets exist for this month, adding more income should increase them? 
        // Or just overwrite? Requirement says "Income kiritilganda avtomatik BudgetCategory yaratiladi".
        // Let's assume we ADD to existing limits if they exist, or create new ones.

        const categories = [
            { type: BudgetType.NECESSARY, percent: 50, name: 'Necessary' },
            { type: BudgetType.COMFORT, percent: 30, name: 'Comfort' },
            { type: BudgetType.SAVINGS, percent: 20, name: 'Savings' }
        ];

        for (const cat of categories) {
            const limitAmount = Math.floor(amount * (cat.percent / 100));

            const existing = await prisma.budgetCategory.findFirst({
                where: { userId, month: monthStr, type: cat.type }
            });

            if (existing) {
                await prisma.budgetCategory.update({
                    where: { id: existing.id },
                    data: { limitAmount: existing.limitAmount + limitAmount }
                });
            } else {
                await prisma.budgetCategory.create({
                    data: {
                        userId,
                        month: monthStr,
                        type: cat.type,
                        name: cat.name,
                        percent: cat.percent,
                        limitAmount
                    }
                });
            }
        }

        return income;
    }

    static async addExpense(userId: string, data: {
        categoryId: string;
        amount: number;
        spentAt: string; // ISO
        note?: string;
    }) {
        return prisma.expense.create({
            data: {
                userId,
                categoryId: data.categoryId,
                amount: data.amount,
                spentAt: new Date(data.spentAt),
                note: data.note
            }
        });
    }

    static async getMonthlySummary(userId: string, monthStr: string) {
        // Get all categories for the month
        const categories = await prisma.budgetCategory.findMany({
            where: { userId, month: monthStr },
            include: {
                expenses: true
            }
        });

        const summary = categories.map(cat => {
            const spent = cat.expenses.reduce((sum, e) => sum + e.amount, 0);
            return {
                id: cat.id,
                name: cat.name,
                type: cat.type,
                limit: cat.limitAmount,
                spent,
                remaining: cat.limitAmount - spent,
                percentUsed: cat.limitAmount > 0 ? (spent / cat.limitAmount) * 100 : 0
            };
        });

        const totalIncome = await prisma.income.aggregate({
            where: { userId, month: monthStr },
            _sum: { amount: true }
        });

        const totalSpent = summary.reduce((sum: number, c: any) => sum + (c.spent as number), 0);

        return {
            month: monthStr,
            totalIncome: totalIncome._sum.amount || 0,
            totalSpent,
            categories: summary
        };
    }

    static async getTransactions(userId: string) {
        // Fetch last 20 transactions (income + expense)
        const incomes = await prisma.income.findMany({
            select: { id: true, amount: true, createdAt: true },
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        const expenses = await prisma.expense.findMany({
            select: {
                id: true,
                amount: true,
                category: { select: { name: true } },
                createdAt: true
            },
            where: { category: { userId } },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // Merge and sort
        const txs = [
            ...incomes.map(i => ({
                id: i.id,
                amount: i.amount,
                category: 'Daromad',
                type: 'INCOME',
                date: i.createdAt
            })),
            ...expenses.map(e => ({
                id: e.id,
                amount: e.amount,
                category: e.category.name,
                type: 'EXPENSE',
                date: e.createdAt
            }))
        ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 20);

        return txs;
    }
}

