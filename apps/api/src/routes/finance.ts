import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { FinanceService } from '../services/financeService';

export const financeRoutes: FastifyPluginAsyncZod = async (app) => {
    app.addHook('onRequest', app.authenticate);

    app.post('/income', {
        schema: {
            body: z.object({
                amount: z.number(),
                month: z.string() // YYYY-MM
            })
        }
    }, async (req) => {
        const { amount, month } = req.body as { amount: number; month: string };
        return FinanceService.addIncome(req.user.id, amount, month);
    });

    app.post('/expense', {
        schema: {
            body: z.object({
                categoryId: z.string(),
                amount: z.number(),
                spentAt: z.string(),
                note: z.string().optional()
            })
        }
    }, async (req) => {
        const { categoryId, amount, spentAt, note } = req.body as { categoryId: string; amount: number; spentAt: string; note?: string };
        return FinanceService.addExpense(req.user.id, { categoryId, amount, spentAt, note });
    });

    app.get('/transactions', async (req) => {
        return FinanceService.getTransactions(req.user.id);
    });

    app.get('/summary', {
        schema: {
            querystring: z.object({
                month: z.string()
            })
        }
    }, async (req) => {
        const { month } = req.query as { month: string };
        return FinanceService.getMonthlySummary(req.user.id, month);
    });
}