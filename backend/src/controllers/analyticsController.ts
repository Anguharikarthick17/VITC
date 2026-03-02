import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export const getSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const [total, pending, inProgress, resolved, escalated, critical] = await Promise.all([
            prisma.complaint.count(),
            prisma.complaint.count({ where: { status: 'PENDING' } }),
            prisma.complaint.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.complaint.count({ where: { status: 'RESOLVED' } }),
            prisma.complaint.count({ where: { status: 'ESCALATED' } }),
            prisma.complaint.count({ where: { severity: 'CRITICAL' } }),
        ]);

        res.json({ total, pending, inProgress, resolved, escalated, critical });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
};

export const getByState = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await prisma.complaint.groupBy({
            by: ['state'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        });

        res.json(data.map((d) => ({ state: d.state, count: d._count.id })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch state analytics' });
    }
};

export const getByCategory = async (_req: Request, res: Response): Promise<void> => {
    try {
        const data = await prisma.complaint.groupBy({
            by: ['category'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        });

        res.json(data.map((d) => ({ category: d.category, count: d._count.id })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category analytics' });
    }
};

export const getBySeverity = async (_req: Request, res: Response): Promise<void> => {
    try {
        const data = await prisma.complaint.groupBy({
            by: ['severity'],
            _count: { id: true },
        });

        res.json(data.map((d) => ({ severity: d.severity, count: d._count.id })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch severity analytics' });
    }
};

export const getDaily = async (req: Request, res: Response): Promise<void> => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const complaints = await prisma.complaint.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' },
        });

        const dailyMap: Record<string, number> = {};
        complaints.forEach((c) => {
            const day = c.createdAt.toISOString().split('T')[0];
            dailyMap[day] = (dailyMap[day] || 0) + 1;
        });

        const result = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch daily analytics' });
    }
};

export const getResolutionTime = async (req: Request, res: Response): Promise<void> => {
    try {
        const resolved = await prisma.complaint.findMany({
            where: { status: 'RESOLVED' },
            select: { createdAt: true, updatedAt: true },
        });

        if (resolved.length === 0) {
            res.json({ averageHours: 0, count: 0 });
            return;
        }

        const totalHours = resolved.reduce((acc, c) => {
            const diff = c.updatedAt.getTime() - c.createdAt.getTime();
            return acc + diff / (1000 * 60 * 60);
        }, 0);

        res.json({
            averageHours: Math.round((totalHours / resolved.length) * 10) / 10,
            count: resolved.length,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch resolution time' });
    }
};

// Location analytics: By City
export const getByCity = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await prisma.complaint.groupBy({
            by: ['city'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 20,
        });

        res.json(data.map((d) => ({ city: d.city, count: d._count.id })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch city analytics' });
    }
};

// Location analytics: By Address
export const getByAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await prisma.complaint.groupBy({
            by: ['address'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 20,
        });

        res.json(data.map((d) => ({ address: d.address, count: d._count.id })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch address analytics' });
    }
};

// Public: Summary for public dashboard (no auth)
export const getPublicSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const { state, city } = req.query;
        const where: any = {};
        if (state) where.state = state;
        if (city) where.city = { contains: city as string, mode: 'insensitive' };

        const [total, pending, inProgress, resolved, escalated] = await Promise.all([
            prisma.complaint.count({ where }),
            prisma.complaint.count({ where: { ...where, status: 'PENDING' } }),
            prisma.complaint.count({ where: { ...where, status: 'IN_PROGRESS' } }),
            prisma.complaint.count({ where: { ...where, status: 'RESOLVED' } }),
            prisma.complaint.count({ where: { ...where, status: 'ESCALATED' } }),
        ]);

        const byCategory = await prisma.complaint.groupBy({
            by: ['category'],
            where,
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        });

        const byState = await prisma.complaint.groupBy({
            by: ['state'],
            where,
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        });

        const recentResolved = await prisma.complaint.findMany({
            where: { ...where, status: 'RESOLVED' },
            select: { id: true, title: true, category: true, state: true, city: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
            take: 10,
        });

        res.json({
            stats: { total, pending, inProgress, resolved, escalated, resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0 },
            byCategory: byCategory.map((d) => ({ category: d.category, count: d._count.id })),
            byState: byState.map((d) => ({ state: d.state, count: d._count.id })),
            recentResolved,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch public summary' });
    }
};
