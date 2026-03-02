import { PrismaClient, Status, Category, Severity } from '@prisma/client';

const prisma = new PrismaClient();

const STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar', 'Chandigarh', 'Dadra and Nagar Haveli', 'Lakshadweep',
    'Delhi', 'Puducherry'
];

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal'];

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

const CATEGORIES = Object.values(Category);
const SEVERITIES = Object.values(Severity);

export const startSimulatorCron = () => {
    console.log('🤖 Realistic Simulator Pipeline Started...');

    // 1. CREATION LOOP: Creates 1 new PENDING complaint every 45 seconds
    setInterval(async () => {
        try {
            const state = getRandomItem(STATES);
            const city = getRandomItem(CITIES);
            const category = getRandomItem(CATEGORIES);
            const severity = getRandomItem(SEVERITIES);

            const complaint = await prisma.complaint.create({
                data: {
                    title: `Simulated Issue: ${category.replace(/_/g, ' ')}`,
                    description: `This is an automatically generated issue complaining about ${category} in ${city}, ${state}. It requires immediate attention from civic authorities.`,
                    category,
                    severity,
                    state,
                    city,
                    address: `${city} Central`,
                    contact: '9999999999',
                    email: 'auto.reporter@fixnow.local',
                    status: Status.PENDING,
                },
            });

            console.log(`[SIMULATOR] Created new PENDING complaint: ${complaint.id.split('-')[0]}`);
        } catch (error) {
            console.error('[SIMULATOR] Creation failed:', error);
        }
    }, 45 * 1000);

    // 2. ASSIGNMENT LOOP: Smoothly moves a few PENDING -> IN_PROGRESS every 30 seconds
    setInterval(async () => {
        try {
            // Find up to 3 old pending complaints
            const pending = await prisma.complaint.findMany({
                where: { status: Status.PENDING },
                orderBy: { createdAt: 'asc' },
                take: 3
            });

            if (!pending.length) return;

            const ids = pending.map(p => p.id);
            await prisma.complaint.updateMany({
                where: { id: { in: ids } },
                data: { status: Status.IN_PROGRESS, notes: 'System assigned for action.' }
            });

            await prisma.complaintLog.createMany({
                data: ids.map(id => ({
                    complaintId: id,
                    action: 'Status updated to IN_PROGRESS [Simulator Auto-Assign]',
                    timestamp: new Date()
                }))
            });

            console.log(`[SIMULATOR] Moved ${ids.length} complaints to IN_PROGRESS`);
        } catch (error) {
            console.error('[SIMULATOR] Assignment loop failed:', error);
        }
    }, 30 * 1000);

    // 3. RESOLUTION LOOP: Smoothly moves a few IN_PROGRESS -> RESOLVED every 40 seconds
    setInterval(async () => {
        try {
            // Find up to 2 old in-progress complaints
            const inProgress = await prisma.complaint.findMany({
                where: { status: Status.IN_PROGRESS },
                orderBy: { updatedAt: 'asc' },
                take: 2
            });

            if (!inProgress.length) return;

            const ids = inProgress.map(p => p.id);
            await prisma.complaint.updateMany({
                where: { id: { in: ids } },
                data: { status: Status.RESOLVED, notes: 'Issue resolved by field team.' }
            });

            await prisma.complaintLog.createMany({
                data: ids.map(id => ({
                    complaintId: id,
                    action: 'Status updated to RESOLVED [Simulator Auto-Resolve]',
                    timestamp: new Date()
                }))
            });

            console.log(`[SIMULATOR] Resolved ${ids.length} complaints`);
        } catch (error) {
            console.error('[SIMULATOR] Resolution loop failed:', error);
        }
    }, 40 * 1000);
};
