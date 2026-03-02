import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Deleting all existing complaints and logs...');
    // Delete logs first due to foreign key constraints
    await prisma.complaintLog.deleteMany();
    await prisma.complaint.deleteMany();

    console.log('Seeding initial users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Seed Super Admin
    await prisma.user.upsert({
        where: { email: 'admin@gmail.com' },
        update: { password: hashedPassword, role: 'SUPER_ADMIN' },
        create: {
            name: 'Master Admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
        }
    });

    // Seed Officer
    const officer = await prisma.user.upsert({
        where: { email: 'officer@gmail.com' },
        update: { password: hashedPassword, role: 'OFFICER' },
        create: {
            name: 'State Officer',
            email: 'officer@gmail.com',
            password: hashedPassword,
            role: 'OFFICER',
            state: 'Maharashtra'
        }
    });

    const categories = [
        'ROAD_DAMAGE', 'WATER_SUPPLY', 'ELECTRICITY', 'SANITATION',
        'PUBLIC_SAFETY', 'NOISE_POLLUTION', 'ILLEGAL_CONSTRUCTION',
        'GARBAGE', 'TRAFFIC', 'STREET_LIGHTING', 'PARK_MAINTENANCE',
        'DRAINAGE_FLOODING', 'AIR_POLLUTION', 'ANIMAL_CONTROL',
        'PUBLIC_TRANSPORT', 'BUILDING_SAFETY', 'FIRE_HAZARD', 'OTHER'
    ];
    const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    const locations = [
        { state: 'Maharashtra', city: 'Mumbai', address: 'Mumbai City' },
        { state: 'Maharashtra', city: 'Pune', address: 'Pune' },
        { state: 'Maharashtra', city: 'Nagpur', address: 'Nagpur' },
        { state: 'Karnataka', city: 'Bengaluru', address: 'Bengaluru Urban' },
        { state: 'Karnataka', city: 'Mysuru', address: 'Mysuru' },
        { state: 'Delhi', city: 'New Delhi', address: 'New Delhi' },
        { state: 'Tamil Nadu', city: 'Chennai', address: 'Chennai' },
        { state: 'Gujarat', city: 'Ahmedabad', address: 'Ahmedabad' },
    ];

    console.log('Seeding 20 RESOLVED complaints...');
    const now = new Date();
    let resolvedCount = 0;

    // 20 resolved issues total
    for (let batch = 0; batch < 4; batch++) {
        const hoursAgoResolved = batch * 12;

        for (let i = 0; i < 5; i++) {
            const resolvedAt = new Date(now.getTime() - (hoursAgoResolved * 60 * 60 * 1000));
            // Small random variation in minutes to look organic (0-59 mins earlier)
            resolvedAt.setMinutes(resolvedAt.getMinutes() - Math.floor(Math.random() * 60));

            // "Case will take to complete 1 day" -> created 24 hours before resolved
            const createdAt = new Date(resolvedAt.getTime() - (24 * 60 * 60 * 1000));

            const loc = locations[Math.floor(Math.random() * locations.length)];
            const category = categories[Math.floor(Math.random() * categories.length)];
            const severity = severities[Math.floor(Math.random() * severities.length)];

            await prisma.complaint.create({
                data: {
                    title: `Issue regarding ${category.replace(/_/g, ' ').toLowerCase()} in ${loc.city}`,
                    description: `This is a resolved real-time demo issue for ${category.replace(/_/g, ' ').toLowerCase()} in ${loc.address}. Handled exactly 1 day after reporting.`,
                    category: category as any,
                    severity: severity as any,
                    status: 'RESOLVED',
                    state: loc.state,
                    city: loc.city,
                    address: loc.address,
                    contact: '9876543210',
                    email: 'citizen@example.com',
                    assignedToId: officer.id,
                    createdAt: createdAt,
                    updatedAt: resolvedAt,
                }
            });
            resolvedCount++;
        }
    }

    console.log('Seeding 20 IN_PROGRESS complaints...');
    let inProgressCount = 0;

    // In progress issues: created between 1 and 24 hours ago
    for (let i = 0; i < 20; i++) {
        const hoursAgo = Math.floor(Math.random() * 23) + 1; // 1 to 24 hours ago
        const createdAt = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
        const updatedAt = new Date(createdAt.getTime() + (1000 * 60 * 30)); // updated 30 mins after creation

        const loc = locations[Math.floor(Math.random() * locations.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];

        await prisma.complaint.create({
            data: {
                title: `Ongoing issue with ${category.replace(/_/g, ' ').toLowerCase()}`,
                description: `Emergency teams are currently dispatched and addressing the ${category.replace(/_/g, ' ').toLowerCase()} problem.`,
                category: category as any,
                severity: severity as any,
                status: 'IN_PROGRESS',
                state: loc.state,
                city: loc.city,
                address: loc.address,
                contact: '9876543210',
                email: 'citizen@example.com',
                assignedToId: officer.id,
                createdAt: createdAt,
                updatedAt: updatedAt,
            }
        });
        inProgressCount++;
    }

    console.log('Seeding 20 PENDING complaints...');
    let pendingCount = 0;

    // Pending issues: created between 0 and 12 hours ago
    for (let i = 0; i < 20; i++) {
        const hoursAgo = Math.floor(Math.random() * 12);
        const createdAt = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));

        // Pending aren't assigned yet

        const loc = locations[Math.floor(Math.random() * locations.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];

        await prisma.complaint.create({
            data: {
                title: `New reported ${category.replace(/_/g, ' ').toLowerCase()}`,
                description: `A new public complaint regarding ${category.replace(/_/g, ' ').toLowerCase()} has been logged and is awaiting officer assignment.`,
                category: category as any,
                severity: severity as any,
                status: 'PENDING',
                state: loc.state,
                city: loc.city,
                address: loc.address,
                contact: '9876543210',
                email: 'citizen@example.com',
                assignedToId: null,
                createdAt: createdAt,
                updatedAt: createdAt,
            }
        });
        pendingCount++;
    }

    console.log(`Successfully seeded ${resolvedCount} RESOLVED, ${inProgressCount} IN_PROGRESS, and ${pendingCount} PENDING complaints.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
