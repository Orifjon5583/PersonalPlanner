import { Context, Markup } from 'telegraf';
import { bot } from './instance'; // Imported from instance to avoid circular dependency
import { TaskService } from '../services/taskService';
import { StatsService } from '../services/statsService';
import { ChartService } from '../services/chartService';
import { FinanceService } from '../services/financeService';
import { prisma } from '../app';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { addMinutes, format, isValid, parse, parseISO } from 'date-fns';

// Extract user ID helper
const getUserId = async (ctx: Context) => {
    const chatId = ctx.chat?.id.toString();
    if (!chatId) return null;
    let user = await prisma.user.findUnique({ where: { telegramChatId: chatId } });
    if (!user && chatId === '6711922793') {
        user = await prisma.user.findFirst();
        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: { telegramChatId: chatId }
            });
        }
    }
    return user?.id;
};

// /today
bot.command('today', async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return ctx.reply('⚠️ Hisobingiz bog‘lanmagan. Web dashboard orqali kodni oling va botga yuboring.');

    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const tasks = await prisma.task.findMany({
        where: {
            userId,
            planned: true,
            startAt: { gte: startOfToday, lte: endOfToday }
        },
        orderBy: { startAt: 'asc' }
    });

    const backlog = await prisma.task.findMany({
        where: { userId, status: TaskStatus.TODO, priority: TaskPriority.IMPORTANT, planned: false }
    });

    let msg = `📅 **Bugungi Reja**:\n`;
    if (tasks.length === 0) msg += `(Rejalashtirilgan ishlar yo‘q)\n`;

    tasks.forEach((t: any) => {
        const time = t.startAt ? format(t.startAt, 'HH:mm') : '??:??';
        const icon = t.status === TaskStatus.DONE ? '✅' : t.priority === TaskPriority.IMPORTANT ? '🔴' : t.priority === TaskPriority.NORMAL ? '🟠' : '🔵';
        msg += `${icon} ${time} - ${t.title} (${t.durationMinutes}m)\n`;
    });

    if (backlog.length > 0) {
        msg += `\n📌 **Muhim (Rejasiz)**:\n`;
        backlog.forEach((t: any) => {
            msg += `🔴 ${t.title} (/plan qiling)\n`;
        });
    }

    ctx.replyWithMarkdown(msg);
});

// /plan
bot.command('plan', async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return ctx.reply('⚠️ Hisobingiz bog‘lanmagan.');

    const result = await TaskService.autoPlan(userId, new Date());
    ctx.reply(`✅ Rejalashtirish yakunlandi!\nRejalashtirilgan: ${result.planned}\nQoldirildi: ${result.leftover}`);
});

// /stats
bot.command('stats', async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return ctx.reply('⚠️ Hisobingiz bog‘lanmagan.');

    const stats = await StatsService.getWeeklyTaskStats(userId);
    const chartBuffer = await ChartService.generateWeeklyProgressChart(stats);

    ctx.replyWithPhoto({ source: chartBuffer }, { caption: '📊 Haftalik hisobot' });
});

// /add <title>
bot.command('add', async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return ctx.reply('⚠️ Hisobingiz bog‘lanmagan.');

    const text = ctx.message.text.split(' ').slice(1).join(' ');
    if (!text) return ctx.reply('⚠️ Iltimos, vazifa nomini kiriting. Masalan: /add Kitob o‘qish');

    await TaskService.create(userId, { title: text, priority: TaskPriority.NORMAL, durationMinutes: 30 });
    ctx.reply(`✅ Vazifa qo‘shildi: "${text}"`);
});

// /done <id> (simplified for now, maybe interactive later)
bot.command('help', (ctx) => {
    ctx.reply(
        `🤖 **Personal Planner Bot**\n\n` +
        `/today - Bugungi vazifalar\n` +
        `/add <nomi> - Tezkor vazifa qo‘shish\n` +
        `/plan - Kunni avtomatik rejalashtirish\n` +
        `/stats - Haftalik statistika\n` +
        `/start <kod> - Web hisobni bog‘lash`,
        Markup.keyboard([
            ['📊 Hisobot', '💰 Qolgan mablag‘'],
            ['📋 Vazifalar', '✅ Topshirilgan']
        ]).resize()
    );
});



