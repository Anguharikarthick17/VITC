import app from './app';
import { PrismaClient } from '@prisma/client';
import { startEscalationCron } from './services/escalationService';
import { startSimulatorCron } from './services/simulatorService';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

async function main() {
    try {
        await prisma.$connect();
        console.log('✅ Database connected');

        // Start auto-escalation cron job
        startEscalationCron();
        console.log('⏰ Escalation cron job started');

        // Start automated complaint simulation
        startSimulatorCron();
        console.log('🤖 Simulator service started');

        app.listen(PORT, () => {
            console.log(`🚨 FixNow Portal server running on port ${PORT}`);
            console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

main();

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
