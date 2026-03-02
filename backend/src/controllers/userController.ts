import { Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth';

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                state: true,
                createdAt: true,
                _count: { select: { assignedComplaints: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getOfficers = async (req: Request, res: Response): Promise<void> => {
    try {
        const officers = await prisma.user.findMany({
            where: { role: { in: ['OFFICER', 'STATE_ADMIN'] } },
            select: { id: true, name: true, email: true, role: true, state: true },
            orderBy: { name: 'asc' },
        });

        res.json(officers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch officers' });
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { name, role, state } = req.body;

        const user = await prisma.user.update({
            where: { id },
            data: { name, role, state },
            select: { id: true, name: true, email: true, role: true, state: true },
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
