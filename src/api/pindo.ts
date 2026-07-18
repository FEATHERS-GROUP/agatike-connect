import { PindoSMS, SMSPayload } from "pindo-sms";

const pindoToken = process.env.PINDO_API_TOKEN;

// Ensure constructor doesn't throw if token is missing
const pindo = pindoToken ? new PindoSMS(pindoToken) : null;

const formatPhoneForPindo = (phone: string) => {
  if (!phone) return "";
  const cleanPhone = phone.replace(/\D/g, "");
  if (phone.startsWith("+")) {
    return "+" + cleanPhone;
  }
  if (cleanPhone.startsWith("0")) {
    return "+250" + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith("250") && cleanPhone.length <= 10) {
    // If it's a short number without 250, assume Rwanda
    return "+250" + cleanPhone;
  } else {
    // If it already has 250 or is a long number without +, just prepend +
    return "+" + cleanPhone;
  }
};

export const sendSMS = async (to: string, text: string, organizerId?: string) => {
  if (!pindoToken || !pindo) {
    return { status: "mocked" };
  }

  let phone = to;

  if (organizerId && (!phone || phone.trim() === "")) {
    try {
      const { hasuraRequest } = await import("./graphql.server");
      const query = `
        query GetOrgPhone($id: uuid!) {
          organizers_by_pk(id: $id) {
            phone
          }
        }
      `;
      const data = await hasuraRequest<{ organizers_by_pk: { phone: string } }>(query, { id: organizerId });
      if (data?.organizers_by_pk?.phone) {
        phone = data.organizers_by_pk.phone;
      }
    } catch (e) {
      console.error("Failed to fetch organizer phone", e);
    }
  }

  if (!phone) {
    return { error: "No phone number provided" };
  }

  try {
    const formattedTo = formatPhoneForPindo(phone);
    const payload: SMSPayload = {
      to: formattedTo,
      text,
      sender: "PindoTest", // Default sender ID
    };

    const response = await pindo.sendSMS(payload);
    return response;
  } catch (error: any) {
    console.error("[PindoLib] Failed to send SMS:", error);
    return { error: error.message || "Unknown error" };
  }
};
