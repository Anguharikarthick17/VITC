import { Request, Response } from 'express';
import { PrismaClient, Severity, Status } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth';
import { notifyCriticalComplaint } from '../services/notificationService';

const prisma = new PrismaClient();

// Public: Create complaint
export const createComplaint = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, category, severity, state, city, address, contact, email } = req.body;

        const image = req.file ? req.file.filename : null;

        const complaint = await prisma.complaint.create({
            data: {
                title,
                description,
                category,
                severity,
                state,
                city,
                address,
                contact,
                email,
                image,
                status: Status.PENDING,
            },
        });

        // Log creation
        await prisma.complaintLog.create({
            data: {
                complaintId: complaint.id,
                action: 'Complaint submitted',
                performedById: null,
            },
        });

        // Auto-prioritize CRITICAL
        if (severity === Severity.CRITICAL) {
            notifyCriticalComplaint(complaint);
        }

        res.status(201).json({
            id: complaint.id,
            message: 'Complaint submitted successfully',
        });
    } catch (error) {
        console.error('Create complaint error:', error);
        res.status(500).json({ error: 'Failed to submit complaint' });
    }
};

// Public: Track complaint
export const trackComplaint = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const complaint = await prisma.complaint.findUnique({
            where: { id },
            include: {
                assignedTo: { select: { id: true, name: true, role: true } },
                logs: {
                    orderBy: { timestamp: 'desc' },
                    include: { performedBy: { select: { name: true, role: true } } },
                },
            },
        });

        if (!complaint) {
            res.status(404).json({ error: 'Complaint not found' });
            return;
        }

        res.json({
            id: complaint.id,
            title: complaint.title,
            category: complaint.category,
            severity: complaint.severity,
            status: complaint.status,
            state: complaint.state,
            city: complaint.city,
            address: complaint.address,
            assignedTo: complaint.assignedTo,
            createdAt: complaint.createdAt,
            updatedAt: complaint.updatedAt,
            timeline: complaint.logs.map((log) => ({
                action: log.action,
                performedBy: log.performedBy?.name || 'System',
                timestamp: log.timestamp,
            })),
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to track complaint' });
    }
};

// Public: Get public complaints with location filtering
export const getPublicComplaints = async (req: Request, res: Response): Promise<void> => {
    try {
        const { state, city, district, category, severity, page = '1', limit = '20' } = req.query;

        const where: any = {};
        if (state) where.state = state;
        if (city) where.city = { contains: city as string, mode: 'insensitive' };
        if (district) where.district = { contains: district as string, mode: 'insensitive' };
        if (category) where.category = category;
        if (severity) where.severity = severity;

        const pageNum = parseInt(page as string);
        const limitNum = Math.min(parseInt(limit as string), 50);
        const skip = (pageNum - 1) * limitNum;

        const [complaints, total] = await Promise.all([
            prisma.complaint.findMany({
                where,
                select: {
                    id: true, title: true, category: true, severity: true,
                    status: true, state: true, city: true, address: true,
                    createdAt: true, updatedAt: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma.complaint.count({ where }),
        ]);

        res.json({
            complaints,
            pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
};

// Admin: Get all complaints with filtering
export const getComplaints = async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    try {
        const { status, excludeStatus, severity, category, state, city, address, search, page = '1', limit = '20' } = req.query;

        const where: any = {};
        if (status) {
            where.status = status as Status;
        } else if (excludeStatus) {
            where.status = { not: excludeStatus as Status };
        }
        if (severity) where.severity = severity as Severity;
        if (category) where.category = category;
        if (state) where.state = state;
        if (city) where.city = { contains: city as string, mode: 'insensitive' };
        if (address) where.address = { contains: address as string, mode: 'insensitive' };
        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
                { id: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        // State admin only sees their state
        if (authReq.user?.role === 'STATE_ADMIN' && authReq.user?.state) {
            where.state = authReq.user.state;
        }

        // Officer only sees their assigned complaints
        if (authReq.user?.role === 'OFFICER') {
            where.assignedToId = authReq.user.id;
        }

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const [complaints, total] = await Promise.all([
            prisma.complaint.findMany({
                where,
                include: {
                    assignedTo: { select: { id: true, name: true } },
                },
                orderBy: [
                    { severity: 'desc' },
                    { createdAt: 'desc' },
                ],
                skip,
                take: limitNum,
            }),
            prisma.complaint.count({ where }),
        ]);

        res.json({
            complaints,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
};

// Admin: Get single complaint
export const getComplaint = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const complaint = await prisma.complaint.findUnique({
            where: { id },
            include: {
                assignedTo: { select: { id: true, name: true, role: true, email: true } },
                logs: {
                    orderBy: { timestamp: 'desc' },
                    include: { performedBy: { select: { name: true, role: true } } },
                },
            },
        });

        if (!complaint) {
            res.status(404).json({ error: 'Complaint not found' });
            return;
        }

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch complaint' });
    }
};

// Admin: Update complaint
export const updateComplaint = async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    try {
        const id = req.params.id as string;
        const { status, assignedToId, notes, severity } = req.body;

        const existing = await prisma.complaint.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Complaint not found' });
            return;
        }

        const updateData: any = {};
        const logActions: string[] = [];

        if (status && status !== existing.status) {
            updateData.status = status;
            logActions.push(`Status changed from ${existing.status} to ${status}`);
        }

        if (assignedToId !== undefined) {
            updateData.assignedToId = assignedToId;
            if (assignedToId) {
                const officer = await prisma.user.findUnique({ where: { id: assignedToId } });
                logActions.push(`Assigned to ${officer?.name || 'Unknown'}`);
            } else {
                logActions.push('Assignment removed');
            }
        }

        if (notes !== undefined) {
            updateData.notes = notes;
            logActions.push('Internal notes updated');
        }

        if (severity && severity !== existing.severity) {
            updateData.severity = severity;
            logActions.push(`Severity changed from ${existing.severity} to ${severity}`);
        }

        const complaint = await prisma.complaint.update({
            where: { id },
            data: updateData,
            include: {
                assignedTo: { select: { id: true, name: true } },
            },
        });

        // Create log entries
        for (const action of logActions) {
            await prisma.complaintLog.create({
                data: {
                    complaintId: id as string,
                    action,
                    performedById: authReq.user?.id || null,
                },
            });
        }

        res.json(complaint);
    } catch (error) {
        console.error('Update complaint error:', error);
        res.status(500).json({ error: 'Failed to update complaint' });
    }
};

// Super Admin: Delete complaint
export const deleteComplaint = async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    try {
        const id = req.params.id as string;

        const existing = await prisma.complaint.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Complaint not found' });
            return;
        }

        await prisma.complaintLog.create({
            data: {
                complaintId: id,
                action: 'Complaint deleted',
                performedById: authReq.user?.id,
            },
        });

        await prisma.complaint.delete({ where: { id } });
        res.json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete complaint' });
    }
};
