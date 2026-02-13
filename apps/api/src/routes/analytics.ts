import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { StatsService } from '../services/statsService';
import { ChartService } from '../services/chartService';

export const analyticsRoutes: FastifyPluginAsyncZod = async (app) => {
    app.addHook('onRequest', app.authenticate);

    app.get('/tasks/weekly', async (req, reply) => {
        return StatsService.getWeeklyTaskStats(req.user.id);
    });

    app.get('/charts/weekly-tasks.png', async (req, reply) => {
        const stats = await StatsService.getWeeklyTaskStats(req.user.id);
        const labels = stats.dailyCounts.map(d => d.date);
        const data = stats.dailyCounts.map(d => d.count);

        const buffer = await ChartService.generateLineChart('Weekly Done Tasks', labels, data);
        reply.type('image/png').send(buffer);
    });
}
