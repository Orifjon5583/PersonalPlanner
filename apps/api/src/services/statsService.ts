import { prisma } from '../app';
import { startOfWeek, endOfWeek, subDays, format } from 'date-fns';

export class StatsService {
    static async getWeeklyTaskStats(userId: string) {
        const today = new Date();
        const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
        const end = endOfWeek(today, { weekStartsOn: 1 });

        const tasks = await prisma.task.findMany({
            where: {
                userId,
                status: 'DONE',
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
            const count = tasks.filter((t: any) => format(t.updatedAt, 'yyyy-MM-dd') === day).length;
            return { date: day, count };
        });

        return {
            totalDone: tasks.length,
            dailyCounts: counts
        };
    }

    static async getMonthlyProductivity(userId: string) {
        const today = new Date();
        const start = subDays(today, 30);

        const tasks = await prisma.task.findMany({
            where: {
                userId,
                status: 'DONE',
                updatedAt: { gte: start }
            }
        });

        // Group by 3-day intervals to smooth the chart or just daily for last 30 days
        // Let's do daily for last 14 days for a cleaner chart, or weekly Trend?
        // User asked for "Unumdorlik Trendi" (Productivity Trend). 
        // Let's return daily counts for the last 30 days.

        const days: string[] = [];
        for (let i = 0; i < 30; i++) {
            const d = subDays(today, 29 - i); // Start from 30 days ago
            days.push(format(d, 'yyyy-MM-dd'));
        }

        const counts = days.map(day => {
            const count = tasks.filter((t: any) => format(t.updatedAt, 'yyyy-MM-dd') === day).length;
            // Weighted productivity? For now just count.
            return { date: day, count };
        });

        return {
            totalDone30Days: tasks.length,
            dailyTrend: counts
        };
    }
}