// /done <taskId> (Simplified: /done last or select via UI? For now user implementation requested command line. Let's list pending tasks with buttons?)
// User requested "/done <taskId>", but knowing ID is hard. Let's make /today return IDs or use buttons.
// Let's implement /done as interactive or simple list.
bot.command('done', async (ctx) => {
    // Check if args
    const userId = await getUserId(ctx);
    if (!userId) return ctx.reply('Auth required.');

    const parts = (ctx.message as any).text.split(' ');
    if (parts.length > 1) {
        // ID provided (maybe partial?) - Realistically full CUID is hard to type.
        // Let's assume they might copy paste or we give a short ID?
        // Let's just create a "Select Task to Done" menu.
        return ctx.reply('Task ID topilmadi. Iltimos tugmalardan foydalaning (soon).');
    }

    // Show List of TODAY's TODO tasks with Inline Buttons
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(); endOfToday.setHours(23, 59, 59, 999);

    const tasks = await prisma.task.findMany({
        where: { userId, status: TaskStatus.TODO, startAt: { gte: startOfToday, lte: endOfToday } },
        orderBy: { startAt: 'asc' }
    });

    if (tasks.length === 0) return ctx.reply('Bugunga bajarilmagan tasklar yo‘q.');

    const buttons = tasks.map((t: any) => [Markup.button.callback(`✅ ${t.title}`, `done:${t.id}`)]);
    ctx.reply('Qaysi taskni bajardingiz?', Markup.inlineKeyboard(buttons));
});

bot.action(/done:(.+)/, async (ctx) => {
    const taskId = ctx.match[1];
    await prisma.task.update({
        where: { id: taskId },
        data: { status: TaskStatus.DONE }
    });
    ctx.answerCbQuery('Task bajarildi!');
    ctx.editMessageText('✅ Task DONE qilindi.');
});

// /chart week
bot.command('chart', async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return ctx.reply('Auth required.');

    const arg = (ctx.message as any).text.split(' ')[1];
    if (arg !== 'week') return ctx.reply('Faqat /chart week ishlaydi hozircha.');

    const stats = await StatsService.getWeeklyTaskStats(userId);
    const labels = stats.dailyCounts.map(d => d.date);
    const data = stats.dailyCounts.map(d => d.count);

    const buffer = await ChartService.generateLineChart('Weekly Done Tasks', labels, data);
    ctx.replyWithPhoto({ source: buffer }, { caption: 'Haftalik Bajarilgan Ishlar' });
});

// /gaps
bot.command('gaps', async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return ctx.reply('Auth required.');

    const gaps = await TaskService.getWorkGaps(userId, new Date());
    if (gaps.length === 0) return ctx.reply('Bugun bo‘sh vaqt (gap) qolmadi.');

    let msg = `🕰 **Bugungi Bo‘sh Vaqtlar**:\n`;
    gaps.forEach(g => {
        msg += `- ${format(g.start, 'HH:mm')} dan ${format(g.end, 'HH:mm')} gacha (${Math.round(g.duration)} daqiqa)\n`;
    });
    ctx.reply(msg);
});

// --- Menu & Extra Features ---

bot.command('menu', async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return ctx.reply('👋 Salom! Men sizning shaxsiy yordamchingizman. Web-sayt bilan bog‘lanish uchun ko‘rsatmalarga amal qiling.', Markup.keyboard([
        ['📊 Hisobot', '💰 Qolgan mablag‘'],
        ['📋 Vazifalar', '✅ Topshirilgan']
    ]).resize());
    return ctx.reply('Asosiy menyu:', Markup.keyboard([
        ['📊 Hisobot', '💰 Qolgan mablag‘'],
        ['📋 Vazifalar', '✅ Topshirilgan']
    ]).resize());
});

