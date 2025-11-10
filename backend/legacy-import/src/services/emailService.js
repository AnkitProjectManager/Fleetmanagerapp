// Legacy email delivery is disabled for now.

class EmailService {
  async sendEmail() {
    return { messageId: null, response: 'Email service disabled' };
  }
}

export default new EmailService();