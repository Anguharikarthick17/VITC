import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['SUPER_ADMIN', 'STATE_ADMIN', 'OFFICER']),
    state: z.string().optional(),
});

export const complaintSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
    category: z.enum([
        'ROAD_DAMAGE', 'WATER_SUPPLY', 'ELECTRICITY', 'SANITATION',
        'PUBLIC_SAFETY', 'NOISE_POLLUTION', 'ILLEGAL_CONSTRUCTION',
        'GARBAGE', 'TRAFFIC', 'STREET_LIGHTING', 'PARK_MAINTENANCE',
        'DRAINAGE_FLOODING', 'AIR_POLLUTION', 'ANIMAL_CONTROL',
        'PUBLIC_TRANSPORT', 'BUILDING_SAFETY', 'FIRE_HAZARD', 'OTHER',
    ]),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    state: z.string().min(2, 'State is required'),
    city: z.string().min(2, 'City is required'),
    address: z.string().min(5, 'Address is required'),
    contact: z.string().min(10, 'Valid contact number required').max(15),
    email: z.string().email('Invalid email address'),
});

export const updateComplaintSchema = z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED']).optional(),
    assignedToId: z.string().uuid().optional().nullable(),
    notes: z.string().optional(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});
