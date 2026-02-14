
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Updating user name...');
    try {
        const user = await prisma.user.update({
            where: { email: 'demo@planner.uz' },
            data: { name: 'Orifjon Kenjaboyev' },
        });
        console.log(`✅ User updated: ${user.name}`);
    } catch (e) {
        console.error('❌ Error updating user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
