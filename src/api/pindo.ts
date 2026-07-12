import { PindoSMS, SMSPayload } from 'pindo-sms';

const pindoToken = process.env.PINDO_API_TOKEN;

// Ensure constructor doesn't throw if token is missing
const pindo = pindoToken ? new PindoSMS(pindoToken) : null;

const formatPhoneForPindo = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (!phone.startsWith('+')) {
    if (cleanPhone.startsWith('0')) {
      return '+250' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('250')) {
      return '+250' + cleanPhone;
    } else {
      return '+' + cleanPhone;
    }
  }
  return phone;
};

export const sendSMS = async (to: string, text: string) => {
  if (!pindoToken || !pindo) {
    return { status: 'mocked' };
  }

  try {
    const formattedTo = formatPhoneForPindo(to);
    const payload: SMSPayload = {
      to: formattedTo,
      text,
      sender: 'PindoTest', // Default sender ID
    };

    const response = await pindo.sendSMS(payload);
    return response;
  } catch (error: any) {
    console.error('[PindoLib] Failed to send SMS:', error);
    return { error: error.message || 'Unknown error' };
  }
};

