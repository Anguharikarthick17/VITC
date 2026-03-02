import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STATES_DATA = [
    { state: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool'] },
    { state: 'Arunachal Pradesh', cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tezpur'] },
    { state: 'Assam', cities: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Nagaon'] },
    { state: 'Bihar', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga'] },
    { state: 'Chhattisgarh', cities: ['Raipur', 'Bilaspur', 'Durg', 'Korba', 'Rajnandgaon'] },
    { state: 'Goa', cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'] },
    { state: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'] },
    { state: 'Haryana', cities: ['Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Rohtak'] },
    { state: 'Himachal Pradesh', cities: ['Shimla', 'Dharamsala', 'Solan', 'Mandi', 'Baddi'] },
    { state: 'Jharkhand', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar'] },
    { state: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belagavi'] },
    { state: 'Kerala', cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur'] },
    { state: 'Madhya Pradesh', cities: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'] },
    { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'] },
    { state: 'Manipur', cities: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur'] },
    { state: 'Meghalaya', cities: ['Shillong', 'Tura', 'Jowai', 'Nongpoh'] },
    { state: 'Mizoram', cities: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'] },
    { state: 'Nagaland', cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha'] },
    { state: 'Odisha', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Sambalpur'] },
    { state: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'] },
    { state: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner'] },
    { state: 'Sikkim', cities: ['Gangtok', 'Namchi', 'Mangan', 'Gyalshing'] },
    { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'] },
    { state: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'] },
    { state: 'Tripura', cities: ['Agartala', 'Dharmanagar', 'Udaipur', 'Kailasahar'] },
    { state: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Allahabad'] },
    { state: 'Uttarakhand', cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh'] },
    { state: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'] },
    { state: 'Delhi', cities: ['New Delhi', 'Dwarka', 'Rohini', 'Shahdara', 'Saket'] },
    { state: 'Chandigarh', cities: ['Chandigarh', 'Mohali', 'Panchkula'] },
];

const CATEGORIES = [
    'ROAD_DAMAGE', 'WATER_SUPPLY', 'ELECTRICITY', 'SANITATION', 'PUBLIC_SAFETY',
    'NOISE_POLLUTION', 'ILLEGAL_CONSTRUCTION', 'GARBAGE', 'TRAFFIC', 'STREET_LIGHTING',
    'PARK_MAINTENANCE', 'DRAINAGE_FLOODING', 'AIR_POLLUTION', 'ANIMAL_CONTROL',
    'PUBLIC_TRANSPORT', 'BUILDING_SAFETY', 'FIRE_HAZARD', 'OTHER',
];

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'];

const TITLES: Record<string, string[]> = {
    ROAD_DAMAGE: ['Pothole on main road', 'Broken road surface near junction', 'Road collapses after rain', 'Damaged speed breaker causing accidents'],
    WATER_SUPPLY: ['No water supply for 3 days', 'Contaminated water from tap', 'Pipeline leakage on street', 'Low water pressure in area'],
    ELECTRICITY: ['Power outage for 12 hours', 'Dangling live wire near school', 'Transformer failure in colony', 'Street light not working for weeks'],
    SANITATION: ['Open defecation near market', 'Broken public toilet facility', 'No sanitation workers visiting', 'Sewage overflowing on road'],
    PUBLIC_SAFETY: ['Broken footpath causing injury', 'Unsafe bridge railing', 'Dark lane causing fear', 'Encroachment blocking emergency access'],
    GARBAGE: ['Garbage not collected for a week', 'Illegal dumping near school', 'Overflowing bin at bus stop', 'Dead animals on road not removed'],
    TRAFFIC: ['Traffic signal not working at junction', 'No road markings at crossing', 'Encroachment reducing road width', 'Vehicles parked illegally on road'],
    DRAINAGE_FLOODING: ['Street flooding every rain', 'Blocked drain near market', 'No drainage in new colony', 'Manhole cover missing on street'],
    AIR_POLLUTION: ['Factory smoke affecting residents', 'Vehicles emitting black smoke', 'Burning garbage in open', 'Dust from construction causing issues'],
    NOISE_POLLUTION: ['Loudspeaker at night near hospital', 'Construction noise during restricted hours', 'Bar playing loud music', 'Factory noise disturbing sleep'],
    STREET_LIGHTING: ['No street lights in entire colony', 'Lights broken for 2 months', 'Wires exposed near lights', 'Solar light not working after dark'],
    ILLEGAL_CONSTRUCTION: ['Building without permission', 'Encroachment on footpath', 'Unauthorized shop on government land', 'Illegal additions to building'],
    PARK_MAINTENANCE: ['Park benches broken', 'No lights in public park', 'Garbage in park', 'Stray dogs attacking in park'],
    ANIMAL_CONTROL: ['Stray dogs attacking children', 'Cattle on busy road', 'Dead animals not removed', 'Monkeys destroying crops'],
    PUBLIC_TRANSPORT: ['Bus not stopping at designated stop', 'No bus service since months', 'Overcrowded buses', 'Auto-rickshaw refusing to go'],
    BUILDING_SAFETY: ['Cracks in building walls', 'Old building in danger of collapse', 'No fire exits in commercial building', 'Faulty elevator in public building'],
    FIRE_HAZARD: ['Gas cylinder explosion risk in shop', 'Electrical fire hazard in market', 'Burning waste near fuel station', 'No fire extinguisher in hospital'],
    OTHER: ['Unhygienic food being sold', 'Fraud by local contractor', 'Unauthorized shop blocking lane', 'Stagnant water causing mosquito breeding'],
};

function getRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack = 180): Date {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
    return d;
}

async function main() {
    console.log('🌱 Seeding complaints across all Indian states...');

    const complaintsToCreate: any[] = [];

    for (const { state, cities } of STATES_DATA) {
        const count = 4 + Math.floor(Math.random() * 5); // 4–8 per state
        for (let i = 0; i < count; i++) {
            const category = getRandom(CATEGORIES);
            const titles = TITLES[category] || TITLES['OTHER'];
            const createdAt = randomDate(180);
            const status = getRandom(STATUSES);
            const city = getRandom(cities);
            complaintsToCreate.push({
                title: getRandom(titles),
                description: `Complaint filed by citizen regarding ${category.replace(/_/g, ' ').toLowerCase()} issue in ${city}, ${state}. Immediate action required by the civic authority.`,
                category,
                severity: getRandom(SEVERITIES),
                status,
                state,
                city,
                district: getRandom(cities),
                contact: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
                email: `citizen${Math.floor(Math.random() * 99999)}@example.com`,
                createdAt,
                updatedAt: status === 'RESOLVED'
                    ? new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
                    : createdAt,
            });
        }
    }

    // Insert in batches of 50
    let inserted = 0;
    const BATCH = 50;
    for (let i = 0; i < complaintsToCreate.length; i += BATCH) {
        const batch = complaintsToCreate.slice(i, i + BATCH);
        await prisma.complaint.createMany({ data: batch });
        inserted += batch.length;
        console.log(`  ✅ Inserted ${inserted}/${complaintsToCreate.length} complaints`);
    }

    console.log(`\n🎉 Done! Seeded ${inserted} complaints across ${STATES_DATA.length} Indian states.`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
