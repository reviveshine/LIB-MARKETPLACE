export class NotificationService {
  async sendNotification(userId, notification) {
    const channels = await this.getUserPreferences(userId);
    
    const promises = [];
    
    if (channels.email) {
      promises.push(this.sendEmail(userId, notification));
    }
    
    if (channels.sms) {
      promises.push(this.sendSMS(userId, notification));
    }
    
    if (channels.push) {
      promises.push(this.sendPushNotification(userId, notification));
    }
    
    // In-app notification always sent
    promises.push(this.sendInAppNotification(userId, notification));
    
    await Promise.all(promises);
  }

  async sendEmail(userId, notification) {
    const user = await this.getUser(userId);
    const template = this.getEmailTemplate(notification.type);
    
    await this.emailService.send({
      to: user.email,
      subject: template.subject,
      html: template.render(notification.data)
    });
  }

  async sendRealtimeNotification(userId, notification) {
    // Send through WebSocket if user is online
    const ws = this.connections.get(userId);
    if (ws) {
      ws.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
    }
  }
}