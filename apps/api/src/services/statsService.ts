import { prisma } from '../app';
import { startOfWeek, endOfWeek, subDays, format } from 'date-fns';
import { TaskStatus } from '@prisma/client';

export class StatsService {
    static async getWeeklyTaskStats(userId: string) {
        const today = new Date();
        const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
        const end = endOfWeek(today, { weekStartsOn: 1 });

        const tasks = await prisma.task.findMany({
            where: {
                userId,
                status: TaskStatus.DONE,
                updatedAt: { gte: start, lte: end }
            }
        });

        // Group by day
        const days: string[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            days.push(format(d, 'yyyy-MM-dd'));
        }

        const counts = days.map(day => {
            const count = tasks.filter(t => format(t.updatedAt, 'yyyy-MM-dd') === day).length;
            return { date: day, count };
        });

        return {
            totalDone: tasks.length,
            dailyCounts: counts
        };
    }

    // Add more analytics logic needed for charts
}
