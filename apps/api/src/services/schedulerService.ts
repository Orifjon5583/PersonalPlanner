import cron from 'node-cron';
import { prisma } from '../app';
import { bot } from '../bot';
import { TaskService } from './taskService';
import { ChartService } from './chartService';
import { StatsService } from './statsService';
import { TaskStatus } from '@prisma/client';
import { format } from 'date-fns';

export class SchedulerService {
    static init() {
        // 1. Daily Plan Notification at 08:00
        cron.schedule('0 8 * * *', async () => {
            console.log('Running 08:00 Daily Plan Job');
            const users = await prisma.user.findMany({ where: { telegramChatId: { not: null } } });
            for (const user of users) {
                if (!user.telegramChatId) continue;

                const today = new Date();
                const startOfToday = new Date(today.setHours(0, 0, 0, 0));
                const endOfToday = new Date(today.setHours(23, 59, 59, 999));

                const tasks = await prisma.task.findMany({
                    where: {
                        userId: user.id,
                        planned: true,
                        startAt: { gte: startOfToday, lte: endOfToday },
                        status: { not: TaskStatus.DONE }
                    },
                    orderBy: { startAt: 'asc' }
                });

                if (tasks.length > 0) {
                    let msg = `📅 Bugungi reja:\n\n`;
                    tasks.forEach(t => {
                        const time = t.startAt ? format(t.startAt, 'HH:mm') : '??:??';
                        msg += `${time} - ${t.title} (${t.durationMinutes}m) ${t.priority === 'IMPORTANT' ? '🔴' : t.priority === 'NORMAL' ? '🟠' : '🔵'}\n`;
                    });
                    await bot.telegram.sendMessage(user.telegramChatId, msg);
                } else {
                    await bot.telegram.sendMessage(user.telegramChatId, `📅 Bugunga reja yo‘q. /plan qilib rejalashtiring.`);
                }
            }
        });

        // 2. Gap Reminders (10, 12, 14, 16, 18)
        const gapTimes = ['0 10 * * *', '0 12 * * *', '0 14 * * *', '0 16 * * *', '0 18 * * *'];
        gapTimes.forEach(time => {
            cron.schedule(time, async () => {
                console.log(`Running Gap Check Job at ${time}`);
                const users = await prisma.user.findMany({ where: { telegramChatId: { not: null } } });
                for (const user of users) {
                    if (!user.telegramChatId) continue;
                    const gaps = await TaskService.getWorkGaps(user.id, new Date());
                    const currentHour = new Date().getHours();
                    // Filter gaps that are in the future of today
                    const futureGaps = gaps.filter(g => g.start.getHours() >= currentHour);

                    if (futureGaps.length > 0) {
                        // Check if we haven't sent a gap reminder recently? 
                        // Requirement: "Faqat bo‘sh slot topilsa yubor"
                        // Let's just send the first significant gap
                        const firstGap = futureGaps[0];
                        const start = format(firstGap.start, 'HH:mm');
                        const end = format(firstGap.end, 'HH:mm');
                        const msg = `🔔 Eslatma: Bugun ${start}–${end} oralig‘ida bo‘sh vaqt bor. Biror nima rejalashtiring yoki dam oling!`;
                        await bot.telegram.sendMessage(user.telegramChatId, msg);
                    }
                }
            });
        });

        // 3. Late Tasks at 20:00
        cron.schedule('0 20 * * *', async () => {
            const users = await prisma.user.findMany({ where: { telegramChatId: { not: null } } });
            for (const user of users) {
                if (!user.telegramChatId) continue;
                const overdueTasks = await prisma.task.findMany({
                    where: {
                        userId: user.id,
                        status: { not: TaskStatus.DONE },
                        dueAt: { lt: new Date() } // Strictly overdue by dueAt, or by endAt? "duesDate o'tib ketgan". Using dueAt.
                    }
                });

                if (overdueTasks.length > 0) {
                    let msg = `⚠️ Kechikkan tasklar:\n`;
                    overdueTasks.forEach(t => msg += `- ${t.title}\n`);
                    await bot.telegram.sendMessage(user.telegramChatId, msg);
                }
            }
        });

        // 4. Weekly Report Sunday 19:00
        cron.schedule('0 19 * * 0', async () => {
            const users = await prisma.user.findMany({ where: { telegramChatId: { not: null } } });
            for (const user of users) {
                if (!user.telegramChatId) continue;
                await bot.telegram.sendMessage(user.telegramChatId, "📊 Haftalik hisobot tayyorlanmoqda...");

                try {
                    const stats = await StatsService.getWeeklyTaskStats(user.id);
                    const labels = stats.dailyCounts.map(d => d.date);
                    const data = stats.dailyCounts.map(d => d.count);

                    if (stats.totalDone === 0) {
                        await bot.telegram.sendMessage(user.telegramChatId, "Bu hafta hech qanday task bajarilmadi. Keyingi hafta omad!");
                    } else {
                        const buffer = await ChartService.generateLineChart('Weekly Tasks', labels, data);
                        await bot.telegram.sendPhoto(user.telegramChatId, { source: buffer }, { caption: `Haftalik natija: ${stats.totalDone} ta task bajarildi.` });
                    }
                } catch (error) {
                    console.error('Weekly report error:', error);
                    await bot.telegram.sendMessage(user.telegramChatId, "Hisobotni shakllantirishda xatolik yuz berdi.");
                }
            }
        });
        // 2. Task Reminder (30 mins before)
        cron.schedule('* * * * *', async () => {
            console.log('Running Task Reminder Job');
            const now = new Date();
            const targetTimeStart = new Date(now.getTime() + 30 * 60000); // Now + 30 mins
            const targetTimeEnd = new Date(targetTimeStart.getTime() + 60000); // 1 minute window

            // Find tasks starting in the next 30-31 minutes
            const tasks = await prisma.task.findMany({
                where: {
                    planned: true,
                    status: { not: TaskStatus.DONE },
                    startAt: {
                        gte: targetTimeStart,
                        lt: targetTimeEnd
                    },
                    user: { telegramChatId: { not: null } }
                },
                include: { user: true }
            });

            for (const task of tasks) {
                if (!task.user.telegramChatId) continue;

                const timeStr = task.startAt ? format(task.startAt, 'HH:mm') : '??:??';
                const message = `⚠️ **Eslatma**: "${task.title}" vazifasi boshlanishiga 30 daqiqa qoldi!\n🕒 Boshlanish vaqti: ${timeStr}`;

                try {
                    await bot.telegram.sendMessage(task.user.telegramChatId, message, { parse_mode: 'Markdown' });
                    console.log(`Reminder sent to ${task.userId} for task ${task.id}`);
                } catch (error) {
                    console.error(`Failed to send reminder for task ${task.id}:`, error);
                }
            }
        });
    }
}
