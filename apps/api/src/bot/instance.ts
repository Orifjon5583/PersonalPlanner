import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

// Hardcoded for now as env is missing
const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is missing');

import { HttpsProxyAgent } from 'https-proxy-agent';

const proxyUrl = process.env.PROXY_URL;
const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

export const bot = new Telegraf(botToken, {
    telegram: {
        agent: agent as any
    }
});
