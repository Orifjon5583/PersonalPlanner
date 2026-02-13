import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

// Hardcoded for now as env is missing
const botToken = process.env.TELEGRAM_BOT_TOKEN || '7699116128:AAEMdSkg-ix2iNBkE7KbaDIlkA2PZXFTkpg';
if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is missing');

export const bot = new Telegraf(botToken);
