import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    await prisma.user.update({
        where: { email: 'officer@codered.com' },
        data: { name: 'Officer Two' }
    });
    
    await prisma.user.update({
        where: { email: 'stateadmin@codered.com' },
        data: { name: 'State Admin Two' }
    });
    
    console.log("Renamed duplicate users to Officer Two and State Admin Two");
}

main().catch(console.error).finally(() => prisma.$disconnect());
