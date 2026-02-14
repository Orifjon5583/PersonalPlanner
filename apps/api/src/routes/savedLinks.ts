import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../app';

export const savedLinkRoutes: FastifyPluginAsyncZod = async (app) => {
    app.addHook('onRequest', app.authenticate);

    // Get all saved links
    app.get('/', async (req) => {
        return prisma.savedLink.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
    });

    // Create saved link
    app.post('/', {
        schema: {
            body: z.object({
                siteName: z.string(),
                siteUrl: z.string(),
                username: z.string().optional(),
                password: z.string().optional(),
                notes: z.string().optional(),
            }),
        },
    }, async (req) => {
        const { siteName, siteUrl, username, password, notes } = req.body as any;
        return prisma.savedLink.create({
            data: { userId: req.user.id, siteName, siteUrl, username, password, notes },
        });
    });

    // Update saved link
    app.put('/:id', {
        schema: {
            params: z.object({ id: z.string() }),
            body: z.object({
                siteName: z.string().optional(),
                siteUrl: z.string().optional(),
                username: z.string().optional(),
                password: z.string().optional(),
                notes: z.string().optional(),
            }),
        },
    }, async (req) => {
        const { id } = req.params as { id: string };
        const data = req.body as any;
        return prisma.savedLink.update({
            where: { id, userId: req.user.id },
            data,
        });
    });

    // Delete saved link
    app.delete('/:id', {
        schema: {
            params: z.object({ id: z.string() }),
        },
    }, async (req) => {
        const { id } = req.params as { id: string };
        return prisma.savedLink.delete({
            where: { id, userId: req.user.id },
        });
    });
};