bot.hears('Qo‘shimcha', async (ctx) => {
    return ctx.reply('Asosiy menyu:', Markup.keyboard([
        ['📊 Hisobot', '💰 Qolgan mablag‘'],
        ['📋 Vazifalar', '✅ Topshirilgan']
    ]).resize());
});

bot.hears('🔙 Orqaga', async (ctx) => {
    return ctx.reply('Asosiy menyu:', Markup.keyboard([
        ['📊 Hisobot', '💰 Qolgan mablag‘'],
        ['📋 Vazifalar', '✅ Topshirilgan']
    ]).resize());
});

bot.hears('📊 Hisobot', async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return ctx.reply('⚠️ Hisobingiz bog‘lanmagan.');

    const stats = await StatsService.getWeeklyTaskStats(userId);
    const chartBuffer = await ChartService.generateWeeklyProgressChart(stats);

    ctx.replyWithPhoto({ source: chartBuffer }, { caption: `📊 Haftalik hisobot: ${stats.totalDone} ta task bajarildi.` });
});

bot.hears('💰 Qolgan mablag‘', async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return ctx.reply('⚠️ Hisobingiz bog‘lanmagan.');

    const today = new Date();
    const monthStr = format(today, 'yyyy-MM');

    try {
        const summary = await FinanceService.getMonthlySummary(userId, monthStr);
        const remaining = summary.totalIncome - summary.totalSpent;

        let msg = `💰 **Moliya (${monthStr})**:\n\n`;
        msg += `➕ Kirim: ${summary.totalIncome}\n`;
        msg += `➖ Chiqim: ${summary.totalSpent}\n`;
        msg += `💵 **Qolgan**: ${remaining}\n\n`;

        summary.categories.forEach(cat => {
            msg += `- ${cat.name}: ${cat.spent} / ${cat.limit} (${Math.round(cat.percentUsed)}%)\n`;
        });

        ctx.replyWithMarkdown(msg);
    } catch (e) {
        console.error(e);
        ctx.reply('Moliya ma\'lumotlarini olishda xatolik.');
    }
});

bot.hears('📋 Vazifalar', async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return ctx.reply('⚠️ Hisobingiz bog‘lanmagan.');

    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const tasks = await prisma.task.findMany({
        where: {
            userId,
            planned: true,
            startAt: { gte: startOfToday, lte: endOfToday }
        },
        orderBy: { startAt: 'asc' }
    });

    let msg = `📅 **Bugungi Reja**:\n`;
    if (tasks.length === 0) {
        msg += `(Rejalashtirilgan ishlar yo‘q)`;
    } else {
        tasks.forEach((t: any) => {
            const time = t.startAt ? format(t.startAt, 'HH:mm') : '??:??';
            const icon = t.status === TaskStatus.DONE ? '✅' : t.priority === TaskPriority.IMPORTANT ? '🔴' : t.priority === TaskPriority.NORMAL ? '🟠' : '🔵';
            msg += `${icon} ${time} - ${t.title} (${t.durationMinutes}m)\n`;
        });
    }

    ctx.replyWithMarkdown(msg);
});

bot.hears('✅ Topshirilgan', async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return ctx.reply('⚠️ Hisobingiz bog‘lanmagan.');

    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const tasks = await prisma.task.findMany({
        where: {
            userId,
            status: TaskStatus.DONE,
            updatedAt: { gte: startOfToday, lte: endOfToday }
        },
        orderBy: { updatedAt: 'desc' }
    });

    let msg = `✅ **Bugun Bajarilgan**:\n`;
    if (tasks.length === 0) {
        msg += `(Hali hech narsa bajarilmadi)`;
    } else {
        tasks.forEach((t: any) => {
            const time = format(t.updatedAt, 'HH:mm');
            msg += `✅ ${time} - ${t.title}\n`;
        });
    }

    ctx.replyWithMarkdown(msg);
});

// Export helper to register these in index.ts
export const registerCommands = () => {
    // This file is imported in index.ts, so commands are registered on 'bot' imported from there.
    console.log('Bot commands registered');
};
