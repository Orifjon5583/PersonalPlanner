import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { TaskService } from '../services/taskService';
import { prisma } from '../app';
import { TaskPriority, TaskStatus } from '@prisma/client';

export const taskRoutes: FastifyPluginAsyncZod = async (app) => {
    app.addHook('onRequest', app.authenticate);

    app.post('/', {
        schema: {
            body: z.object({
                title: z.string(),
                description: z.string().optional(),
                priority: z.nativeEnum(TaskPriority).default(TaskPriority.NORMAL),
                durationMinutes: z.number().int().default(60),
                startAt: z.string().optional(),
                dueAt: z.string().optional()
            })
        }
    }, async (req) => {
        const { title, description, priority, durationMinutes, startAt, dueAt } = req.body as any;
        return TaskService.create(req.user.id, {
            title, description, priority, durationMinutes, startAt, dueAt
        });
    });

    app.get('/', async (req) => {
        // Add filters as needed
        return prisma.task.findMany({
            where: { userId: req.user.id }
        });
    });

    app.patch('/:id/done', {
        schema: {
            params: z.object({ id: z.string() })
        }
    }, async (req) => {
        const { id } = req.params as { id: string };
        return prisma.task.update({
            where: { id, userId: req.user.id },
            data: { status: TaskStatus.DONE, actualMinutes: 60 } // Default actual? Or pass it.
        });
    });

    app.post('/plan', {
        schema: {
            body: z.object({ date: z.string().optional() }) // YYYY-MM-DD or ISO
        }
    }, async (req) => {
        const body = req.body as { date?: string };
        const date = body.date ? new Date(body.date) : new Date();
        return TaskService.autoPlan(req.user.id, date);
    });

    app.get('/gaps', async (req) => {
        return TaskService.getWorkGaps(req.user.id, new Date());
    });
}
