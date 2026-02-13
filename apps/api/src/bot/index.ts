import { Telegraf, Context } from 'telegraf';
import { prisma } from '../app';
import { StatsService } from '../services/statsService';

import { bot } from './instance';
export { bot };

// Bot initialized in instance.ts


bot.start(async (ctx) => {
    const chatId = ctx.chat.id.toString();
    await ctx.reply(`Welcome! Your Chat ID is: ${chatId}. Use this to link your account.`);

    // Logic to handle deep linking if start payload exists
    const payload = (ctx as any).startPayload;
    if (payload) {
        const user = await prisma.user.findUnique({ where: { telegramLinkCode: payload } });
        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: { telegramChatId: chatId, telegramLinkCode: null }
            });
            await ctx.reply(`Successfully linked to user ${user.name}!`);
        } else {
            await ctx.reply('Invalid link code.');
        }
    }
});

bot.command('stats', async (ctx) => {
    // Basic stats implementation
    const chatId = ctx.chat.id.toString();
    const user = await prisma.user.findUnique({ where: { telegramChatId: chatId } });
    if (!user) return ctx.reply('Auth required.');

    const stats = await StatsService.getWeeklyTaskStats(user.id);
    ctx.reply(`📊 **Haftalik Statistika**:\n\nJami bajarilgan: ${stats.totalDone}\n\nTo‘liq grafik uchun /chart week ni bosing.`);
});

import './commands'; // Import commands to register them

// Launch bot needs to be separate or integrated into app startup
export const launchBot = () => {
    bot.launch().then(() => console.log('Bot started')).catch(err => console.error('Bot launch error:', err));
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
};
