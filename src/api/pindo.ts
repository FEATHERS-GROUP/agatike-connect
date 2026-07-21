import { PindoSMS, SMSPayload } from "pindo-sms";
import { COUNTRIES } from "@/lib/countries";
import { createServerFn } from "@tanstack/react-start";

const pindoToken = process.env.PINDO_API_TOKEN;

// Ensure constructor doesn't throw if token is missing
const pindo = pindoToken ? new PindoSMS(pindoToken) : null;

const formatPhoneForPindo = (phone: string, countryName?: string) => {
  if (!phone) return "";

  let formattedPhone = phone.replace(/\s+/g, "");

  if (!formattedPhone.startsWith("+") && countryName) {
    const countryObj = COUNTRIES.find((c) => c.name === countryName);
    if (countryObj && countryObj.dialCode) {
      if (formattedPhone.startsWith("0")) {
        formattedPhone = countryObj.dialCode + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith(countryObj.dialCode.replace("+", ""))) {
        formattedPhone = countryObj.dialCode + formattedPhone;
      } else {
        formattedPhone = "+" + formattedPhone;
      }
      return formattedPhone;
    }
  }

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
  let countryName = "";

  if (organizerId) {
    try {
      const { hasuraRequest } = await import("./graphql.server");
      const query = `
        query GetOrgPhone($id: uuid!) {
          organizers_by_pk(id: $id) {
            phone
            country
          }
        }
      `;
      const data = await hasuraRequest<{ organizers_by_pk: { phone: string; country?: string } }>(
        query,
        { id: organizerId },
      );
      if ((!phone || phone.trim() === "") && data?.organizers_by_pk?.phone) {
        phone = data.organizers_by_pk.phone;
      }
      if (data?.organizers_by_pk?.country) {
        countryName = data.organizers_by_pk.country;
      }
    } catch (e) {
      console.error("Failed to fetch organizer info", e);
    }
  }

  if (!phone) {
    return { error: "No phone number provided" };
  }

  try {
    const formattedTo = formatPhoneForPindo(phone, countryName);
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

export const sendSMSServer = createServerFn({ method: "POST" })
  .validator((d: { to: string; text: string; organizerId?: string }) => d)
  .handler(async (ctx) => {
    return await sendSMS(ctx.data.to, ctx.data.text, ctx.data.organizerId);
  });
