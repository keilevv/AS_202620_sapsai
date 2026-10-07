import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { notificationEmitter } from '../services/NotificationService';

const router = express.Router();

router.get('/stream', authenticateToken, (req: any, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const userId = req.user.id;
    const role = req.user.role;

    const listener = (event: any) => {
        if (event.userId === userId || (event.userId === null && role === 'ADMIN')) {
            res.write(`data: ${JSON.stringify(event.message)}\n\n`);
        }
    };

    notificationEmitter.on('notification', listener);

    req.on('close', () => {
        notificationEmitter.off('notification', listener);
    });
});

export default router;
