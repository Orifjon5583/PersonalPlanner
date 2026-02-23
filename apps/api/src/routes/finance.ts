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
    }, async (req: any) => {
        const { amount, month } = req.body;
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
    }, async (req: any) => {
        const { categoryId, amount, spentAt, note } = req.body;
        return FinanceService.addExpense(req.user.id, { categoryId, amount, spentAt, note });
    });

    app.get('/transactions', async (req: any) => {
        return FinanceService.getTransactions(req.user.id);
    });

    app.get('/summary', {
        schema: {
            querystring: z.object({
                month: z.string()
            })
        }
    }, async (req: any) => {
        const { month } = req.query;
        return FinanceService.getMonthlySummary(req.user.id, month);
    });
}