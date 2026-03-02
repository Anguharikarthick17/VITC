import cron from 'node-cron';
import { PrismaClient, Status } from '@prisma/client';

const prisma = new PrismaClient();

export const escalateOverdueComplaints = async (): Promise<void> => {
    try {
        const fortyEightHoursAgo = new Date();
        fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

        const overdue = await prisma.complaint.findMany({
            where: {
                status: { in: [Status.PENDING, Status.IN_PROGRESS] },
                createdAt: { lte: fortyEightHoursAgo },
            },
        });

        for (const complaint of overdue) {
            await prisma.complaint.update({
                where: { id: complaint.id },
                data: { status: Status.ESCALATED },
            });

            await prisma.complaintLog.create({
                data: {
                    complaintId: complaint.id,
                    action: 'Auto-escalated: unresolved for 48+ hours',
                    performedById: null,
                },
            });
        }

        if (overdue.length > 0) {
            console.log(`⚠️  Auto-escalated ${overdue.length} overdue complaints`);
        }
    } catch (error) {
        console.error('Escalation error:', error);
    }
};

export const startEscalationCron = (): void => {
    // Run every hour
    cron.schedule('0 * * * *', () => {
        console.log('⏰ Running escalation check...');
        escalateOverdueComplaints();
    });
};
