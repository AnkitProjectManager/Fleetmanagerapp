// SMS delivery is currently disabled; retained as a placeholder for future work.

class SmsService {
  async sendSms() {
    return {
      provider: 'disabled',
      sid: 'sms-disabled'
    };
  }
}

const smsService = new SmsService();
export default smsService;
