
import { PrismaClient, TaskPriority, TaskStatus } from '@prisma/client';

console.log('TaskPriority:', TaskPriority);
console.log('TaskStatus:', TaskStatus);

const prisma = new PrismaClient();
console.log('Prisma Client instantiated successfully');
