import { EventEmitter } from 'events';

export const notificationEmitter = new EventEmitter();

export function sendNotification(userId: string | null, message: any) {
  notificationEmitter.emit('notification', { userId, message });
}
