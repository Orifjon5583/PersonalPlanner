import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../app';

export const eventRoutes: FastifyPluginAsyncZod = async (app) => {
    app.addHook('onRequest', app.authenticate);

    // Get all events (optionally filter by month)
    app.get('/', async (req) => {
        const query = req.query as { month?: string };
        const where: any = { userId: req.user.id };

        if (query.month) {
            const start = new Date(`${query.month}-01`);
            const end = new Date(start);
            end.setMonth(end.getMonth() + 1);
            where.startAt = { gte: start, lt: end };
        }

        return prisma.event.findMany({
            where,
            orderBy: { startAt: 'asc' },
        });
    });

    // Create event
    app.post('/', {
        schema: {
            body: z.object({
                title: z.string(),
                description: z.string().optional(),
                color: z.string().optional(),
                startAt: z.string(),
                endAt: z.string(),
                allDay: z.boolean().optional(),
            }),
        },
    }, async (req) => {
        const { title, description, color, startAt, endAt, allDay } = req.body as any;
        return prisma.event.create({
            data: {
                userId: req.user.id,
                title,
                description,
                color: color || '#3B82F6',
                startAt: new Date(startAt),
                endAt: new Date(endAt),
                allDay: allDay || false,
            },
        });
    });

    // Delete event
    app.delete('/:id', {
        schema: {
            params: z.object({ id: z.string() }),
        },
    }, async (req) => {
        const { id } = req.params as { id: string };
        return prisma.event.delete({
            where: { id, userId: req.user.id },
        });
    });
};
