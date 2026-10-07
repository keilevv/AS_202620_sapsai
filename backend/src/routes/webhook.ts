import express from 'express';
import { sendNotification } from '../services/NotificationService';
const router = express.Router();

// Simple endpoint for internal services (Python) to send notifications.
// In production, you'd protect this with a secret key.
router.post('/training-status', (req, res) => {
    const { status, message, model } = req.body;
    
    // Broadcast to all admins (userId = null)
    sendNotification(null, {
        id: Date.now().toString(),
        type: status === 'success' ? 'success' : 'error',
        title: `Training ${status}`,
        message: message,
        model: model,
        timestamp: new Date().toISOString(),
        read: false
    });

    res.status(200).json({ success: true });
});

export default router;
