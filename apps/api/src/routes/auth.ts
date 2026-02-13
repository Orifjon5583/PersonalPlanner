import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '../app';

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
    app.post('/register', {
        schema: {
            body: z.object({
                name: z.string(),
                email: z.string().email(),
                password: z.string().min(6),
            }),
        },
    }, async (request, reply) => {
        const { name, email, password } = request.body as any;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return reply.status(400).send({ message: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, passwordHash },
        });

        const token = app.jwt.sign({ id: user.id, email: user.email });
        return { token, user: { id: user.id, name: user.name, email: user.email } };
    });

    app.post('/login', {
        schema: {
            body: z.object({
                email: z.string().email(),
                password: z.string(),
            }),
        },
    }, async (request, reply) => {
        const { email, password } = request.body as any;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return reply.status(401).send({ message: 'Invalid credentials' });
        }

        const token = app.jwt.sign({ id: user.id, email: user.email });
        return { token, user: { id: user.id, name: user.name, email: user.email } };
    });

    app.get('/me', {
        onRequest: [app.authenticate]
    }, async (request) => {
        return request.user;
    });
}
