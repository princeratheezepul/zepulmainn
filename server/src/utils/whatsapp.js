import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Sends a WhatsApp message via Twilio.
 * Never throws — messaging failure should never break the calling flow.
 *
 * @param {string} phone       - Raw phone number (digits only, without country code)
 * @param {string} message     - Message body to send
 * @param {string} countryCode - Country code digits only (default '91' for India)
 * @returns {boolean}          - true if sent, false if failed
 */
export const sendWhatsAppMessage = async (phone, message, countryCode = '91') => {
  try {
    if (!phone) return false;

    const digits = phone.replace(/\D/g, '');
    if (!digits) return false;

    const to = `whatsapp:+${countryCode}${digits}`;
    const from = process.env.TWILIO_WHATSAPP_FROM;

    await client.messages.create({ from, to, body: message });
    console.log(`WhatsApp sent to ${to}`);
    return true;
  } catch (err) {
    console.error(`WhatsApp send failed for phone ${phone}:`, err.message);
    return false;
  }
};
