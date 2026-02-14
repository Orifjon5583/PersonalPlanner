import { PrismaClient, TaskPriority, TaskStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create demo user
    const passwordHash = await bcrypt.hash('demo123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'demo@planner.uz' },
        update: {},
        create: {
            name: 'Orifjon Kenjaboyev',
            email: 'demo@planner.uz',
            passwordHash,
            timezone: 'Asia/Tashkent',
        },
    });
    console.log(`✅ User created: ${user.email}`);

    // Delete existing data for clean seed
    await prisma.notificationLog.deleteMany({ where: { userId: user.id } });
    await prisma.expense.deleteMany({ where: { userId: user.id } });
    await prisma.budgetCategory.deleteMany({ where: { userId: user.id } });
    await prisma.income.deleteMany({ where: { userId: user.id } });
    await prisma.task.deleteMany({ where: { userId: user.id } });

    // Create tasks across last 30 days
    const now = new Date();
    const taskTitles = [
        'Loyiha taklifini tayyorlash',
        'Jamoa yig\'ilishi',
        'Kodlarni tekshirish',
        'Dizayn mockup yaratish',
        'API dokumentatsiyasi yozish',
        'Bug fix: login sahifasi',
        'Database migratsiya',
        'Unit testlar yozish',
        'Deploy qilish',
        'Mijoz bilan uchrashish',
        'Sprint planning',
        'Haftalik hisobot',
        'Kod refaktoring',
        'Performance optimizatsiya',
        'Xavfsizlik audit',
        'Yangi feature: dashboard',
        'CI/CD pipeline sozlash',
        'Dokumentatsiyani yangilash',
        'Monitoring sozlash',
        'Backup tizimini tekshirish',
        'Foydalanuvchi testlari',
        'API integratsiya',
        'Mobile responsivlik',
        'SEO optimizatsiya',
        'Xatoliklar ro\'yxati',
    ];

    const tasks = [];
    for (let i = 0; i < 25; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        date.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));

        const isDone = Math.random() > 0.3; // 70% chance of DONE
        const status = isDone ? TaskStatus.DONE : (Math.random() > 0.5 ? TaskStatus.IN_PROGRESS : TaskStatus.TODO);
        const priority = [TaskPriority.IMPORTANT, TaskPriority.NORMAL, TaskPriority.FUTURE][Math.floor(Math.random() * 3)];

        tasks.push({
            userId: user.id,
            title: taskTitles[i],
            description: `${taskTitles[i]} uchun batafsil tavsif`,
            priority,
            status,
            durationMinutes: [30, 60, 90, 120][Math.floor(Math.random() * 4)],
            startAt: date,
            createdAt: date,
            updatedAt: isDone ? new Date(date.getTime() + Math.random() * 3600000) : date,
        });
    }

    await prisma.task.createMany({ data: tasks });
    console.log(`✅ Created ${tasks.length} tasks`);

    // Create income records
    const months = ['2025-12', '2026-01', '2026-02'];
    for (const month of months) {
        await prisma.income.create({
            data: {
                userId: user.id,
                month,
                amount: 3000000 + Math.floor(Math.random() * 2000000),
            },
        });
    }
    console.log('✅ Created income records');

    // Create budget categories & expenses
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const categories = [
        { name: 'Oziq-ovqat', type: 'NECESSARY' as const, percent: 30, limitAmount: 1500000 },
        { name: 'Transport', type: 'NECESSARY' as const, percent: 15, limitAmount: 750000 },
        { name: 'Ko\'ngilochar', type: 'COMFORT' as const, percent: 20, limitAmount: 1000000 },
        { name: 'Jamg\'arma', type: 'SAVINGS' as const, percent: 20, limitAmount: 1000000 },
        { name: 'Kommunal', type: 'NECESSARY' as const, percent: 15, limitAmount: 750000 },
    ];

    for (const cat of categories) {
        const category = await prisma.budgetCategory.create({
            data: {
                userId: user.id,
                month: currentMonth,
                type: cat.type,
                name: cat.name,
                percent: cat.percent,
                limitAmount: cat.limitAmount,
            },
        });

        // Add 2-4 expenses per category
        const numExpenses = 2 + Math.floor(Math.random() * 3);
        for (let j = 0; j < numExpenses; j++) {
            const daysAgo = Math.floor(Math.random() * 28);
            const expDate = new Date(now);
            expDate.setDate(expDate.getDate() - daysAgo);

            await prisma.expense.create({
                data: {
                    userId: user.id,
                    categoryId: category.id,
                    amount: Math.floor(Math.random() * (cat.limitAmount / 3)),
                    spentAt: expDate,
                    note: `${cat.name} xarajati #${j + 1}`,
                },
            });
        }
    }
    console.log('✅ Created budget categories and expenses');

    console.log('\n🎉 Seed completed!');
    console.log('📧 Login: demo@planner.uz');
    console.log('🔑 Password: demo123');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
