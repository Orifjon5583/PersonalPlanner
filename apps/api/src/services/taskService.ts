import { PrismaClient, Task, TaskPriority, TaskStatus } from '@prisma/client';
import { prisma } from '../app';
import { startOfDay, endOfDay, addMinutes, isBefore, isAfter, parseISO } from 'date-fns';

export class TaskService {
    static async create(userId: string, data: {
        title: string;
        description?: string;
        priority: TaskPriority;
        durationMinutes: number;
        startAt?: string; // ISO string
        dueAt?: string;
    }) {
        // Overlap check if startAt is provided
        if (data.startAt) {
            const start = new Date(data.startAt);
            const end = addMinutes(start, data.durationMinutes);

            const hasOverlap = await this.checkOverlap(userId, start, end);
            if (hasOverlap) {
                throw new Error('Time slot overlaps with an existing task.');
            }

            return prisma.task.create({
                data: {
                    userId,
                    title: data.title,
                    description: data.description,
                    priority: data.priority,
                    durationMinutes: data.durationMinutes,
                    startAt: start,
                    endAt: end,
                    planned: true, // It is planned if it has a start time
                    dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
                    status: TaskStatus.TODO
                }
            });
        }

        // Backlog task
        return prisma.task.create({
            data: {
                userId,
                title: data.title,
                description: data.description,
                priority: data.priority,
                durationMinutes: data.durationMinutes,
                planned: false,
                dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
                status: TaskStatus.TODO
            }
        });
    }

    static async checkOverlap(userId: string, start: Date, end: Date, excludeTaskId?: string): Promise<boolean> {
        const overlappingTask = await prisma.task.findFirst({
            where: {
                userId,
                planned: true,
                id: excludeTaskId ? { not: excludeTaskId } : undefined,
                status: { not: TaskStatus.DONE }, // Optional: Decide if DONE tasks block slots. Usually yes for history, but maybe not for re-planning. Let's assume YES for now.
                AND: [
                    { startAt: { lt: end } },
                    { endAt: { gt: start } }
                ]
            }
        });
        return !!overlappingTask;
    }

    static async getWorkGaps(userId: string, date: Date) {
        const workStartHour = 8;
        const workEndHour = 22;

        const dayStart = startOfDay(date);
        const workStart = new Date(dayStart); workStart.setHours(workStartHour, 0, 0, 0);
        const workEnd = new Date(dayStart); workEnd.setHours(workEndHour, 0, 0, 0);

        const tasks = await prisma.task.findMany({
            where: {
                userId,
                planned: true,
                startAt: { gte: workStart, lt: workEnd },
                status: { not: TaskStatus.DONE } // Only active tasks block slots? Or handled tasks too? Let's check all planned tasks.
            },
            orderBy: { startAt: 'asc' }
        });

        const gaps: { start: Date, end: Date, duration: number }[] = [];
        let lastEnd = workStart;

        for (const task of tasks) {
            if (!task.startAt) continue;
            // Check gap between lastEnd and task.startAt
            const gapDuration = (task.startAt.getTime() - lastEnd.getTime()) / (1000 * 60);
            if (gapDuration >= 60) {
                gaps.push({ start: lastEnd, end: task.startAt, duration: gapDuration });
            }
            if (task.endAt && isAfter(task.endAt, lastEnd)) {
                lastEnd = task.endAt;
            }
        }

        // Check final gap
        const finalGapDuration = (workEnd.getTime() - lastEnd.getTime()) / (1000 * 60);
        if (finalGapDuration >= 60) {
            gaps.push({ start: lastEnd, end: workEnd, duration: finalGapDuration });
        }

        return gaps;
    }

    static async autoPlan(userId: string, date: Date) {
        // 1. Get Gaps
        const gaps = await this.getWorkGaps(userId, date);

        // 2. Get Backlog tasks sorted by priority
        const backlog = await prisma.task.findMany({
            where: {
                userId,
                planned: false,
                status: TaskStatus.TODO
            },
            orderBy: [
                { priority: 'asc' }, // IMPORTANT (enum order might need verification, usually alphabetically. We need custom sort if Enum isn't ordered correctly)
                // Prisma Enums are strings. We need to handle Priority carefully.
                // Let's assume we map them or fetch all and sort in JS if needed.
                // Actually, let's just fetch and sort in memory for robust priority logic: IMPORTANT > NORMAL > FUTURE
            ]
        });

        // Sort backlog manually to be safe
        const priorityOrder = { [TaskPriority.IMPORTANT]: 0, [TaskPriority.NORMAL]: 1, [TaskPriority.FUTURE]: 2 };
        backlog.sort((a: Task, b: Task) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        const plannedTasks = [];

        for (const task of backlog) {
            for (const gap of gaps) {
                if (gap.duration >= task.durationMinutes) {
                    // Fit it in!
                    const newStart = gap.start;
                    const newEnd = addMinutes(newStart, task.durationMinutes);

                    await prisma.task.update({
                        where: { id: task.id },
                        data: {
                            planned: true,
                            startAt: newStart,
                            endAt: newEnd
                        }
                    });

                    plannedTasks.push(task);

                    // Update gap (conceptually, we just consumed start of it. simplest is to re-calc gaps or just adjust local gap var)
                    gap.start = newEnd;
                    gap.duration -= task.durationMinutes;
                    break; // Move to next task
                }
            }
        }
        return {
            planned: plannedTasks.length,
            leftover: backlog.length - plannedTasks.length
        };
    }
}
